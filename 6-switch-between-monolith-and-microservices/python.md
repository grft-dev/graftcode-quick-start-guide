---
title: "Python"
description: "Challenge 6 — run two Python modules as a monolith, then split one off as a microservice. Switch back and forth with one environment variable."
---

## Goal

Start with two Python modules — `LotteryService` and `TicketCounter` — running as a monolith. Extract `TicketCounter` into a standalone microservice. Then flip between monolith and microservice with **one environment variable** — zero code changes from then on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create the project

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

## Step 2. Write the two modules

Create `src/ticket_counter.py`:

```python
_pool: dict[str, int] = {}

class TicketCounter:
    @staticmethod
    def add_ticket(email: str) -> int:
        _pool[email] = _pool.get(email, 0) + 1
        return _pool[email]
```

Create `src/lottery_service.py`:

```python
from ticket_counter import TicketCounter

class LotteryService:
    @staticmethod
    def enter(email: str) -> int:
        return TicketCounter.add_ticket(email)
```

A regular import — direct in-process call. No Graftcode involved yet.

## Step 3. Host as a monolith

Create a `Dockerfile`:

```dockerfile
FROM python:3.13-bookworm
WORKDIR /usr/app
COPY . /usr/app/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "./src/"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-platform-py:test .
docker run -d -p 80:80 -p 81:81 --name lottery_platform lottery-platform-py:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `LotteryService.enter("you@example.com")`. Both modules run inside one container.

## Step 4. Run TicketCounter as a standalone service

Create `Dockerfile.ticketCounter`:

```dockerfile
FROM python:3.13-bookworm
WORKDIR /usr/app
COPY . /usr/app/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/src/ticket_counter.py", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

```bash
docker build --no-cache --pull -f Dockerfile.ticketCounter -t ticket-counter-py:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name ticket_counter ticket-counter-py:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `TicketCounter` is now its own service.

## Step 5. Connect through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the PyPI install command:

```bash
pip install hypertube-python-sdk
pip install --target=./lib --extra-index-url http://localhost:91/simple/ graft-pypi-ticketcounter
```

Update `src/lottery_service.py` — the **only code change** in the entire tutorial:

```python
import os
from graft_pypi_ticketcounter import GraftConfig, TicketCounter

GraftConfig.set_config(os.environ.get("GRAFT_CONFIG"))

class LotteryService:
    @staticmethod
    async def enter(email: str) -> int:
        return await TicketCounter.add_ticket(email)
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 6. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-py:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft-pypi-ticketcounter;host=ticket_counter:9092;runtime=python;modules=/usr/app/src" \
  -e PYTHONPATH=/usr/app/lib \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-py:test
```

Call `LotteryService.enter` in Vision — same result, but the call now hits a remote container.

## Step 7. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=graft-pypi-ticketcounter;host=inMemory;runtime=python;modules=/usr/app/src" \
  -e PYTHONPATH=/usr/app/lib \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-py:test
```

```text
# Monolith:    host=inMemory
# Microservice: host=ticket_counter:9092
```

Same image, same code — just one env var.

## Step 8. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass `--projectKey YOUR_PROJECT_KEY` to each gateway. You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Extracting a module from a monolith is no longer a rewrite — it's one import change followed by a configuration switch.
