---
title: "Python"
description: "Challenge 5 — expose your own Python booth service to AI agents through MCP. Internally it calls the central Lottery service."
---

## Goal

Build your own Python booth service that **internally calls the central Lottery service** (built and hosted by us), then expose it through Graftcode Gateway's MCP endpoint so an AI agent (Cursor, Claude Desktop) can enter you in the draw on its own.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Python](https://www.python.org/downloads/) installed locally
- An AI tool with MCP support — e.g. [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll expose your booth service through MCP so an AI agent can enter you in the lottery.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create a project folder

```bash
mkdir py-booth-mcp
cd py-booth-mcp
```

Create `pyproject.toml`:

```toml
[project]
name = "booth-service"
version = "1.0.0"
requires-python = ">=3.8"
description = "Conference booth service"
```

## Step 4. Install the Lottery Graft

```bash
pip install hypertube-python-sdk
pip install --target=./lib --extra-index-url https://grft.dev/simple/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft-nuget-lottery==1.0.0
```

## Step 5. Write the booth module

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

    @staticmethod
    async def how_many_tickets(email: str) -> int:
        return await Lottery.getTickets(email)
```

Both methods will be exposed as MCP tools automatically — no MCP server code, no tool definitions.

## Step 6. Host with Graftcode Gateway

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

CMD ["gg", "--modules", "/usr/app/booth-service/booth.py", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-mcp-py:test .
docker run -d -p 80:80 -p 81:81 --name booth_mcp_py booth-mcp-py:test
```

## Step 7. Connect your AI tool

For Cursor, edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "booth-service": {
      "url": "http://localhost:81/mcp"
    }
  }
}
```

(Same idea for Claude Desktop in `claude_desktop_config.json`.)

## Step 8. Let the AI enter you in the lottery

Ask in Cursor:

> "Check me in to the lottery, my email is you@example.com"

The agent discovers `Booth.check_in` through MCP and calls it. Inside, your code reaches the central Lottery. Try also:

> "How many lottery tickets does you@example.com have?"

The agent calls `Booth.how_many_tickets`, which forwards to the central `Lottery.getTickets`. No prompt engineering, no tool definitions in your code.

> Any public method on your booth becomes an MCP tool. Same `gg` workflow as Tutorial 2 — plus AI agents on top.
