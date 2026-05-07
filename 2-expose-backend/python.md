---
title: "Python"
description: "Challenge 2 — turn a Python module into a remotely callable lottery service with Graftcode Gateway. No frameworks, no REST, no specs."
---

## Goal

Expose your own **lottery service** built in Python — any public method becomes instantly callable from any language, no frameworks, no REST routes, no OpenAPI specs.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

```bash
mkdir py-lottery-service
cd py-lottery-service
```

Create `pyproject.toml`:

```toml
[project]
name = "lottery-service"
version = "1.0.0"
requires-python = ">=3.8"
description = "Conference lottery service"
```

## Step 2. Write the lottery module

Create `lottery.py`:

```python
_pool: dict[str, int] = {}

class Lottery:
    @staticmethod
    def add_ticket(email: str) -> int:
        _pool[email] = _pool.get(email, 0) + 1
        return _pool[email]
```

A plain Python class. Any public method becomes remotely callable once hosted.

## Step 3. Host it with Graftcode Gateway

Create a `Dockerfile`:

```dockerfile
FROM python:3.13-bookworm
WORKDIR /usr/app

COPY ./lottery.py /usr/app/lottery-service/
COPY ./pyproject.toml /usr/app/lottery-service/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "./lottery-service/"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-service-py:test .
docker run -d -p 80:80 -p 81:81 --name lottery_demo_py lottery-service-py:test
```

`gg` discovers `Lottery.add_ticket(email)` and exposes it. Port `80` handles service calls, port `81` serves Graftcode Vision.

## Step 4. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Lottery.add_ticket` listed — hit **Try it out**, pass your email, and watch the ticket count grow.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass it to the gateway:

```dockerfile
CMD ["gg", "--modules", "./lottery-service/", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), access control, and an [MCP endpoint](https://modelcontextprotocol.io/) for free.

> One Dockerfile, no API design. Your `Lottery.add_ticket(email)` is now callable from any app, in any language.
