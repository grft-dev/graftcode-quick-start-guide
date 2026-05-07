---
title: ".NET"
description: "Challenge 4 — embed the Python edition of the Lottery module directly in your .NET app. No REST wrapper, no rewrite — runs in-process."
---

## Goal

We publish the **Lottery** logic in multiple languages so you can either call it remotely (Tutorials 1–3) or embed it directly in your process. Here you'll use the Python edition of Lottery from a .NET app — same `Lottery.AddTicket(email)` API, but executed in-memory inside your .NET process.

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create a console app

```bash
dotnet new console -n LotteryDemo
cd LotteryDemo
```

## Step 2. Install the cross-language Graft

The Lottery module ships as a Python package. Graftcode lets you consume it as a NuGet package:

```bash
dotnet add package -s https://grft.dev/ graft.pypi.lottery
```

The same approach works with any module from `npm`, `PyPI`, `Maven`, or `NuGet`.

## Step 3. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 4. Run Lottery in-process

Replace `Program.cs`:

```csharp
using graft.pypi.lottery;

GraftConfig.Host = "inMemory";

var tickets = Lottery.AddTicket("you@example.com");
Console.WriteLine($"Challenge 4 complete — local tickets: {tickets}");
```

Run it:

```bash
dotnet run
```

`Lottery.AddTicket(...)` comes from a Python package, but reads like a normal C# call. `GraftConfig.Host = "inMemory"` tells Graftcode to load and execute the Python Lottery module inside your .NET process — your tickets are tracked locally, not in the central pool.

> Technology choice stops being an integration constraint — same Lottery API, embedded in your process from a Python package.
