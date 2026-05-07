---
title: "React"
description: "Challenge 1 — call the central Lottery service from a React app with Graftcode. Submit your email, win tickets, no REST client."
---

## Goal

Call the central **Lottery service** (built and hosted by us) directly from a React component using Graftcode — no REST client, no DTOs. Each call adds a ticket to the conference pool for your email.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally

## Step 1. Start with a React app

```bash
git clone https://github.com/grft-dev/react-hello-world
cd react-hello-world
npm install
```

## Step 2. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `npm`, and copy the install command. The Lottery service is published by us as a strongly-typed Graft you can install like any other npm package.

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-lottery@1.0.0
```

## Step 3. Call the lottery method

Replace `src/App.jsx`:

```javascript
import { useEffect, useState } from "react";
import { Lottery, GraftConfig } from "@graft/nuget-lottery";

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

const MY_EMAIL = "you@example.com";

function App() {
  const [tickets, setTickets] = useState(null);

  useEffect(() => {
    Lottery.AddTicket(MY_EMAIL).then(setTickets);
  }, []);

  return <h1>Challenge 1 complete — tickets in pool: {tickets ?? "..."}</h1>;
}

export default App;
```

## Step 4. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The remote `Lottery.AddTicket(email)` call runs like a local function — your IDE autocompletes it because the Graft is a real npm package.

> No REST routes, no DTOs, no generated SDKs — just `npm install` and call.
