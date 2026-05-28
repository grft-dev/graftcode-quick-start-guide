---
title: ".NET"
description: "Challenge 3 — call the central Lottery service from another .NET service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the central **Lottery service** (built and hosted by us) from your own .NET backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll call the central Lottery service from your backend by installing a typed Graft package.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create a console app

```bash
dotnet new console -n LotteryConsumer
cd LotteryConsumer
```

## Step 4. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `NuGet`, and copy the install command. The Lottery service is published by us as a strongly-typed Graft you can install like any other NuGet package.

```bash
dotnet add package -s https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft.nuget.lottery --version 1.0.0
```

## Step 5. Call the lottery method

Replace `Program.cs`:

```csharp
using graft.nuget.lottery;

GraftConfig.Host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

var tickets = await Lottery.AddTicket("you@example.com");
Console.WriteLine($"Challenge 3 complete — tickets in pool: {tickets}");
```

Run it:

```bash
dotnet run
```

`Lottery.AddTicket(...)` is a remote call but reads like a normal method invocation. Your IDE autocompletes it because the Graft is a real NuGet package.

> No REST clients, no DTOs, no spec syncing — just `dotnet add package` and call.
