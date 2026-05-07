---
title: ".NET"
description: "Challenge 3 — call the lottery service from another .NET service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the **Challenge 3 lottery service** from your own .NET backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create a console app

```bash
dotnet new console -n LotteryConsumer
cd LotteryConsumer
```

## Step 2. Install the Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `NuGet`, and copy the install command. Each challenge has its own service — Challenge 3 ships as `graft.nuget.lotterychallenge3`.

```bash
dotnet add package -s https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft.nuget.lotterychallenge3 --version 1.0.0
```

## Step 3. Call the lottery method

Replace `Program.cs`:

```csharp
using graft.nuget.LotteryChallenge3;

GraftConfig.Host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

var tickets = Challenge3.AddTickets("you@example.com");
Console.WriteLine($"Challenge 3 complete — tickets in pool: {tickets}");
```

Run it:

```bash
dotnet run
```

`Challenge3.AddTickets(...)` is a remote call but reads like a normal method invocation. Your IDE autocompletes it because the Graft is a real NuGet package.

## Step 4. Use a Project Key for production

For real-world use, create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.Host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> No REST clients, no DTOs, no spec syncing — just `dotnet add package` and call.
