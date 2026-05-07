---
title: "PHP"
description: "Challenge 5 — expose your own PHP booth service to AI agents through MCP. Internally it calls the central Lottery service."
---

## Goal

Build your own PHP booth service that **internally calls the central Lottery service** (built and hosted by us), then expose it through Graftcode Gateway's MCP endpoint so an AI agent (Cursor, Claude Desktop) can enter you in the draw on its own.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [PHP 8.2+](https://www.php.net/downloads) and [Composer](https://getcomposer.org/) installed locally
- An AI tool with MCP support — e.g. [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a project folder

```bash
mkdir php-booth-mcp
cd php-booth-mcp
```

Create `composer.json`:

```json
{
    "name": "example/booth-service",
    "require": {
        "php": ">=8.2",
        "hypertube/php-sdk": "*",
        "graft/nuget-lottery": "1.0.0"
    },
    "autoload": {
        "psr-4": { "Booth\\": "src/" }
    },
    "repositories": [
        {
            "type": "composer",
            "url": "https://grft.dev/composer/4b4e411f-60a0-4868-b8a6-46f5dee07448__free"
        }
    ]
}
```

```bash
composer install
```

## Step 2. Write the booth class

Create `src/Booth.php`:

```php
<?php
namespace Booth;

use Graft\Nuget\Lottery\GraftConfig;
use Graft\Nuget\Lottery\Lottery;

class Booth
{
    public static function init(): void
    {
        GraftConfig::$host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
    }

    public static function checkIn(string $email): string
    {
        self::init();
        $tickets = Lottery::addTicket($email);
        return "Welcome {$email}! Total tickets in pool: {$tickets}";
    }

    public static function howManyTickets(string $email): int
    {
        self::init();
        return Lottery::getTickets($email);
    }
}
```

Both methods will be exposed as MCP tools automatically — no MCP server code, no tool definitions.

## Step 3. Host with Graftcode Gateway

Create `Dockerfile`:

```dockerfile
FROM php:8.3-cli
WORKDIR /usr/app
COPY . /usr/app/

RUN apt-get update && apt-get install -y wget unzip git \
 && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
 && composer install --no-dev --optimize-autoloader \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/src/Booth.php", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-mcp-php:test .
docker run -d -p 80:80 -p 81:81 --name booth_mcp_php booth-mcp-php:test
```

## Step 4. Connect your AI tool

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

## Step 5. Let the AI enter you in the lottery

Ask in Cursor:

> "Check me in to the lottery, my email is you@example.com"

The agent discovers `Booth.checkIn` through MCP and calls it. Inside, your code reaches the central Lottery. Try also:

> "How many lottery tickets does you@example.com have?"

The agent calls `Booth.howManyTickets`, which forwards to the central `Lottery::getTickets`. No prompt engineering, no tool definitions in your code.

> Any public method on your booth becomes an MCP tool. Same `gg` workflow as Tutorial 2 — plus AI agents on top.
