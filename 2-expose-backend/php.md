---
title: "PHP"
description: "Challenge 2 — expose your own PHP booth service that internally calls the central Lottery service. Compose remote services like local code."
---

## Goal

Build your own PHP backend service that **internally calls the central Lottery service** (built and hosted by us) to add tickets, then expose your service through Graftcode Gateway. Same `gg` workflow on both sides — you're a Graft consumer **and** a Graftcode producer at once.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [PHP 8.2+](https://www.php.net/downloads) and [Composer](https://getcomposer.org/) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll build a booth service that calls the central Lottery service and expose it through Graftcode Gateway.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create a project folder

```bash
mkdir php-booth-service
cd php-booth-service
```

Create `composer.json`:

```json
{
    "name": "example/booth-service",
    "type": "library",
    "require": {
        "php": ">=8.2",
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

## Step 4. Install the Lottery Graft

The central Lottery service is implemented and hosted by us. Composer pulls it in like any other PHP package:

```bash
composer require hypertube/php-sdk
composer install
```

## Step 5. Write the booth class

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
}
```

`Booth::checkIn($email)` is your method. Inside, it calls the remote `Lottery::addTicket($email)` like a normal PHP call — no REST client, no DTOs.

## Step 6. Host with Graftcode Gateway

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
docker build --no-cache --pull -t booth-service-php:test .
docker run -d -p 80:80 -p 81:81 --name booth_demo_php booth-service-php:test
```

Inside the container, `gg` exposes `Booth::checkIn`. Your code reaches across the network to the central Lottery for every call.

## Step 7. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Booth.checkIn` — hit **Try it out**, pass your email, and the response shows your total ticket count from the central Lottery.

> Your booth is both a producer (its `Booth::checkIn` is callable) and a consumer (it calls remote `Lottery::addTicket`). Same `gg` workflow on both sides — no REST, no DTOs, no client code.
