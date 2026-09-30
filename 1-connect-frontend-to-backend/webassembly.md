---
title: "WebAssembly"
description: "Connect a WebAssembly frontend to a live backend service with Graftcode - no REST clients, no DTOs, no handwritten integration code. Install a strongly typed Graft and call backend methods from an AssemblyScript module."
---

## Goal

Connect a WebAssembly app to backend logic with Graftcode - no REST clients, no DTOs, no handwritten integration code.

### What You'll See

- Install a typed Graft from a live backend service instead of writing REST client code.
- Configure the generated client to point at a sample backend server.
- Call a backend method from an AssemblyScript module, with the WebSocket client living in the page script.
- Use IDE autocompletion on backend methods and types - powered by the installed Graft package.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally

## Step 1. Start with a WebAssembly app

This gives you a working AssemblyScript app, served by Vite, where you can add your first Graft.

```bash
git clone https://github.com/grft-dev/webassembly-hello-world
cd webassembly-hello-world
npm install
```

## Step 2. Open the backend in Graftcode Vision

Before you install anything, compare the two views of the same backend:

- [Swagger](https://g-d-ca-polc-demo-ecws-01.nicedesert-fa74799d.polandcentral.azurecontainerapps.io/swagger/index.html) shows routes, verbs, and payloads.
- [Graftcode Vision](https://g-d-ca-polc-demo-ecbe-01.nicedesert-fa74799d.polandcentral.azurecontainerapps.io) shows public classes and methods and gives you the package manager command to install them.

This is the key Graftcode shift: instead of reading an API spec and building a client, you install the service as a dependency and call methods directly.

## Step 3. Install the Graft

Open [Graftcode Vision](https://g-d-ca-polc-demo-ecbe-01.nicedesert-fa74799d.polandcentral.azurecontainerapps.io), pick `npm`, and copy the generated install command.

```bash
npm install --registry https://grft.dev/11ee1b4f-1a87-4b7d-9112-1ada3ad69b9e__free @graft/nuget-energypriceservice@1.3.0
```

The command above is a snapshot for this guide. The registry UUID and package version can change - always prefer the install command currently shown in Graftcode Vision.

## Step 4. Configure the generated client

The published Graft is a JavaScript package and it opens a WebSocket. That client stays in the page script, because a WebAssembly module cannot open that socket itself. The module still owns the call: it chooses the method arguments and invokes a host import.

Open `assembly/index.ts` and declare that import:

```typescript
@external("env", "calculateMonthlyBill")
declare function calculateMonthlyBill(consumption: f64, price: f64, tax: f64): void;
```

Open `src/main.js` and connect the generated client to the service host. The exact configuration snippet for your language is available in [Graftcode Vision](https://g-d-ca-polc-demo-ecbe-01.nicedesert-fa74799d.polandcentral.azurecontainerapps.io) under the **Configuration** installation tab:

```javascript
import { instantiate } from "@assemblyscript/loader";
import { BillingLogic, GraftConfig } from "@graft/nuget-energypriceservice";

GraftConfig.host = "wss://g-d-ca-polc-demo-ecbe-01.nicedesert-fa74799d.polandcentral.azurecontainerapps.io/ws";
```

`@graft/nuget-energypriceservice` is the Graft you installed - it exposes the backend's public classes and methods as normal JavaScript imports. Setting `GraftConfig.host` tells the client where the backend is running. `@assemblyscript/loader` instantiates `public/bill.wasm` and supplies the `env.calculateMonthlyBill` function the module declared.

## Step 5. Call a backend method

`BillingLogic` is a class from the backend, and `calculateMonthlyBill(...)` is one of its public methods - the same ones you browsed in Graftcode Vision. The npm Graft uses **camelCase** method names even when the backend or Vision shows PascalCase from C#.

Replace `assembly/index.ts` so the module requests the bill:

```typescript
@external("env", "calculateMonthlyBill")
declare function calculateMonthlyBill(consumption: f64, price: f64, tax: f64): void;

export function requestMonthlyBill(): void {
  calculateMonthlyBill(88.4, 1.4, 23);
}
```

Replace `src/main.js` so the host import performs the Graft call and writes the result into `#bill`:

```javascript
import { instantiate } from "@assemblyscript/loader";
import { BillingLogic, GraftConfig } from "@graft/nuget-energypriceservice";

GraftConfig.host = "wss://g-d-ca-polc-demo-ecbe-01.nicedesert-fa74799d.polandcentral.azurecontainerapps.io/ws";

const bill = document.querySelector("#bill");

const { exports } = await instantiate(fetch("/bill.wasm"), {
  env: {
    calculateMonthlyBill(consumption, price, tax) {
      BillingLogic.calculateMonthlyBill(consumption, price, tax).then((result) => {
        bill.textContent = `Calculated Energy Monthly Bill is: ${result.toFixed(2)}`;
      });
    },
  },
});

exports.requestMonthlyBill();
```

`requestMonthlyBill` runs inside the module and passes `88.4`, `1.4`, and `23` to the host. The page script forwards those arguments to `BillingLogic.calculateMonthlyBill` and renders the amount when the WebSocket call returns.

## Step 6. Run the app

Start the development server:

```bash
npm run dev
```

In this starter, `npm run dev` compiles `assembly/index.ts` to `public/bill.wasm`, then starts Vite. Open the URL shown in the terminal (typically [http://localhost:5173](http://localhost:5173)). If that port is already in use (for example another Vite app), Vite picks the next free port - use the URL printed in the terminal. You should see the calculated energy bill rendered on the page.

Run `npm run dev` again after later edits to `assembly/index.ts`. The module is compiled when that script starts.

If something is not working, expand below to see the full source:

<collapsible title="Full assembly/index.ts code">

```typescript
@external("env", "calculateMonthlyBill")
declare function calculateMonthlyBill(consumption: f64, price: f64, tax: f64): void;

export function requestMonthlyBill(): void {
  calculateMonthlyBill(88.4, 1.4, 23);
}
```

</collapsible>

<collapsible title="Full src/main.js code">

```javascript
import { instantiate } from "@assemblyscript/loader";
import { BillingLogic, GraftConfig } from "@graft/nuget-energypriceservice";

GraftConfig.host = "wss://g-d-ca-polc-demo-ecbe-01.nicedesert-fa74799d.polandcentral.azurecontainerapps.io/ws";

const bill = document.querySelector("#bill");

const { exports } = await instantiate(fetch("/bill.wasm"), {
  env: {
    calculateMonthlyBill(consumption, price, tax) {
      BillingLogic.calculateMonthlyBill(consumption, price, tax).then((result) => {
        bill.textContent = `Calculated Energy Monthly Bill is: ${result.toFixed(2)}`;
      });
    },
  },
});

exports.requestMonthlyBill();
```

</collapsible>

## Step 7. Explore more methods and keep up with backend changes

Go back to [Graftcode Vision](https://g-d-ca-polc-demo-ecbe-01.nicedesert-fa74799d.polandcentral.azurecontainerapps.io) to inspect more methods on `BillingLogic`.

Your IDE can autocomplete available methods and arguments because the service is installed as a typed package, not consumed through handwritten API code. Your AI can now generate frontend code using backend methods as easily as using other npm modules you imported.

When the backend evolves - new methods, changed signatures, updated types - the Graft package version updates just like any other npm package. You see the change in your `package.json`, update with a single command, and your IDE immediately reflects the new API surface:

```bash
npm update @graft/nuget-energypriceservice
```

No need to regenerate clients, rewrite fetch calls, or re-sync OpenAPI specs. Backend changes flow through the same package manager workflow you already use for every other dependency.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Connecting a frontend to a backend typically requires:

- Designing REST or GraphQL endpoints on the backend for every operation
- Defining request and response DTOs and validation logic
- Generating or hand-writing a client SDK for the frontend
- Mapping API responses back to frontend types manually
- Updating and re-testing the client every time the backend changes
- Maintaining separate documentation or OpenAPI specs for the API contract

### With Graftcode

- Install the backend as a strongly-typed Graft via `npm install`
- Call methods from your WebAssembly module through a host import
- When the backend changes, update the Graft with a single `npm install` command - no client rewrites

> With Graftcode, connecting a WebAssembly frontend to any backend is as simple as installing an npm package. No REST clients, no DTOs, no contract maintenance - just import and call.

![Old Way vs Graftcode](../assets/CompareOldWaysNewWays.png)

</collapsible>
