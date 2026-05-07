---
title: "PHP"
description: "Challenge 6 — run two PHP classes as a monolith, then split one off as a microservice. Both topologies still call the central Lottery service."
---

## Goal

Build two PHP classes — `Booth` (orchestrator) and `LotterySubmitter` (which calls the central **Lottery** service hosted by us). Run them as a monolith first. Then extract `LotterySubmitter` into a standalone microservice and switch between monolith and microservice with **one environment variable** — zero code changes from then on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [PHP 8.2+](https://www.php.net/downloads) and [Composer](https://getcomposer.org/) installed locally

## Step 1. Create the project

```bash
mkdir php-lottery-platform
cd php-lottery-platform
```

Create `composer.json`:

```json
{
    "name": "example/lottery-platform",
    "require": {
        "php": ">=8.2",
        "hypertube/php-sdk": "*",
        "graft/nuget-lottery": "1.0.0"
    },
    "autoload": {
        "psr-4": { "LotteryPlatform\\": "src/" }
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

## Step 2. Write the two classes

Create `src/LotterySubmitter.php`:

```php
<?php
namespace LotteryPlatform;

use Graft\Nuget\Lottery\GraftConfig;
use Graft\Nuget\Lottery\Lottery;

class LotterySubmitter
{
    public static function submit(string $email): int
    {
        GraftConfig::$host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
        return Lottery::addTicket($email);
    }
}
```

Create `src/Booth.php`:

```php
<?php
namespace LotteryPlatform;

class Booth
{
    public static function checkIn(string $email): string
    {
        $tickets = LotterySubmitter::submit($email);
        return "Welcome {$email}! Total tickets in pool: {$tickets}";
    }
}
```

`Booth::checkIn` calls `LotterySubmitter::submit` directly. `LotterySubmitter` calls the central `Lottery::addTicket` over WebSocket.

## Step 3. Host as a monolith

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

CMD ["gg", "--modules", "/usr/app/src", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-platform-php:test .
docker run -d -p 80:80 -p 81:81 --name lottery_platform lottery-platform-php:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `Booth.checkIn("you@example.com")`. Both classes run inside one container; the central Lottery is reached over the network.

## Step 4. Run LotterySubmitter as a standalone service

Create `Dockerfile.submitter`:

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

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/src/LotterySubmitter.php", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092", "--projectKey", "YOUR_PROJECT_KEY"]
```

```bash
docker build --no-cache --pull -f Dockerfile.submitter -t lottery-submitter-php:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name lottery_submitter lottery-submitter-php:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `LotterySubmitter` is now its own service that still talks to the central Lottery internally.

## Step 5. Connect Booth through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the Composer install command for the new submitter service:

```bash
composer require graft/composer-lotterysubmitter:1.0.0
```

Update `src/Booth.php` — the **only code change** in the entire tutorial:

```php
<?php
namespace LotteryPlatform;

use Graft\Composer\LotterySubmitter\GraftConfig;
use Graft\Composer\LotterySubmitter\LotterySubmitter;

class Booth
{
    public static function checkIn(string $email): string
    {
        GraftConfig::setConfig(getenv("GRAFT_CONFIG"));
        $tickets = LotterySubmitter::submit($email);
        return "Welcome {$email}! Total tickets in pool: {$tickets}";
    }
}
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 6. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-php:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft.composer.lotterysubmitter;host=lottery_submitter:9092;runtime=php;modules=/usr/app/src" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-php:test
```

Call `Booth.checkIn` in Vision — same result. The chain is now Booth (container A) → LotterySubmitter (container B) → central Lottery.

## Step 7. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=graft.composer.lotterysubmitter;host=inMemory;runtime=php;modules=/usr/app/src" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-php:test
```

```text
# Monolith:    host=inMemory                  (LotterySubmitter in Booth's process)
# Microservice: host=lottery_submitter:9092   (LotterySubmitter is remote)
```

Same image, same code — just one env var. The central Lottery is always remote either way.

> Splitting `LotterySubmitter` out of the monolith is no longer a rewrite — it's one import change followed by a configuration switch.
