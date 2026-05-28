---
title: "Python"
description: "Challenge 6 — run two Python modules as a monolith, then split one off as a microservice. Both topologies still call the central Lottery service."
---

## Goal

Build two Python modules — `Booth` (orchestrator) and `LotterySubmitter` (which calls the central **Lottery** service hosted by us). Run them as a monolith first. Then extract `LotterySubmitter` into a standalone microservice and switch between monolith and microservice with **one environment variable** — zero code changes from then on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Python](https://www.python.org/downloads/) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll run Booth and LotterySubmitter as a monolith, then split one into a microservice with one config change.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create the project

```bash
mkdir py-lottery-platform
cd py-lottery-platform
```

Create `pyproject.toml`:

```toml
[project]
name = "lottery-platform"
version = "1.0.0"
requires-python = ">=3.8"
description = "Conference lottery platform"
```

## Step 4. Install the Lottery Graft

```bash
pip install hypertube-python-sdk
pip install --target=./lib --extra-index-url https://grft.dev/simple/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft-nuget-lottery==1.0.0
```

## Step 5. Write the two modules

Create `src/lottery_submitter.py`:

```python
import sys
sys.path.insert(0, "./lib")

from graft_nuget_lottery import GraftConfig, Lottery

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"


class LotterySubmitter:
    @staticmethod
    async def submit(email: str) -> int:
        return await Lottery.addTicket(email)
```

Create `src/booth.py`:

```python
from lottery_submitter import LotterySubmitter


class Booth:
    @staticmethod
    async def check_in(email: str) -> str:
        tickets = await LotterySubmitter.submit(email)
        return f"Welcome {email}! Total tickets in pool: {tickets}"
```

`Booth.check_in` calls `LotterySubmitter.submit` directly. `LotterySubmitter` calls the central `Lottery.addTicket` over WebSocket.

## Step 6. Host as a monolith

Create `Dockerfile`:

```dockerfile
FROM python:3.13-bookworm
WORKDIR /usr/app
COPY . /usr/app/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PYTHONPATH=/usr/app/lib

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "./src/", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-platform-py:test .
docker run -d -p 80:80 -p 81:81 --name lottery_platform lottery-platform-py:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `Booth.check_in("you@example.com")`. Both modules run inside one container; the central Lottery is reached over the network.

## Step 7. Run LotterySubmitter as a standalone service

Create `Dockerfile.submitter`:

```dockerfile
FROM python:3.13-bookworm
WORKDIR /usr/app
COPY . /usr/app/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PYTHONPATH=/usr/app/lib

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/src/lottery_submitter.py", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092", "--projectKey", "YOUR_PROJECT_KEY"]
```

```bash
docker build --no-cache --pull -f Dockerfile.submitter -t lottery-submitter-py:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name lottery_submitter lottery-submitter-py:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `LotterySubmitter` is now its own service that still talks to the central Lottery internally.

## Step 8. Connect Booth through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the PyPI install command for the new submitter service:

```bash
pip install --target=./lib --extra-index-url http://localhost:91/simple/ graft-pypi-lotterysubmitter
```

Update `src/booth.py` — the **only code change** in the entire tutorial:

```python
import os
from graft_pypi_lotterysubmitter import GraftConfig, LotterySubmitter

GraftConfig.set_config(os.environ.get("GRAFT_CONFIG"))


class Booth:
    @staticmethod
    async def check_in(email: str) -> str:
        tickets = await LotterySubmitter.submit(email)
        return f"Welcome {email}! Total tickets in pool: {tickets}"
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 9. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-py:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft-pypi-lotterysubmitter;host=lottery_submitter:9092;runtime=python;modules=/usr/app/src" \
  -e PYTHONPATH=/usr/app/lib \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-py:test
```

Call `Booth.check_in` in Vision — same result. The chain is now Booth (container A) → LotterySubmitter (container B) → central Lottery.

## Step 10. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=graft-pypi-lotterysubmitter;host=inMemory;runtime=python;modules=/usr/app/src" \
  -e PYTHONPATH=/usr/app/lib \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-py:test
```

```text
# Monolith:    host=inMemory                  (LotterySubmitter in Booth's process)
# Microservice: host=lottery_submitter:9092   (LotterySubmitter is remote)
```

Same image, same code — just one env var. The central Lottery is always remote either way.

> Splitting `LotterySubmitter` out of the monolith is no longer a rewrite — it's one import change followed by a configuration switch.
