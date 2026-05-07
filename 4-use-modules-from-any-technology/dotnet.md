---
title: ".NET"
description: "Challenge 4 — use a Python lottery module directly from .NET with Graftcode. No REST wrapper, no rewrite. The module runs in-process."
---

## Goal

Use the **Challenge 4 lottery module** — published as a Python package — directly from .NET as if it were a native NuGet library. The module runs in-process; no REST wrapper, no rewrite.

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create a console app

```bash
dotnet new console -n LotteryDemo
cd LotteryDemo
```

## Step 2. Install the cross-language Graft

Challenge 4 is shipped as a Python package, but you can consume it as a NuGet package thanks to Graftcode:

```bash
dotnet add package -s https://grft.dev/ graft.pypi.lotterychallenge4
```

The same approach works with any module from `npm`, `PyPI`, `Maven`, or `NuGet`.

## Step 3. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 4. Call the lottery module in-process

Replace `Program.cs`:

```csharp
using graft.pypi.lotterychallenge4;

GraftConfig.Host = "inMemory";

var tickets = Challenge4.AddTickets("you@example.com");
Console.WriteLine($"Challenge 4 complete — tickets in pool: {tickets}");
```

Run it:

```bash
dotnet run
```

`Challenge4.AddTickets(...)` comes from a Python package, but reads like a normal C# method call. `GraftConfig.Host = "inMemory"` tells Graftcode to load and execute the Python module inside the same process.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.Host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Technology choice stops being an integration constraint — keep writing C# and use any module from any ecosystem.
