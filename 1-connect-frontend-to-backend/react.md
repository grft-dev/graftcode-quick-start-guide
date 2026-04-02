---
title: "React"
description: "Connect a React frontend to backend logic with Graftcode by installing a typed Graft, configuring the generated client, and calling backend methods directly from your component."
---

## Goal

Connect a React app to backend logic with Graftcode without building REST clients, mapping DTOs, or maintaining integration code by hand.

### What You'll See

- Install a typed Graft from a live backend service instead of writing REST client code.
- Configure the generated client to call our sample backend server.
- Call a backend method directly from your component like calling local dependency.

## Step 1. Start with a React app

```bash
git clone https://github.com/grft-dev/react-hello-world
cd react-hello-world
npm install
```

This gives you a working React app where you can add your first Graft.

## Step 2. Open the backend in Graftcode Vision

Before you install anything, compare the two views of the same backend:

- [Swagger](https://gc-d-ca-polc-demo-ecws-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/swagger/index.html) shows routes, verbs, and payloads.
- [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io) shows public classes and methods and gives you the package manager command to install them.

This is the key Graftcode shift: instead of reading an API spec and building a client, you install the service as a dependency and call methods directly.

## Step 3. Install the Graft

```bash
npm install javonet-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-energypriceservice@1.2.0
```

Open Graftcode Vision, pick `npm`, and copy the generated install command.

`javonet-nodejs-sdk` is still required for this example today, but that extra step is temporary.

## Step 4. Configure the generated client

Open `src/App.jsx` and connect the generated client to the service host:

```javascript
import { useEffect, useState } from "react";
//This line imports Graft module you installed with npm
import { BillingLogic, GraftConfig } from "@graft/nuget-energypriceservice";

//This line configure Graft to call our sample backend.
GraftConfig.host =
  "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
```

The installed package exposes the backend's public classes and methods as normal JavaScript imports.

## Step 5. Call a backend method

```javascript
function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    BillingLogic.CalculateMonthlyBill(88.4, 1.4, 23).then(setData);
  }, []);

  return <h1>Calculated Energy Monthly Bill is: {data?.toFixed(2)}</h1>;
}

export default App;
```

`BillingLogic.CalculateMonthlyBill(...)` is a backend call, but in your code it feels like a normal dependency.

## Step 6. Explore more methods

Run the app and then go back to Graftcode Vision to inspect more methods on `BillingLogic`.

Your IDE can autocomplete available methods and arguments because the service is installed as a typed package, not consumed through handwritten API code. Your AI can now generate frontend code using backend methods as easily as using other npm modules you imported.

> With Graftcode, the main workflow is: expose public methods, install the generated Graft, and call those methods directly. Whenever backend evolves you just update your imported npm modules. That removes the usual client-generation and maintenance work between frontend and backend.
