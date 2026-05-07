---
title: "Python"
description: "Challenge 4 — use a .NET lottery module directly from Python with Graftcode. No REST wrapper, no rewrite. The module runs in-process."
---

## Goal

Use the **Challenge 4 lottery module** — published as a .NET package — directly from Python as if it were a native pip package. The module runs in-process; no REST wrapper, no rewrite.

### Prerequisites

- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

```bash
mkdir py-lottery-demo
cd py-lottery-demo
```

## Step 2. Install the cross-language Graft

Challenge 4 is shipped as a .NET package, but you can consume it as a pip package thanks to Graftcode:

```bash
pip install hypertube-python-sdk
python -m pip install --extra-index-url https://grft.dev/simple graft-nuget-lotterychallenge4==1.0.0
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

Create `main.py`:

```python
from graft_nuget_lotterychallenge4 import GraftConfig, Challenge4

GraftConfig.host = "inMemory"

tickets = Challenge4.add_tickets("you@example.com")
print(f"Challenge 4 complete — tickets in pool: {tickets}")
```

Run it:

```bash
python main.py
```

`Challenge4.add_tickets(...)` comes from a .NET package, but reads like a normal Python function call. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the .NET module inside the same process.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Technology choice stops being an integration constraint — keep writing Python and use any module from any ecosystem.
