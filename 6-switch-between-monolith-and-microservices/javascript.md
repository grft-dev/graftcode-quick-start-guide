---
title: "JavaScript"
description: "Challenge 6 — run two JavaScript modules as a monolith, then split one off as a microservice. Both topologies still call the central Lottery service."
---

## Goal

Build two JavaScript modules — `Booth` (orchestrator) and `LotterySubmitter` (which calls the central **Lottery** service hosted by us). Run them as a monolith first. Then extract `LotterySubmitter` into a standalone microservice and switch between monolith and microservice with **one environment variable** — zero code changes from then on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally

## Step 1. Create the project

```bash
mkdir js-lottery-platform
cd js-lottery-platform
npm init -y
```

## Step 2. Install the Lottery Graft

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-lottery@1.0.0
```

## Step 3. Write the two modules

Create `src/lotterySubmitter.js`:

```javascript
const { Lottery, GraftConfig } = require("@graft/nuget-lottery");

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

class LotterySubmitter {
  static async submit(email) {
    return await Lottery.AddTicket(email);
  }
}

module.exports = { LotterySubmitter };
```

Create `index.js`:

```javascript
const { LotterySubmitter } = require("./src/lotterySubmitter");

class Booth {
  static async checkIn(email) {
    const tickets = await LotterySubmitter.submit(email);
    return `Welcome ${email}! Total tickets in pool: ${tickets}`;
  }
}

module.exports = { Booth };
```

`Booth.checkIn` calls `LotterySubmitter.submit` directly. `LotterySubmitter` calls the central `Lottery.AddTicket` over WebSocket.

## Step 4. Host as a monolith

Create `Dockerfile`:

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

Open [http://localhost:81/GV](http://localhost:81/GV) and call `Booth.checkIn("you@example.com")`. Both modules run inside one container; the central Lottery is reached over the network.

## Step 5. Run LotterySubmitter as a standalone service

Create `src/submitter.package.json`:

```json
{
  "name": "lottery-submitter",
  "version": "1.0.0",
  "main": "lotterySubmitter.js",
  "dependencies": {
    "@graft/nuget-lottery": "1.0.0",
    "hypertube-nodejs-sdk": "*"
  }
}
```

Create `Dockerfile.submitter`:

```dockerfile
FROM node:24
WORKDIR /usr/app
COPY ./src/lotterySubmitter.js /usr/app/
COPY ./src/submitter.package.json /usr/app/package.json
COPY ./node_modules /usr/app/node_modules

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "./package.json", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

```bash
docker build --no-cache --pull -f Dockerfile.submitter -t lottery-submitter-js:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name lottery_submitter lottery-submitter-js:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `LotterySubmitter` is now its own service that still talks to the central Lottery internally.

## Step 6. Connect Booth through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the npm install command for the new submitter service:

```bash
npm install --registry https://grft.dev/YOUR_KEY__free @graft/npm-lotterysubmitter@1.0.0
```

Update `index.js` — the **only code change** in the entire tutorial:

```javascript
const { GraftConfig, LotterySubmitter } = require("@graft/npm-lotterysubmitter");

GraftConfig.setConfig(process.env.GRAFT_CONFIG);

class Booth {
  static async checkIn(email) {
    const tickets = await LotterySubmitter.submit(email);
    return `Welcome ${email}! Total tickets in pool: ${tickets}`;
  }
}

module.exports = { Booth };
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 7. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-js:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=@graft/npm-lotterysubmitter;modules=./modules;runtime=nodejs;host=ws://lottery_submitter:90/ws" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-js:test
```

Call `Booth.checkIn` in Vision — same result. The chain is now Booth (container A) → LotterySubmitter (container B) → central Lottery.

## Step 8. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=@graft/npm-lotterysubmitter;modules=./modules;runtime=nodejs;host=inMemory" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-js:test
```

```text
# Monolith:    host=inMemory                       (LotterySubmitter in Booth's process)
# Microservice: host=ws://lottery_submitter:90/ws  (LotterySubmitter is remote)
```

Same image, same code — just one env var. The central Lottery is always remote either way.

## Step 9. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass `--projectKey YOUR_PROJECT_KEY` to each gateway. You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Splitting `LotterySubmitter` out of the monolith is no longer a rewrite — it's one import change followed by a configuration switch.
