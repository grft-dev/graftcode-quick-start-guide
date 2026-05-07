---
title: "JavaScript"
description: "Challenge 4 — use a Python lottery module directly from JavaScript with Graftcode. No REST wrapper, no rewrite. The module runs in-process."
---

## Goal

Use the **Challenge 4 lottery module** — published as a Python package — directly from JavaScript as if it were a native npm module. The module runs in-process; no REST wrapper, no rewrite.

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

Challenge 4 is shipped as a Python package, but you can consume it as an npm package thanks to Graftcode:

```bash
npm install hypertube-nodejs-sdk hypertube-binaries
npm install --registry https://grft.dev/ @graft/pypi-lotterychallenge4
python -m pip install lotterychallenge4 --target ./
```

`pip install --target ./` puts the actual Python module next to your project so Graftcode can run it in-process.

## Step 3. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 4. Call the lottery module in-process

Create `index.js`:

```javascript
const { GraftConfig, Challenge4 } = require("@graft/pypi-lotterychallenge4");

GraftConfig.host = "inMemory";

(async () => {
  const tickets = await Challenge4.AddTickets("you@example.com");
  console.log(`Challenge 4 complete — tickets in pool: ${tickets}`);
})();
```

Run it:

```bash
node index.js
```

`Challenge4.AddTickets(...)` comes from a Python package, but reads like a normal JS function call. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the Python module inside the same process.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Technology choice stops being an integration constraint — keep writing JavaScript and use any module from any ecosystem.
