---
title: "Python"
description: "Challenge 4 — embed the .NET edition of the Lottery module directly in your Python app. No REST wrapper, no rewrite — runs in-process."
---

## Goal

We publish the **Lottery** logic in multiple languages so you can either call it remotely (Tutorials 1–3) or embed it directly in your process. Here you'll use the .NET edition of Lottery from a Python app — same `Lottery.addTicket(email)` API, but executed in-memory inside your Python process.

### Prerequisites

- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

```bash
mkdir py-lottery-demo
cd py-lottery-demo
```

## Step 2. Install the cross-language Graft

The Lottery module ships as a .NET package. Graftcode lets you consume it as a pip package:

```bash
pip install hypertube-python-sdk
python -m pip install --extra-index-url https://grft.dev/simple graft-nuget-lottery==1.0.0
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

Create `main.py`:

```python
from graft_nuget_lottery import GraftConfig, Lottery

GraftConfig.host = "inMemory"

tickets = Lottery.addTicket("you@example.com")
print(f"Challenge 4 complete — local tickets: {tickets}")
```

Run it:

```bash
python main.py
```

`Lottery.addTicket(...)` comes from a .NET package, but reads like a normal Python call. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the .NET Lottery module inside your Python process — your tickets are tracked locally, not in the central pool.

> Technology choice stops being an integration constraint — same Lottery API, embedded in your process from a .NET package.
