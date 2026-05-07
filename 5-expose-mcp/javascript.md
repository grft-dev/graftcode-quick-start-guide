---
title: "JavaScript"
description: "Challenge 5 — expose your own JavaScript booth service to AI agents through MCP. Internally it calls the central Lottery service."
---

## Goal

Build your own JavaScript booth service that **internally calls the central Lottery service** (built and hosted by us), then expose it through Graftcode Gateway's MCP endpoint so an AI agent (Cursor, Claude Desktop) can enter you in the draw on its own.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally
- An AI tool with MCP support — e.g. [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a project folder

```bash
mkdir js-booth-mcp
cd js-booth-mcp
npm init -y
```

## Step 2. Install the Lottery Graft

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free @graft/nuget-lottery@1.0.0
```

## Step 3. Write the booth module

Create `index.js`:

```javascript
const { Lottery, GraftConfig } = require("@graft/nuget-lottery");

GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

class Booth {
  static async checkIn(email) {
    const tickets = await Lottery.AddTicket(email);
    return `Welcome ${email}! Total tickets in pool: ${tickets}`;
  }

  static async howManyTickets(email) {
    return await Lottery.GetTickets(email);
  }
}

module.exports = { Booth };
```

Both methods will be exposed as MCP tools automatically — no MCP server code, no tool definitions.

## Step 4. Host with Graftcode Gateway

Create `Dockerfile`:

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
docker build --no-cache --pull -t booth-mcp-js:test .
docker run -d -p 80:80 -p 81:81 --name booth_mcp_js booth-mcp-js:test
```

## Step 5. Connect your AI tool

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

## Step 6. Let the AI enter you in the lottery

Ask in Cursor:

> "Check me in to the lottery, my email is you@example.com"

The agent discovers `Booth.checkIn` through MCP and calls it. Inside, your code reaches the central Lottery. Try also:

> "How many lottery tickets does you@example.com have?"

The agent calls `Booth.howManyTickets`, which forwards to the central `Lottery.GetTickets`. No prompt engineering, no tool definitions in your code.

## Step 7. Project Key for production

```dockerfile
CMD ["gg", "./package.json", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable MCP URL, stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Any public method on your booth becomes an MCP tool. Same `gg` workflow as Tutorial 2 — plus AI agents on top.
