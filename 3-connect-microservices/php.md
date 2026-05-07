---
title: "PHP"
description: "Challenge 3 — call the central Lottery service from another PHP service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the central **Lottery service** (built and hosted by us) from your own PHP backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [PHP 8.2+](https://www.php.net/downloads) and [Composer](https://getcomposer.org/) installed locally

## Step 1. Create a project folder

```bash
mkdir php-lottery-consumer
cd php-lottery-consumer
```

## Step 2. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `Composer`, and copy the install command. The Lottery service is published by us as a strongly-typed Graft you can install like any other Composer package.

Create `composer.json`:

```json
{
    "name": "example/lottery-consumer",
    "require": {
        "php": ">=8.2",
        "hypertube/php-sdk": "*",
        "graft/nuget-lottery": "1.0.0"
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

## Step 3. Call the lottery method

Create `index.php`:

```php
<?php
require __DIR__ . "/vendor/autoload.php";

use Graft\Nuget\Lottery\GraftConfig;
use Graft\Nuget\Lottery\Lottery;

GraftConfig::$host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

$tickets = Lottery::addTicket("you@example.com");
echo "Challenge 3 complete — tickets in pool: {$tickets}\n";
```

Run it:

```bash
php index.php
```

`Lottery::addTicket(...)` is a remote call but reads like a normal method invocation. Your IDE autocompletes it because the Graft is a real Composer package.

> No REST clients, no DTOs, no spec syncing — just `composer require` and call.
