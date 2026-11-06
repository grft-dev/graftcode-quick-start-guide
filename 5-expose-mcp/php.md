---
title: "PHP"
description: "Make any PHP module callable by AI agents through MCP with Graftcode Gateway - no API design, no tool definitions, no MCP server code. Any public method becomes an MCP tool automatically."
---

## Goal

Turn a PHP module into an MCP-compatible service that AI agents can discover and call - with zero MCP server code, no tool definitions, and no OpenAPI specs.

### What You'll See

- Create a small PHP class with public methods.
- Host it through Graftcode Gateway using Docker - the gateway automatically exposes an MCP endpoint.
- Connect an AI tool (Cursor or Claude Desktop) to the MCP endpoint.
- Ask the AI agent to call your methods - it discovers and invokes them through the Model Context Protocol.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [PHP 7.4 or 8.0+](https://www.php.net/downloads) and [Composer](https://getcomposer.org/) *(optional)* - only if you edit files outside Docker; build and Gateway run entirely in the container
- An AI tool with MCP support - for example [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a project folder

Create a new folder and set up a Composer project:

```bash
mkdir php-ai-backend
cd php-ai-backend
```

Create `composer.json`:

```json
{
    "name": "example/energy-service",
    "description": "Energy module for MCP demo",
    "type": "library",
    "license": "ISC",
    "version": "1.0.0",
    "require": {
        "php": "^7.4 || ^8.0"
    },
    "autoload": {
        "psr-4": {
            "Energy\\": "src/"
        }
    }
}
```

## Step 2. Write a PHP class with public methods

Create `src/EnergyPriceCalculator.php`:

```php
<?php

declare(strict_types=1);

namespace Energy;

class EnergyPriceCalculator
{
    public static function getPrice(): int
    {
        return random_int(100, 104);
    }

    public static function calculateBill(float $kwhUsed): float
    {
        $pricePerKwh = random_int(100, 104);

        return $kwhUsed * $pricePerKwh;
    }
}
```

This is a plain PHP class - no attributes, no frameworks, no MCP-specific annotations. Any public method you write here will automatically become a callable MCP tool once hosted through Graftcode Gateway.

## Step 3. Host it with Graftcode Gateway

Create a `Dockerfile` in the project root:

```dockerfile
FROM php:8.4-cli

WORKDIR /usr/app

COPY . /usr/app/

RUN apt-get update && apt-get install -y git unzip \
 && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
 && composer install --no-dev --optimize-autoloader \
 && curl -fsSL grft.dev/get/gg | sh && dpkg -i gg.deb && rm gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80

CMD ["gg", "/usr/app/src"]
```

`gg` (Graftcode Gateway) analyzes the module path under `--modules`, discovers all public methods, and exposes them automatically — both as Grafts for app-to-app calls and as MCP tools for AI agents. On the default **`--port` (`80`)** the process handles **WebSocket** traffic (for example `ws://localhost:80/ws`) **and HTTP** for Graftcode Vision and MCP on the **same TCP port** (for example `http://localhost:80/GV` and `http://localhost:80/mcp`). Gateway also listens on **`--httpPort`** (default `81`) as a second HTTP stack — optional to map in Docker if you only need one host port.

<collapsible title="🐳 Understanding the Dockerfile - click to see what each line does">

- **FROM php:8.4-cli** - Uses the official PHP 8.4 CLI image as the base runtime environment.
- **COPY . /usr/app/** - Copies your project files into the container.
- **composer install --no-dev --optimize-autoloader** - Registers PSR-4 autoloading for your classes.
- **RUN curl -fsSL grft.dev/get/gg | sh && dpkg -i gg.deb && rm gg.deb** - `curl` downloads the installer, `dpkg -i gg.deb` installs Graftcode Gateway, and `rm gg.deb` removes the package.
- **EXPOSE 80** - Default `--port`: WebSocket for Graft calls **and** HTTP for Vision (`/GV`), MCP (`/mcp`), and `GET /status` on the same listener.
- **CMD ["gg", "--modules", "/usr/app/src", "--runtime", "php"]** - Starts Graftcode Gateway against your `src/` folder. It discovers public methods and exposes them as Grafts and MCP tools.

</collapsible>

Build and run the container:

```bash
docker build --no-cache --pull -t php-ai-backend:test .
docker run -d -p 80:80 --name graftcode_mcp_demo_php php-ai-backend:test
```

Your PHP service is now running with an MCP endpoint exposed automatically by Graftcode Gateway.

## Step 4. Explore the service in Graftcode Vision

Open [http://localhost:80/GV](http://localhost:80/GV) in your browser.

You will see all public methods from your PHP class - their names, parameter types, and return types. Every method listed here is also available as an MCP tool that AI agents can discover and call. Graftcode Vision also provides:

- A **"Try it out"** button to call methods live, directly from the browser.
- A **package manager command** to install this service as a strongly-typed client in any other application.

## Step 5. Connect an AI tool to the MCP endpoint

Graftcode Gateway exposes an [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) endpoint alongside your service automatically. Point your AI tool at it.

By default, MCP is available over HTTP on **`--port` (same as WebSocket)** — for this tutorial, `http://localhost:80/mcp`. If you expose `--httpPort` (default `81`), `http://localhost:81/mcp` works too.

**For Cursor**, create or edit `.cursor/mcp.json` in your project root (or navigate to **File > Preferences > Cursor Settings > Tools & MCP** and press **New MCP Server** and add definition from below):

```json
{
  "mcpServers": {
    "energy-service": {
      "url": "http://localhost:80/mcp"
    }
  }
}
```

**For Claude Desktop**, edit your `claude_desktop_config.json` (open it from **Claude > Settings > Developer > Edit Config**). Claude Desktop only supports stdio servers, so use [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) to bridge to the HTTP endpoint:

```json
{
  "mcpServers": {
    "energy-service": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:80/mcp"
      ]
    }
  }
}
```

Restart Claude Desktop after saving the config.

The AI tool now sees your PHP methods as callable tools - with their names, parameters, and return types - discovered automatically through MCP.

## Step 6. Call your methods through AI

Open your AI tool and ask it to use your service. For example, in Cursor:

> "What is the current energy price?"

The AI agent discovers `EnergyPriceCalculator.getPrice()` through MCP and calls it directly. You can also try:

> "Calculate the energy bill for 250 kWh"

The agent calls `EnergyPriceCalculator.calculateBill(250)` and returns the result. No prompt engineering, no tool definitions in your code - MCP handles discovery and invocation automatically.

## Step 7. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateway:

```dockerfile
CMD ["gg", "/usr/app/src", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable MCP URL** - AI tools connect to a permanent endpoint that doesn't change when you redeploy.
- **Stable registry URL** - consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can access your MCP endpoint and download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Making backend methods callable by AI agents typically requires:

- Implementing an MCP server with explicit tool definitions for each operation
- Mapping each tool to your business logic manually
- Defining input and output JSON schemas for every tool
- Hosting and maintaining the MCP server alongside your service
- Updating tool definitions every time your backend methods change
- Or exposing a REST API and writing custom function-calling schemas for each AI platform

### With Graftcode

- Write your business logic as plain public methods - no MCP server code, no tool definitions, no schemas
- Run it on Graftcode Gateway with one Dockerfile
- Every public method is automatically available as an MCP tool
- When you add or change a method, AI tools discover the update immediately

> Your PHP module is now an AI-callable backend service - with one Dockerfile and two commands. Any public method you add is instantly discoverable by AI agents through MCP. No tool definitions, no API design, no integration code.

</collapsible>
