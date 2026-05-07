---
title: ".NET"
description: "Challenge 5 — expose your own .NET booth service to AI agents through MCP. Internally it calls the central Lottery service."
---

## Goal

Build your own .NET booth service that **internally calls the central Lottery service** (built and hosted by us), then expose it through Graftcode Gateway's MCP endpoint so an AI agent (Cursor, Claude Desktop) can enter you in the draw on its own.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [.NET SDK](https://dotnet.microsoft.com/download) installed locally
- An AI tool with MCP support — e.g. [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a class library

```bash
dotnet new classlib -n BoothService
cd BoothService
```

## Step 2. Install the Lottery Graft

```bash
dotnet add package -s https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft.nuget.lottery --version 1.0.0
```

## Step 3. Write the booth class

Delete `Class1.cs` and create `Booth.cs`:

```csharp
using graft.nuget.lottery;

namespace BoothService;

public class Booth
{
    static Booth()
    {
        GraftConfig.Host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
    }

    public static async Task<string> CheckIn(string email)
    {
        var tickets = await Lottery.AddTicket(email);
        return $"Welcome {email}! Total tickets in pool: {tickets}";
    }

    public static async Task<int> HowManyTickets(string email) =>
        await Lottery.GetTickets(email);
}
```

Both methods will be exposed as MCP tools automatically — no MCP server code, no tool definitions.

## Step 4. Host with Graftcode Gateway

Create `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0
WORKDIR /usr/app
COPY . /usr/app/

RUN dotnet publish -c Release -o /usr/app/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "BoothService.dll", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-mcp-dotnet:test .
docker run -d -p 80:80 -p 81:81 --name booth_mcp_dotnet booth-mcp-dotnet:test
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

The agent discovers `Booth.CheckIn` through MCP and calls it. Inside, your code reaches the central Lottery. Try also:

> "How many lottery tickets does you@example.com have?"

The agent calls `Booth.HowManyTickets`, which forwards to the central `Lottery.GetTickets`. No prompt engineering, no tool definitions in your code.

> Any public method on your booth becomes an MCP tool. Same `gg` workflow as Tutorial 2 — plus AI agents on top.
