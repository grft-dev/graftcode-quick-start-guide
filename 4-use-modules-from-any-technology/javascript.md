---
title: "JavaScript"
description: "Challenge 4 — embed the Python edition of the Lottery module directly in your JavaScript app. No REST wrapper, no rewrite — runs in-process."
---

## Goal

We publish the **Lottery** logic in multiple languages so you can either call it remotely (Tutorials 1–3) or embed it directly in your process. Here you'll use the Python edition of Lottery from a JavaScript app — same `Lottery.AddTicket(email)` API, but executed in-memory inside your Node.js process.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally
- [Python](https://www.python.org/) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll embed the Lottery module from another language directly in your process — same API, runs in-memory.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create a project folder

```bash
mkdir js-lottery-demo
cd js-lottery-demo
npm init -y
```

## Step 4. Install the cross-language Graft

The Lottery module ships as a Python package. Graftcode lets you consume it as an npm package:

```bash
npm install hypertube-nodejs-sdk hypertube-binaries
npm install --registry https://grft.dev/ @graft/pypi-lottery
python -m pip install lottery --target ./
```

`pip install --target ./` puts the actual Python module next to your project so Graftcode can run it in-process.

## Step 5. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 6. Run Lottery in-process

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

> Technology choice stops being an integration constraint — same Lottery API, embedded in your process from a Python package.
