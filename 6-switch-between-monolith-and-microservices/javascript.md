---
title: "JavaScript"
description: "Challenge 6 — run two JavaScript modules as a monolith, then split one off as a microservice. Switch back and forth with one environment variable."
---

## Goal

Start with two JavaScript modules — `LotteryService` and `TicketCounter` — running as a monolith. Extract `TicketCounter` into a standalone microservice. Then flip between monolith and microservice with **one environment variable** — zero code changes from then on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally

## Step 1. Create the project

```bash
mkdir js-lottery-platform
cd js-lottery-platform
npm init -y
```

## Step 2. Write the two modules

Create `src/ticketCounter.js`:

```javascript
const pool = new Map();

class TicketCounter {
  static addTicket(email) {
    const next = (pool.get(email) ?? 0) + 1;
    pool.set(email, next);
    return next;
  }
}

module.exports = { TicketCounter };
```

Create `index.js`:

```javascript
const { TicketCounter } = require("./src/ticketCounter");

class LotteryService {
  static enter(email) {
    return TicketCounter.addTicket(email);
  }
}

module.exports = { LotteryService };
```

A regular `require` — direct in-process call. No Graftcode involved yet.

## Step 3. Host as a monolith

Create a `Dockerfile`:

```dockerfile
FROM node:24
WORKDIR /usr/app
COPY . /usr/app/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "./package.json"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-platform-js:test .
docker run -d -p 80:80 -p 81:81 --name lottery_platform lottery-platform-js:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `LotteryService.enter("you@example.com")`. Both modules run inside one container.

## Step 4. Run TicketCounter as a standalone service

Create `src/ticketCounter.package.json`:

```json
{
  "name": "ticket-counter",
  "version": "1.0.0",
  "main": "ticketCounter.js"
}
```

Create `Dockerfile.ticketCounter`:

```dockerfile
FROM node:24
WORKDIR /usr/app
COPY ./src/ticketCounter.js /usr/app/
COPY ./src/ticketCounter.package.json /usr/app/package.json

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "./package.json", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

```bash
docker build --no-cache --pull -f Dockerfile.ticketCounter -t ticket-counter-js:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name ticket_counter ticket-counter-js:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `TicketCounter` is now its own service.

## Step 5. Connect through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the npm install command:

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/YOUR_KEY__free @graft/npm-ticket-counter@1.0.0
```

Update `index.js` — the **only code change** in the entire tutorial:

```javascript
const { GraftConfig, TicketCounter } = require("@graft/npm-ticket-counter");

GraftConfig.setConfig(process.env.GRAFT_CONFIG);

class LotteryService {
  static async enter(email) {
    return await TicketCounter.addTicket(email);
  }
}

module.exports = { LotteryService };
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 6. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-js:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=@graft/npm-ticket-counter;modules=./modules;runtime=nodejs;host=ws://ticket_counter:90/ws" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-js:test
```

Call `LotteryService.enter` in Vision — same result, but the call now hits a remote container.

## Step 7. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=@graft/npm-ticket-counter;modules=./modules;runtime=nodejs;host=inMemory" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-js:test
```

```text
# Monolith:    host=inMemory
# Microservice: host=ws://ticket_counter:90/ws
```

Same image, same code — just one env var.

## Step 8. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass `--projectKey YOUR_PROJECT_KEY` to each gateway. You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Extracting a module from a monolith is no longer a rewrite — it's one import change followed by a configuration switch.
