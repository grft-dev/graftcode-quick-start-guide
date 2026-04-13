---
title: "Python"
description: "Use a module from any supported technology in your Python service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a Python service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a JavaScript module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using `pip` - just like any other package.
- Import and call it from your Python code as if it were a native pip package.
- Host the service through Graftcode Gateway and test the cross-language call live in Graftcode Vision.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Python](https://www.python.org/downloads/) installed locally (for `pip` commands)

## Step 1. Create a project folder

Create a new folder and initialize a Python project:

```bash
mkdir py-js-module-demo
cd py-js-module-demo
```

Create a `setup.py`:

```python
from setuptools import setup

setup(
    name="currency-demo",
    version="1.0.0",
    py_modules=["currency_service"],
)
```

## Step 2. Install a module from another technology

For this example we'll use a JavaScript currency converter from npm, but the same approach works with any module from a supported repository - `npm`, `PyPI`, or `NuGet`.

```bash
pip install graft-npm-simple-currency-converter --extra-index-url https://grft.dev
```

This installs a **Graft** - a strongly-typed Python client generated from the module. You import and call it like any other pip package, regardless of which technology the module was originally written in.

## Step 3. Write a service that uses the module

Create `currency_service.py`:

```python
import os
from graft_npm_simple_currency_converter import GraftConfig, SimpleCurrencyConverter

GraftConfig.set_config(os.environ.get("GRAFT_CONFIG"))


class CurrencyService:
    @staticmethod
    async def convert_usd_to_eur(amount):
        return await SimpleCurrencyConverter.convert(amount, "USD", "EUR")
```

`SimpleCurrencyConverter` comes from a JavaScript package, but in Python it looks like a regular import. The code reads its configuration entirely from the `GRAFT_CONFIG` environment variable - it has no knowledge of which technology the module was written in or whether it runs in-process or on a remote host.

## Step 4. Host the service with Graftcode Gateway

Create a `Dockerfile` in the project root:

```dockerfile
FROM python:3.13

WORKDIR /usr/app

COPY . /usr/app/

RUN pip install graft-npm-simple-currency-converter --extra-index-url https://grft.dev

RUN apt-get update \
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg"]
```

`gg` (Graftcode Gateway) reads your `setup.py`, discovers all public methods, and exposes them automatically. Port `80` handles service calls, port `81` serves Graftcode Vision.

<collapsible title="🐳 Understanding the Dockerfile - click to see what each line does">

- **FROM python:3.13** - Uses the official Python 3.13 image as the base runtime environment.
- **COPY . /usr/app/** - Copies your project files (including `currency_service.py` and `setup.py`) into the container.
- **RUN pip install ...** - Installs the Graft package and its SDK so the cross-language module is available at runtime.
- **RUN apt-get update && apt-get install -y wget** - Installs tools needed to download Graftcode Gateway.
- **wget -O /usr/app/gg.deb ... && dpkg -i /usr/app/gg.deb** - Downloads and installs the latest Graftcode Gateway package.
- **EXPOSE 80** - Declares the port used for service communication (Grafts connect here).
- **EXPOSE 81** - Declares the port used by Graftcode Vision, the live portal for exploring and testing exposed methods.
- **CMD ["gg"]** - Runs Graftcode Gateway. It reads `setup.py` to find your module, discovers public methods, and makes them callable.

</collapsible>

Build and run the container, passing the Graft configuration through an environment variable:

```bash
docker build --no-cache --pull -t py-js-module-demo:test .
docker run -d \
  -e GRAFT_CONFIG="name=graft-npm-simple-currency-converter;host=inMemory;modules=simple-currency-converter;runtime=nodejs" \
  -p 80:80 -p 81:81 \
  --name py_js_demo py-js-module-demo:test
```

`host=inMemory` tells Graftcode to load and execute the module inside the same process - no network calls, no separate service.

## Step 5. Test the cross-language call in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV) in your browser.

You will see `CurrencyService.convert_usd_to_eur` listed with its parameter types. Click **"Try it out"** and call it with a value like `100` - the result is a live currency conversion, executed by the JavaScript module running inside your Python service. The same workflow applies to any module from any supported technology.

## Step 6. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateway:

```dockerfile
CMD ["gg", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable registry URL** - consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

## Old Way vs New Way

### Without Graftcode

Using a module from another language in Python typically requires:

- Building a separate service around the module with REST or gRPC endpoints
- Defining request and response DTOs for every operation
- Hosting and deploying that service independently
- Writing HTTP or gRPC client code in your Python project
- Maintaining the integration layer as the module evolves
- Or rewriting the module entirely in Python

### With Graftcode

- Install any public module from npm, NuGet, or PyPI as a strongly-typed Graft with one command
- Import and call it like a regular Python dependency - no wrappers, no clients
- The module runs in-process or on a remote host, controlled by one environment variable

> Technology choice stops being an integration constraint. You can keep writing Python and use the best libraries from any ecosystem - JavaScript, .NET, Java - as if they were native pip packages.
