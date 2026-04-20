---
title: "Angular"
description: "Connect an Angular frontend to a live backend service with Graftcode - no REST clients, no DTOs, no handwritten integration code. Install a strongly typed Graft and call backend methods directly from your component."
---

## Goal

Connect an Angular app to backend logic with Graftcode - no REST clients, no DTOs, no handwritten integration code.

### What You'll See

- Install a typed Graft from a live backend service instead of writing REST client code.
- Configure the generated client to point at a sample backend server.
- Call a backend method directly from an Angular component as if it were local code.
- Use IDE autocompletion on backend methods and types - powered by the installed Graft package.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally
- [Angular CLI](https://angular.dev/tools/cli) installed (`npm install -g @angular/cli`)

## Step 1. Start with an Angular app

This gives you a working Angular app where you can add your first Graft.

```bash
git clone https://github.com/grft-dev/angular-hello-world
cd angular-hello-world
npm install
```

## Step 2. Open the backend in Graftcode Vision

Before you install anything, compare the two views of the same backend:

- [Swagger](https://gc-d-ca-polc-demo-ecws-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/swagger/index.html) shows routes, verbs, and payloads.
- [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io) shows public classes and methods and gives you the package manager command to install them.

This is the key Graftcode shift: instead of reading an API spec and building a client, you install the service as a dependency and call methods directly.

## Step 3. Install the Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `npm`, and copy the generated install command.

`hypertube-nodejs-sdk` is still required for this example today, but that extra step is temporary.

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-energypriceservice@1.2.0
```

## Step 4. Configure the generated client

Open `src/app/app.component.ts` and connect the generated client to the service host. The exact configuration snippet for your language is available in [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io) under the **Configuration** installation tab:

```typescript
import { Component, OnInit } from "@angular/core";
import { BillingLogic, GraftConfig } from "@graft/nuget-energypriceservice";

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
```

`@graft/nuget-energypriceservice` is the Graft you installed - it exposes the backend's public classes and methods as normal TypeScript imports. Setting `GraftConfig.host` tells the client where the backend is running.

## Step 5. Call a backend method

`BillingLogic` is a class from the backend, and `CalculateMonthlyBill(...)` is one of its public methods - the same ones you browsed in Graftcode Vision. You call it like any other imported function.

The Graft client can resolve **outside Angular's usual change-detection timing** (for example when the transport uses WebSockets). If the UI stays on `loading...` while the value is correct in the console, hold the displayed value in a **`signal`** and call **`set(...)`** when the promise resolves. Signal updates schedule a template refresh reliably in modern Angular.

Add `signal` to your `@angular/core` import, then use:

```typescript
import { Component, OnInit, signal } from "@angular/core";
import { BillingLogic, GraftConfig } from "@graft/nuget-energypriceservice";

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

@Component({
  selector: "app-root",
  standalone: true,
  template: `<h1>Calculated Energy Monthly Bill is: {{ bill() }}</h1>`,
})
export class AppComponent implements OnInit {
  readonly bill = signal("loading...");

  async ngOnInit() {
    const result = await BillingLogic.CalculateMonthlyBill(88.4, 1.4, 23);
    this.bill.set(result.toFixed(2));
  }
}
```

## Step 6. Run the app

Start the development server:

```bash
ng serve
```

Open the URL shown in the terminal (typically [http://localhost:4200](http://localhost:4200)). You should see the calculated energy bill rendered on the page.

If something is not working, expand below to see the full `src/app/app.component.ts` source:

<collapsible title="Full src/app/app.component.ts code">

```typescript
import { Component, OnInit, signal } from "@angular/core";
import { BillingLogic, GraftConfig } from "@graft/nuget-energypriceservice";

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

@Component({
  selector: "app-root",
  standalone: true,
  template: `<h1>Calculated Energy Monthly Bill is: {{ bill() }}</h1>`,
})
export class AppComponent implements OnInit {
  readonly bill = signal("loading...");

  async ngOnInit() {
    const result = await BillingLogic.CalculateMonthlyBill(88.4, 1.4, 23);
    this.bill.set(result.toFixed(2));
  }
}
```

</collapsible>

## Step 7. Explore more methods and keep up with backend changes

Go back to [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io) to inspect more methods on `BillingLogic`. 

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
- Import classes and call methods directly from your Angular components
- When the backend changes, update the Graft with a single `npm install` command - no client rewrites

> With Graftcode, connecting an Angular frontend to any backend is as simple as installing an npm package. No REST clients, no DTOs, no contract maintenance - just import and call.

![Old Way vs Graftcode](../assets/CompareOldWaysNewWays.png)

</collapsible>
