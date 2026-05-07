---
title: "JavaScript"
description: "Challenge 5 — make your JavaScript lottery module callable by AI agents through MCP with Graftcode Gateway. Zero MCP server code, zero tool definitions."
---

## Goal

Expose your **lottery service** as MCP tools so an AI agent (Cursor, Claude Desktop) can enter you in the draw on its own. Zero MCP server code, zero tool definitions.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally
- An AI tool with MCP support — e.g. [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a project folder

```bash
mkdir js-lottery-mcp
cd js-lottery-mcp
npm init -y
```

## Step 2. Write the lottery module

Create `index.js`:

```javascript
const pool = new Map();

class Lottery {
  static addTicket(email) {
    const next = (pool.get(email) ?? 0) + 1;
    pool.set(email, next);
    return next;
  }

  static getTickets(email) {
    return pool.get(email) ?? 0;
  }
}

module.exports = { Lottery };
```

A plain JS class — no MCP-specific annotations. Every public method becomes a callable MCP tool once hosted.

## Step 3. Host it with Graftcode Gateway

Create a `Dockerfile`:

```dockerfile
FROM node:24
WORKDIR /usr/app
COPY . /usr/app/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "./package.json"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-mcp-js:test .
docker run -d -p 80:80 -p 81:81 --name lottery_mcp_js lottery-mcp-js:test
```

Public methods are exposed as MCP tools automatically. Port `80` handles service calls + MCP, port `81` serves Graftcode Vision.

## Step 4. Connect your AI tool

For Cursor, edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "lottery-service": {
      "url": "http://localhost:81/mcp"
    }
  }
}
```

(Same idea for Claude Desktop in `claude_desktop_config.json`.)

## Step 5. Let the AI enter you in the lottery

Ask in Cursor:

> "Add a lottery ticket for my email: you@example.com"

The agent discovers `Lottery.addTicket` through MCP and calls it. Try also:

> "How many tickets does you@example.com have?"

The agent calls `Lottery.getTickets("you@example.com")` and replies with the count. No prompt engineering, no tool definitions in your code.

## Step 6. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass it to the gateway:

```dockerfile
CMD ["gg", "./package.json", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable MCP URL, stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Any public method is instantly an MCP tool. No tool definitions, no schemas, no API design.
