---
title: "Vue"
description: "Challenge 1 — call the central Lottery service from a Vue app with Graftcode. Submit your email, win tickets, no REST client."
---

## Goal

Call the central **Lottery service** (built and hosted by us) directly from a Vue component using Graftcode — no REST client, no DTOs. Each call adds a ticket to the conference pool for your email.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll connect a Vue app to a hosted Lottery service using a generated Graft package.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Start with a Vue app

```bash
git clone https://github.com/grft-dev/vue-hello-world
cd vue-hello-world
npm install
```

## Step 4. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `npm`, and copy the install command. The Lottery service is published by us as a strongly-typed Graft you can install like any other npm package.

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-lottery@1.0.0
```

## Step 5. Call the lottery method

Replace `src/App.vue`:

```vue
<script setup>
import { ref, onMounted } from "vue";
import { Lottery, GraftConfig } from "@graft/nuget-lottery";

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

const MY_EMAIL = "you@example.com";
const tickets = ref(null);

onMounted(async () => {
  tickets.value = await Lottery.AddTicket(MY_EMAIL);
});
</script>

<template>
  <h1>Challenge 1 complete — tickets in pool: {{ tickets ?? "..." }}</h1>
</template>
```

## Step 6. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The remote `Lottery.AddTicket(email)` call runs like a local function — your IDE autocompletes it because the Graft is a real npm package.

> No REST routes, no DTOs, no generated SDKs — just `npm install` and call.
