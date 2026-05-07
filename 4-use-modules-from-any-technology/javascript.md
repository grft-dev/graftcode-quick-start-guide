---
title: "JavaScript"
description: "Challenge 4 — embed the Python edition of the Lottery module directly in your JavaScript app. No REST wrapper, no rewrite — runs in-process."
---

## Goal

We publish the **Lottery** logic in multiple languages so you can either call it remotely (Tutorials 1–3) or embed it directly in your process. Here you'll use the Python edition of Lottery from a JavaScript app — same `Lottery.AddTicket(email)` API, but executed in-memory inside your Node.js process.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally
- [Python](https://www.python.org/) installed locally

## Step 1. Create a project folder

```bash
mkdir js-lottery-demo
cd js-lottery-demo
npm init -y
```

## Step 2. Install the cross-language Graft

The Lottery module ships as a Python package. Graftcode lets you consume it as an npm package:

```bash
npm install hypertube-nodejs-sdk hypertube-binaries
npm install --registry https://grft.dev/ @graft/pypi-lottery
python -m pip install lottery --target ./
```

`pip install --target ./` puts the actual Python module next to your project so Graftcode can run it in-process.

## Step 3. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 4. Run Lottery in-process

Create `index.js`:

```javascript
const { GraftConfig, Lottery } = require("@graft/pypi-lottery");

GraftConfig.host = "inMemory";

(async () => {
  const tickets = await Lottery.AddTicket("you@example.com");
  console.log(`Challenge 4 complete — local tickets: ${tickets}`);
})();
```

Run it:

```bash
node index.js
```

`Lottery.AddTicket(...)` comes from a Python package, but reads like a normal JS call. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the Python Lottery module inside your Node.js process — your tickets are tracked locally, not in the central pool.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Technology choice stops being an integration constraint — same Lottery API, embedded in your process from a Python package.
