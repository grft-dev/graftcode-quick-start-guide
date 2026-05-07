---
title: "JavaScript"
description: "Challenge 2 — turn a JavaScript module into a remotely callable lottery service with Graftcode Gateway. No controllers, no REST, no specs."
---

## Goal

Expose your own **lottery service** built in JavaScript — any public method becomes instantly callable from any language, no controllers, no REST routes, no OpenAPI specs.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally

## Step 1. Create a project folder

```bash
mkdir js-lottery-service
cd js-lottery-service
npm init -y
```

## Step 2. Write the lottery module

Create `index.js`:

```javascript
const pool = new Map();

class Lottery {
  static addTicket(email) {
    const next = (pool.get(email) ?? 0) + 1;
    pool.set(email, next);
    return next;
  }
}

module.exports = { Lottery };
```

A plain JS class. Any public method becomes remotely callable once hosted.

## Step 3. Host it with Graftcode Gateway

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
docker build --no-cache --pull -t lottery-service-js:test .
docker run -d -p 80:80 -p 81:81 --name lottery_demo_js lottery-service-js:test
```

`gg` reads `package.json`, discovers `Lottery.addTicket(email)`, and exposes it. Port `80` handles service calls, port `81` serves Graftcode Vision.

## Step 4. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Lottery.addTicket` listed — hit **Try it out**, pass your email, and watch the ticket count grow.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass it to the gateway:

```dockerfile
CMD ["gg", "./package.json", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), access control, and an [MCP endpoint](https://modelcontextprotocol.io/) for free.

> One Dockerfile, no API design. Your `Lottery.addTicket(email)` is now callable from any app, in any language.
