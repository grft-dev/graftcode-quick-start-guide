---
title: "Python"
description: "Challenge 3 — call the lottery service from another Python service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the **Challenge 3 lottery service** from your own Python backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

```bash
mkdir py-lottery-consumer
cd py-lottery-consumer
```

## Step 2. Install the Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `PyPI`, and copy the install command. Each challenge has its own service — Challenge 3 ships as `graft-pypi-lotterychallenge3`.

```bash
pip install hypertube-python-sdk
pip install --extra-index-url https://grft.dev/simple/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft-pypi-lotterychallenge3==1.0.0
```

## Step 3. Call the lottery method

Create `main.py`:

```python
import os
from graft_pypi_lotterychallenge3 import GraftConfig, Challenge3

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"

tickets = Challenge3.add_tickets("you@example.com")
print(f"Challenge 3 complete — tickets in pool: {tickets}")
os._exit(0)
```

Run it:

```bash
python main.py
```

`Challenge3.add_tickets(...)` is a remote call but reads like a normal function call. Your IDE autocompletes it because the Graft is a real pip package.

## Step 4. Use a Project Key for production

For real-world use, create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> No REST clients, no DTOs, no spec syncing — just `pip install` and call.
