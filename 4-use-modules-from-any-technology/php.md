---
title: "PHP"
description: "Challenge 4 — embed the Python edition of the Lottery module directly in your PHP app. No REST wrapper, no rewrite — runs in-process."
---

## Goal

We publish the **Lottery** logic in multiple languages so you can either call it remotely (Tutorials 1–3) or embed it directly in your process. Here you'll use the Python edition of Lottery from a PHP app — same `Lottery::addTicket(email)` API, but executed in-memory inside your PHP process.

### Prerequisites

- [PHP 8.2+](https://www.php.net/downloads) and [Composer](https://getcomposer.org/) installed locally
- [Python](https://www.python.org/downloads/) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll embed the Lottery module from another language directly in your process — same API, runs in-memory.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create a project folder

```bash
mkdir php-lottery-demo
cd php-lottery-demo
```

Create `composer.json`:

```json
{
    "name": "example/lottery-demo",
    "require": {
        "php": ">=8.2",
        "hypertube/php-sdk": "*",
        "graft/pypi-lottery": "1.0.0"
    },
    "repositories": [
        {
            "type": "composer",
            "url": "https://grft.dev/composer"
        }
    ]
}
```

## Step 4. Install the cross-language Graft

The Lottery module ships as a Python package. Graftcode lets you consume it as a Composer package:

```bash
composer install
python -m pip install lottery --target ./modules
```

`pip install --target ./modules` puts the actual Python module next to your project so Graftcode can run it in-process.

## Step 5. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 6. Run Lottery in-process

Create `main.php`:

```php
<?php
require __DIR__ . "/vendor/autoload.php";

use Graft\Pypi\Lottery\GraftConfig;
use Graft\Pypi\Lottery\Lottery;

GraftConfig::$host = "inMemory";

$tickets = Lottery::addTicket("you@example.com");
echo "Challenge 4 complete — local tickets: {$tickets}\n";
```

Run it:

```bash
php main.php
```

`Lottery::addTicket(...)` comes from a Python package, but reads like a normal PHP call. `GraftConfig::$host = "inMemory"` tells Graftcode to load and execute the Python Lottery module inside your PHP process — your tickets are tracked locally, not in the central pool.

> Technology choice stops being an integration constraint — same Lottery API, embedded in your process from a Python package.
