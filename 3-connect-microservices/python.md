---
title: "Python"
description: "Challenge 3 — call the central Lottery service from another Python service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the central **Lottery service** (built and hosted by us) from your own Python backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

```bash
mkdir py-lottery-consumer
cd py-lottery-consumer
```

## Step 2. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `PyPI`, and copy the install command. The Lottery service is published by us as a strongly-typed Graft you can install like any other pip package.

```bash
pip install hypertube-python-sdk
pip install --extra-index-url https://grft.dev/simple/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft-nuget-lottery==1.0.0
```

## Step 3. Call the lottery method

Create `main.py`:

```python
import os
from graft_nuget_lottery import GraftConfig, Lottery

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"

tickets = Lottery.addTicket("you@example.com")
print(f"Challenge 3 complete — tickets in pool: {tickets}")
os._exit(0)
```

Run it:

```bash
python main.py
```

`Lottery.addTicket(...)` is a remote call but reads like a normal function call. Your IDE autocompletes it because the Graft is a real pip package.

> No REST clients, no DTOs, no spec syncing — just `pip install` and call.
