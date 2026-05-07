---
title: "JavaScript"
description: "Challenge 2 — expose your own JavaScript booth service that internally calls the central Lottery service. Compose remote services like local code."
---

## Goal

Build your own JavaScript backend service that **internally calls the central Lottery service** (built and hosted by us) to add tickets, then expose your service through Graftcode Gateway. Same `gg` workflow on both sides — you're a Graft consumer **and** a Graftcode producer at once.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally

## Step 1. Create a project folder

```bash
mkdir js-booth-service
cd js-booth-service
npm init -y
```

## Step 2. Install the Lottery Graft

The central Lottery service is implemented and hosted by us. Install its Graft so your booth code can call `Lottery.AddTicket(email)` directly:

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-lottery@1.0.0
```

## Step 3. Write the booth module

Create `index.js`:

```javascript
const { Lottery, GraftConfig } = require("@graft/nuget-lottery");

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

class Booth {
  static async checkIn(email) {
    const tickets = await Lottery.AddTicket(email);
    return `Welcome ${email}! Total tickets in pool: ${tickets}`;
  }
}

module.exports = { Booth };
```

`Booth.checkIn(email)` is your method. Inside, it calls the remote `Lottery.AddTicket(email)` like a normal JS call — no REST client, no DTOs.

## Step 4. Host with Graftcode Gateway

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

CMD ["gg", "./package.json", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-service-js:test .
docker run -d -p 80:80 -p 81:81 --name booth_demo_js booth-service-js:test
```

Inside the container, `gg` exposes `Booth.checkIn`. Your code reaches across the network to the central Lottery for every call.

## Step 5. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Booth.checkIn` — hit **Try it out**, pass your email, and the response shows your total ticket count from the central Lottery.

> Your booth is both a producer (its `Booth.checkIn` is callable) and a consumer (it calls remote `Lottery.AddTicket`). Same `gg` workflow on both sides — no REST, no DTOs, no client code.
