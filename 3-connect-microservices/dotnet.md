---
title: ".NET"
description: "Connect one .NET backend service to another with Graftcode - no REST clients, no DTOs, no handwritten integration code. Install a strongly-typed Graft and call remote methods directly from your service logic."
---

## Goal

Connect a .NET backend service to another remote service using Graftcode - so the remote integration stays strongly typed and reads like a normal method call.

### What You'll See

- Install a remote service as a strongly-typed Graft via `NuGet`.
- Configure the generated client to point at the remote host.
- Call a remote method from your own service logic as if it were a local class.
- Use IDE autocompletion on the remote service's methods and classes.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create a .NET service

Create a new console application for your backend service:

```bash
dotnet new console -n EnergyConsumer
cd EnergyConsumer
```

## Step 2. Find the remote method in Graftcode Vision

Open the hosted [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io) portal.

Graftcode Vision shows all public classes and methods exposed by the remote service - their names, parameter types, and return types. It also gives you the exact package manager command needed to install that service as a Graft.

## Step 3. Install the Graft

Open Graftcode Vision, pick `NuGet`, and copy the generated install command.

`Javonet.Netcore.Sdk` is still required for this example today, but that extra step is temporary.

```bash
dotnet add package Javonet.Netcore.Sdk
dotnet nuget add source "https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free/nuget/v3/index.json" --name graftcode
dotnet add package Graft.NuGet.EnergyPriceService --version 1.2.0
```

This adds the generated strongly-typed client for the remote service to your project.

## Step 4. Call the remote method and run it

Replace the contents of `Program.cs`:

```csharp
using Graft.NuGet.EnergyPriceService;

GraftConfig.Host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

var consumption = await MeterLogic.NetConsumptionKWh(1000, 1150);
Console.WriteLine($"Net consumption: {consumption}");
```

Run it:

```bash
dotnet run
```

You should see the net consumption value printed in your terminal. `MeterLogic.NetConsumptionKWh(...)` is a remote call, but your code reads like a normal method invocation - no HTTP request, no response parsing, no serialization.

Your IDE can autocomplete available methods on `MeterLogic`, `BillingLogic`, and any other class from that service because the Graft is a real installed package.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

With a Project Key, point `GraftConfig.Host` at your project's stable registry URL instead of a raw WebSocket address. A Project Key gives you:

- **Stable registry URL** - the address for your Grafts stays permanent, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

## Old Way vs New Way

### Without Graftcode

Connecting one backend service to another typically requires:

- Designing and implementing REST or gRPC endpoints in the remote service
- Defining request/response DTOs for every operation
- Writing or generating an OpenAPI or Protobuf spec
- Building or generating a client SDK in the consuming service's language
- Manually keeping both sides in sync when signatures change
- Adding error handling, retry logic, and serialization code

### With Graftcode

- Install the remote service as a strongly-typed Graft via `dotnet add package`
- Import its classes and call methods directly - no REST client code
- When the remote service changes, update with one command - like any other package

> Connecting two backend services with Graftcode is as simple as installing a NuGet package. No REST routes, no DTOs, no client generation - just add a reference and call.

![Old Way vs Graftcode](../assets/BackendOldWayNewWay.png)
