---
title: "JavaScript"
description: "Connect one backend service to another from JavaScript by installing a typed Graft and calling remote methods like normal code."
---

## Goal

Connect a JavaScript backend to another service with Graftcode so the remote integration stays typed and looks like a normal method call.

### What You'll See

- Install a remote service as an `npm` dependency.
- Configure the generated client from your backend.
- Call a remote method from your own service logic.

## Step 1. Find the remote method in Graftcode Vision

Open the hosted Graftcode Vision portal and locate `MeterLogic.NetConsumptionKWh`.

Graftcode Vision shows the method signature and gives you the exact package manager command needed to install that service as a Graft.

## Step 2. Install the Graft in your JavaScript service

```bash
npm install javonet-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-energypriceservice@1.2.0
```

This adds the generated client for the remote service to your project.

## Step 3. Configure the connection

In your service file, import the generated client and point it at the remote host:

```javascript
const {
  GraftConfig,
  MeterLogic,
} = require("@graft/nuget-energypriceservice");

GraftConfig.host =
  "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
```

## Step 4. Call the remote method from your own code

```javascript
class EnergyPriceCalculator {
  static getPrice() {
    return Math.floor(Math.random() * 5) + 100;
  }

  static async getMyCurrentCost(previousReadingKwh, currentReadingKwh) {
    const consumption = await MeterLogic.NetConsumptionKWh(
      previousReadingKwh,
      currentReadingKwh
    );

    return consumption * EnergyPriceCalculator.getPrice();
  }
}

module.exports = { EnergyPriceCalculator };
```

The important part is `MeterLogic.NetConsumptionKWh(...)`. It is a remote call, but your JavaScript code still reads like a local dependency.

## Step 5. Rebuild and test

If this service is hosted through Graftcode Gateway, restart it and open its Graftcode Vision page.

Run `getMyCurrentCost` with sample values such as `100` and `150`.

> This is the same Graftcode model as frontend-to-backend integration: install the service as a dependency, configure the host, and call methods directly. No REST client layer is required between your services.
