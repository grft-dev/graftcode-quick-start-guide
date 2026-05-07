---
title: "Angular"
description: "Challenge 1 — call the central Lottery service from an Angular app with Graftcode. Submit your email, win tickets, no REST client."
---

## Goal

Call the central **Lottery service** (built and hosted by us) directly from an Angular component using Graftcode — no REST client, no DTOs. Each call adds a ticket to the conference pool for your email.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally
- [Angular CLI](https://angular.dev/tools/cli) installed (`npm install -g @angular/cli`)

## Step 1. Start with an Angular app

```bash
git clone https://github.com/grft-dev/angular-hello-world
cd angular-hello-world
npm install
```

## Step 2. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `npm`, and copy the install command. The Lottery service is published by us as a strongly-typed Graft you can install like any other npm package.

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-lottery@1.0.0
```

## Step 3. Call the lottery method

Replace `src/app/app.component.ts`. Use a `signal` so the WebSocket-driven update reaches the template reliably:

```typescript
import { Component, OnInit, signal } from "@angular/core";
import { Lottery, GraftConfig } from "@graft/nuget-lottery";

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

const MY_EMAIL = "you@example.com";

@Component({
  selector: "app-root",
  standalone: true,
  template: `<h1>Challenge 1 complete — tickets in pool: {{ tickets() }}</h1>`,
})
export class AppComponent implements OnInit {
  readonly tickets = signal("...");

  async ngOnInit() {
    const total = await Lottery.AddTicket(MY_EMAIL);
    this.tickets.set(String(total));
  }
}
```

## Step 4. Run the app

```bash
npm run dev
```

Open [http://localhost:4200](http://localhost:4200). The remote `Lottery.AddTicket(email)` call runs like a local function — your IDE autocompletes it because the Graft is a real npm package.

> No REST routes, no DTOs, no generated SDKs — just `npm install` and call.
