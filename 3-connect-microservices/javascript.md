---
title: "JavaScript"
description: "Challenge 3 — call the central Lottery service from another JavaScript service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the central **Lottery service** (built and hosted by us) from your own JavaScript backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally

## Step 1. Create a project

```bash
mkdir js-lottery-consumer
cd js-lottery-consumer
npm init -y
```

## Step 2. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `npm`, and copy the install command. The Lottery service is published by us as a strongly-typed Graft you can install like any other npm package.

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-lottery@1.0.0
```

## Step 3. Call the lottery method

Create `index.js`:

```javascript
const { GraftConfig, Lottery } = require("@graft/nuget-lottery");

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

(async () => {
  const tickets = await Lottery.AddTicket("you@example.com");
  console.log(`Challenge 3 complete — tickets in pool: ${tickets}`);
})();
```

Run it:

```bash
node index.js
```

`Lottery.AddTicket(...)` is a remote call but reads like a normal function call. Your IDE autocompletes it because the Graft is a real npm package.

## Step 4. Use a Project Key for production

For real-world use, create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> No REST clients, no DTOs, no spec syncing — just `npm install` and call.
