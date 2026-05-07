---
title: "Python"
description: "Challenge 2 — expose your own Python booth service that internally calls the central Lottery service. Compose remote services like local code."
---

## Goal

Build your own Python backend service that **internally calls the central Lottery service** (built and hosted by us) to add tickets, then expose your service through Graftcode Gateway. Same `gg` workflow on both sides — you're a Graft consumer **and** a Graftcode producer at once.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

```bash
mkdir py-booth-service
cd py-booth-service
```

Create `pyproject.toml`:

```toml
[project]
name = "booth-service"
version = "1.0.0"
requires-python = ">=3.8"
description = "Conference booth service"
```

## Step 2. Install the Lottery Graft

The central Lottery service is implemented and hosted by us. Install its Graft so your booth code can call `Lottery.addTicket(email)` directly:

```bash
pip install hypertube-python-sdk
pip install --target=./lib --extra-index-url https://grft.dev/simple/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft-nuget-lottery==1.0.0
```

## Step 3. Write the booth module

Create `booth.py`:

```python
import sys
sys.path.insert(0, "./lib")

from graft_nuget_lottery import GraftConfig, Lottery

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"

class Booth:
    @staticmethod
    async def check_in(email: str) -> str:
        tickets = await Lottery.addTicket(email)
        return f"Welcome {email}! Total tickets in pool: {tickets}"
```

`Booth.check_in(email)` is your method. Inside, it calls the remote `Lottery.addTicket(email)` like a normal Python call — no REST client, no DTOs.

## Step 4. Host with Graftcode Gateway

Create `Dockerfile`:

```dockerfile
FROM python:3.13-bookworm
WORKDIR /usr/app

COPY . /usr/app/booth-service/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PYTHONPATH=/usr/app/booth-service/lib

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/booth-service/booth.py"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-service-py:test .
docker run -d -p 80:80 -p 81:81 --name booth_demo_py booth-service-py:test
```

Inside the container, `gg` exposes `Booth.check_in`. Your code reaches across the network to the central Lottery for every call.

## Step 5. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Booth.check_in` — hit **Try it out**, pass your email, and the response shows your total ticket count from the central Lottery.

## Step 6. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass it to the gateway:

```dockerfile
CMD ["gg", "--modules", "/usr/app/booth-service/booth.py", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), access control, and a free [MCP endpoint](https://modelcontextprotocol.io/).

> Your booth is both a producer (its `Booth.check_in` is callable) and a consumer (it calls remote `Lottery.addTicket`). Same `gg` workflow on both sides — no REST, no DTOs, no client code.
