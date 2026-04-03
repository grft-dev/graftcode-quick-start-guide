---
title: "JavaScript"
description: "Use a module from any supported technology in your JavaScript service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a JavaScript service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a Python module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using `npm` - just like any other package.
- Import and call it from your JavaScript code as if it were a native npm module.
- Host the service through Graftcode Gateway and test the cross-language call live in Graftcode Vision.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally (for `npm` commands)

## Step 1. Create a project and install a module from another technology

Create a new folder, initialize a Node.js project, and install the Graftcode SDK together with a Python currency converter Graft we'll use as our example:

```bash
mkdir js-python-module-demo
cd js-python-module-demo
npm init -y
npm install javonet-nodejs-sdk
npm install --registry https://grft.dev graft.pypi.sdncenter-currency-converter
```

That last command installs a **Graft** - a strongly-typed JavaScript client generated from a module in another technology. In this case it's a Python package from PyPI ([sdncenter-currency-converter](https://pypi.org/project/sdncenter-currency-converter/)), but the same approach works with any module from a supported repository - `npm`, `PyPI`, or `NuGet`.

## Step 2. Write a service that uses the module

Create `src/currencyService.js`:

```javascript
const {
  GraftConfig,
  SimpleCurrencyConverter,
} = require("graft.pypi.sdncenter-currency-converter");

GraftConfig.setConfig(process.env.GRAFT_CONFIG);

class CurrencyService {
  static async convertUsdToEur(amount) {
    return await SimpleCurrencyConverter.convert(amount, "USD", "EUR");
  }
}

module.exports = { CurrencyService };
```

`SimpleCurrencyConverter` comes from a Python package, but in JavaScript it looks like a regular import. The code reads its configuration entirely from the `GRAFT_CONFIG` environment variable - it has no knowledge of which technology the module was written in or whether it runs in-process or on a remote host.

## Step 3. Host the service with Graftcode Gateway

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:24

WORKDIR /usr/app

COPY . /usr/app/

RUN apt-get update \
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/src/currencyService.js"]
```

`gg` (Graftcode Gateway) inspects your JavaScript module, discovers all public methods, and exposes them automatically. Port `80` handles service calls, port `81` serves Graftcode Vision.

<collapsible title="🐳 Understanding the Dockerfile - click to see what each line does">

- **FROM node:24** - Uses the official Node.js 24 image as the base runtime environment.
- **COPY . /usr/app/** - Copies your project files (including `src/currencyService.js`) into the container.
- **RUN apt-get update && apt-get install -y wget** - Installs tools needed to download Graftcode Gateway.
- **wget -O /usr/app/gg.deb ... && dpkg -i /usr/app/gg.deb** - Downloads and installs the latest Graftcode Gateway package.
- **EXPOSE 80** - Declares the port used for service communication (Grafts connect here).
- **EXPOSE 81** - Declares the port used by Graftcode Vision, the live portal for exploring and testing exposed methods.
- **CMD ["gg", "--modules", ...]** - Runs Graftcode Gateway, pointing it at your JavaScript module. It discovers public methods and makes them callable.

</collapsible>

Build and run the container, passing the Graft configuration through an environment variable:

```bash
docker build --no-cache --pull -t js-python-module-demo:test .
docker run -d \
  -e GRAFT_CONFIG="name=graft.pypi.sdncenter_currency_converter;host=inMemory;modules=currency_converter;runtime=python" \
  -p 80:80 -p 81:81 \
  --name js_python_demo js-python-module-demo:test
```

`host=inMemory` tells Graftcode to load and execute the module inside the same process - no network calls, no separate service.

## Step 4. Test the cross-language call in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV) in your browser.

You will see `CurrencyService.convertUsdToEur` listed with its parameter types. Click **"Try it out"** and call it with a value like `100` - the result is a live currency conversion, executed by the Python module running inside your JavaScript service. The same workflow applies to any module from any supported technology.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateway:

```dockerfile
CMD ["gg", "--modules", "/usr/app/src/currencyService.js", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable registry URL** - consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

## Old Way vs New Way

### Without Graftcode

Using a module from another language in JavaScript typically requires:

- Building a separate service around the module with REST or gRPC endpoints
- Defining request and response DTOs for every operation
- Hosting and deploying that service independently
- Writing HTTP or gRPC client code in your JavaScript project
- Maintaining the integration layer as the module evolves
- Or rewriting the module entirely in JavaScript

### With Graftcode

- Install any public module from PyPI, NuGet, or npm as a strongly-typed Graft with one command
- Import and call it like a regular JavaScript dependency - no wrappers, no clients
- The module runs in-process or on a remote host, controlled by one environment variable

> Technology choice stops being an integration constraint. You can keep writing JavaScript and use the best libraries from any ecosystem - Python, .NET, Java - as if they were native npm packages.
