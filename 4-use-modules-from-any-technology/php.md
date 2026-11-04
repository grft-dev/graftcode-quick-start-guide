---
title: "PHP"
description: "Use a module from any supported technology in your PHP service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a PHP service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a .NET NuGet module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using Composer - just like any other package.
- Configure the generated client to point at the in-memory host.
- Import and call it from your PHP code as if it were a native Composer package.

### Prerequisites

- [PHP 7.4 or 8.0+](https://www.php.net/downloads) and [Composer](https://getcomposer.org/) installed locally
- [.NET SDK](https://dotnet.microsoft.com/download) (or a `Microsoft.NETCore.App` runtime) installed locally - `inMemory` loads this Graft on Netcore, not on the PHP runtime alone

## Step 1. Create a project folder

Create a new folder for your project:

```bash
mkdir php-dotnet-module-demo
cd php-dotnet-module-demo
```

## Step 2. Install a module from another technology

For this example we'll use a .NET sample library from NuGet (`sdnTestSimpleCar` / `SimpleCar`), but the same approach works with any module from a supported repository - `npm`, `PyPI`, `Maven` or `NuGet`.

Create `composer.json`:

```json
{
    "name": "example/dotnet-module-demo",
    "require": {
        "php": "^7.4 || ^8.0",
        "hypertube/php-sdk": "*",
        "graft/nuget-sdntestsimplecar": "0.1.0"
    },
    "repositories": [
        {
            "type": "composer",
            "url": "https://grft.dev/composer"
        }
    ]
}
```

```bash
composer install
```

This installs a **Graft** - a strongly-typed PHP client generated from the module. You import and call it like any other Composer package, regardless of which technology the module was originally written in.

## Step 3. Set the SDK key

Set the `HYPERTUBE_KEY` environment variable in your terminal before running the project:

**PowerShell:**

```powershell
$env:HYPERTUBE_KEY="f7GZ-De6k-Mx4p-t7FN-q5DC"
```

**Bash (macOS / Linux):**

```bash
export HYPERTUBE_KEY="f7GZ-De6k-Mx4p-t7FN-q5DC"
```

**Windows CMD:**

```cmd
set HYPERTUBE_KEY=f7GZ-De6k-Mx4p-t7FN-q5DC
```

The first successful activation creates a `hypertube.lic` file. Later runs (and other local projects) can reuse that license. Activating the same key again in a clean environment may return `ERROR:Key already used`.

## Step 4. Call the cross-language module and run it

Create `main.php`:

```php
<?php

declare(strict_types=1);

require __DIR__ . "/vendor/autoload.php";

use Graft\Nuget\SdnTestSimpleCar\GraftConfig;
use Graft\Nuget\SdnTestSimpleCar\SimpleCar;

GraftConfig::$host = "inMemory";

$car = new SimpleCar("Toyota", "Corolla", 2022, "car-001");

echo $car->toString(), PHP_EOL;
echo "Running: ", $car->isRunning() ? "true" : "false", PHP_EOL;

$car->start();
echo "Running: ", $car->isRunning() ? "true" : "false", PHP_EOL;
```

Run it:

```bash
php main.php
```

Prefer property and method names from the installed Graft package or Vision - generated clients may use camelCase (`toString`, `isRunning`) even when the .NET API uses PascalCase.

You should see the car description and running state printed in your terminal. `SimpleCar` comes from a .NET NuGet package, but your code reads like a regular method call - no HTTP request, no response parsing, no serialization. `GraftConfig::$host = "inMemory"` tells Graftcode to load and execute the .NET assembly inside the same process.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

With a Project Key, point `GraftConfig::$host` at your project's stable registry URL instead of a raw WebSocket address. A Project Key gives you:

- **Stable registry URL** - the address for your Grafts stays permanent, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Using a module from another language in PHP typically requires:

- Building a separate service around the module with REST or gRPC endpoints
- Defining request and response DTOs for every operation
- Hosting and deploying that service independently
- Writing HTTP or gRPC client code in your PHP project
- Maintaining the integration layer as the module evolves
- Or rewriting the module entirely in PHP

### With Graftcode

- Install any public module from npm, NuGet, or PyPI as a strongly-typed Graft with one command
- Import and call it like a regular Composer dependency - no wrappers, no clients
- The module runs in-process or on a remote host, controlled by a single configuration line

> Technology choice stops being an integration constraint. You can keep writing PHP and use the best libraries from any ecosystem - JavaScript, .NET, Java - as if they were native Composer packages.

</collapsible>
