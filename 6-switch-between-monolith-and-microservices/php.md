---
title: "PHP"
description: "Build two PHP classes in one project as a monolith, then extract one into a separate microservice with Graftcode — and switch freely between the two topologies with a single configuration change."
---

## Goal

Start with two PHP classes in a single project running as a monolith, then extract one into a separate microservice using Graftcode. After that one-time setup, switch freely between monolith and microservice by changing a single configuration value — zero code changes.

### What You'll See

- Create two PHP classes in the same project — a price calculator and a billing service that calls it directly.
- Host both in a single container as a monolith.
- Extract the price calculator into its own container as a standalone microservice.
- Connect the billing service to it through a Graft.
- Switch between monolith and microservice by changing one environment variable — no code changes from that point on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [PHP 7.4 or 8.0+](https://www.php.net/downloads) and [Composer](https://getcomposer.org/) installed locally (for `composer` commands)

## Step 1. Create a project folder

Create a new project folder and set up Composer:

```bash
mkdir php-energy-platform
cd php-energy-platform
```

Create `composer.json`:

```json
{
    "name": "example/energy-platform",
    "description": "Energy platform - switches between monolith and microservice deployments",
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

## Step 2. Write the price calculator class

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
}
```

## Step 3. Write the billing service

Create `src/BillingService.php`:

```php
<?php

declare(strict_types=1);

namespace Energy;

class BillingService
{
    public static function calculateBill(int $kwhUsed): int
    {
        $price = EnergyPriceCalculator::getPrice();

        return $kwhUsed * $price;
    }
}
```

A regular class reference — the billing service calls the price calculator directly in the same namespace. No Graftcode involved yet.

## Step 4. Host as a monolith

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
EXPOSE 81

CMD ["gg", "/usr/app/src"]
```

Build and run:

```bash
docker build --no-cache --pull -t php-energy-platform:test .
docker run -d -p 80:80 -p 81:81 --name energy_platform php-energy-platform:test
```

`gg` (Graftcode Gateway) scans the `/usr/app/src` directory, discovers both classes, and exposes all their public methods. Port `80` handles service calls, port `81` serves Graftcode Vision.

Open [http://localhost:81/GV](http://localhost:81/GV) and try calling `BillingService.calculateBill` with a value like `250`. You'll see both `BillingService` and `EnergyPriceCalculator` listed with all their methods.

At this point, everything runs inside **one container** — both classes share a single PHP process. This is your monolith.

## Step 5. Extract the price calculator as a separate microservice

Now let's say the price calculator needs to scale independently, or another team wants to own it. We'll extract it into its own container.

Create `Dockerfile.priceCalculator` in the project root:

```dockerfile
FROM php:8.4-cli

WORKDIR /usr/app

COPY . /usr/app/

RUN apt-get update && apt-get install -y git unzip \
 && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
 && composer install --no-dev --optimize-autoloader \
 && curl -fsSL grft.dev/get/gg | sh && dpkg -i gg.deb && rm gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "/usr/app/src/EnergyPriceCalculator.php", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

Build and run the price calculator as a standalone service:

```bash
docker build --no-cache --pull -f Dockerfile.priceCalculator -t price-calculator-php:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name price_calculator price-calculator-php:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — the price calculator is now an independent service with its own Graftcode Vision. You can see `EnergyPriceCalculator.getPrice` listed with its return type.

## Step 6. Connect the billing service through a Graft

Now that the price calculator runs on its own gateway, install its **Graft** — the strongly-typed client that Graftcode generates automatically.

From Graftcode Vision at [http://localhost:91/GV](http://localhost:91/GV), select **Composer** and copy the generated install command. Run it from the project root so the package lands in `vendor/` and is copied into the container on the next build. The package name follows your hosted module coordinates (for this sample, typically `graft/composer-energy-platform:1.0.0` from `composer.json` `name = "example/energy-platform"`). The registry URL shown in Vision may differ from the example below.

```bash
composer require graft/composer-energy-platform:1.0.0 --repository '{"type":"composer","url":"https://grft.dev/composer/<uuid>__free"}'
```

> The exact package name and registry URL are shown in Graftcode Vision — copy them from there.

Update `src/BillingService.php` to use the Graft instead of the direct class reference:

```php
<?php

declare(strict_types=1);

namespace Energy;

use Graft\Composer\EnergyPlatform\EnergyPriceCalculator;
use Graft\Composer\EnergyPlatform\GraftConfig;

class BillingService
{
    public static function calculateBill(int $kwhUsed): int
    {
        GraftConfig::setConfig(getenv("GRAFT_CONFIG"));
        $price = EnergyPriceCalculator::getPrice();

        return $kwhUsed * $price;
    }
}
```

Prefer the exact `use` namespaces from the generated Composer Graft package. This is the only code change in the entire tutorial. The billing service now reads its configuration from the `GRAFT_CONFIG` environment variable and has no knowledge of whether the price calculator runs in-process or on a remote host. From this point on, switching between monolith and microservice is purely a configuration change.

## Step 7. Run as a microservice

Stop the monolith container, rebuild the image with the updated code, and run the billing service pointing at the remote price calculator.

> In `GRAFT_CONFIG`, `name=` is the Graft's internal name (for this sample often `graft.composer.energyplatform`) — not the hyphenated Composer package id. Copy it from Vision or the generated `GraftConfig` in the package.

```bash
docker stop energy_platform
docker rm energy_platform
docker build --no-cache --pull -t php-energy-platform:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft.composer.energyplatform;host=ws://price_calculator:90/ws;runtime=php;modules=/usr/app/src" \
  -p 80:80 -p 81:81 \
  --name energy_platform php-energy-platform:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `BillingService.calculateBill` with `250`. Same method, same result — but the price calculation now happens over the network in a separate container.

## Step 8. Switch back to monolith

Want to go back to a monolith? Stop and restart with `host=inMemory` instead:

```bash
docker stop energy_platform
docker rm energy_platform
docker run -d \
  -e GRAFT_CONFIG="name=graft.composer.energyplatform;host=inMemory;runtime=php;modules=/usr/app/src" \
  -p 80:80 -p 81:81 \
  --name energy_platform php-energy-platform:test
```

Compare the two configurations side by side:

```text
# Monolith (in-process)
name=graft.composer.energyplatform;host=inMemory;runtime=php;modules=/usr/app/src

# Microservice (remote)
name=graft.composer.energyplatform;host=ws://price_calculator:90/ws;runtime=php;modules=/usr/app/src
```

`GRAFT_CONFIG` owns the topology — same Docker image, same business logic, one environment variable. Switch back and forth as often as you need.

## Step 9. Prove the microservice call goes over the network

Switch back to microservice mode to verify the call is truly remote:

```bash
docker stop energy_platform
docker rm energy_platform
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft.composer.energyplatform;host=ws://price_calculator:90/ws;runtime=php;modules=/usr/app/src" \
  -p 80:80 -p 81:81 \
  --name energy_platform php-energy-platform:test
```

Stop the price calculator:

```bash
docker stop price_calculator
```

Call `calculateBill` in Graftcode Vision — you'll see a connection error because the remote service is down.

Start it again:

```bash
docker start price_calculator
```

The method works again. The code never changed — only the deployment topology did.

## Step 10. Run with a Project Key (recommended for real-world usage)

Everything above works without any account — perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateways:

```dockerfile
CMD ["gg", "/usr/app/src", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable registry URL** — consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** — see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** — decide who can download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Extracting a module from a monolith into a microservice typically requires:

- Building a new service with REST or gRPC endpoints wrapping the module
- Defining request/response DTOs for every operation
- Hosting and deploying the new service separately
- Rewriting your consuming code to use HTTP or gRPC clients
- Implementing client-side DTOs and response mapping
- Redeploying your application with the new integration code
- Repeating all of the above if you need to move it back

### With Graftcode

- Start with both classes in the same project as plain PHP — a normal monolith
- When you're ready to extract, host the module on its own Graftcode Gateway and install the Graft
- One import change in the consuming service — then topology is controlled by configuration forever
- Switch between monolith and microservice (and back) with one environment variable

> With Graftcode, extracting a module from a monolith is not a rewrite — it's a one-time import change followed by a configuration switch. After that, your code stays focused on business logic while the architecture adapts to your operational needs.

</collapsible>
