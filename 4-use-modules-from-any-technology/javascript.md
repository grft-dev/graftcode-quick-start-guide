---
title: "JavaScript"
description: "Use a module from any supported technology in your JavaScript service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a JavaScript service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a Python module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using `npm` - just like any other package.
- Configure the generated client to point at the in-memory host.
- Import and call it from your JavaScript code as if it were a native npm module.

### Prerequisites

- [Node.js](https://nodejs.org/) installed locally

## Step 1. Create a project folder

Create a new folder and initialize a Node.js project:

```bash
mkdir js-python-module-demo
cd js-python-module-demo
npm init -y
```

## Step 2. Install a module from another technology

For this example we'll use a Python currency converter from PyPI ([sdncenter-currency-converter](https://pypi.org/project/sdncenter-currency-converter/)), but the same approach works with any module from a supported repository - `npm`, `PyPI`, `Maven` or `NuGet`.

`hypertube-nodejs-sdk` is still required for this example today, but that extra step is temporary.

```bash
npm install hypertube-nodejs-sdk
npm install --registry https://grft.dev @graft/pypi-sdncenter-currency-converter
```

This installs a **Graft** - a strongly-typed JavaScript client generated from the module. You import and call it like any other npm package, regardless of which technology the module was originally written in.

## Step 3. Set the SDK key

Set the `HYPERTUBE_KEY` environment variable in your terminal before running the project:

**PowerShell:**

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

**Bash (macOS / Linux):**

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

**Windows CMD:**

```cmd
set HYPERTUBE_KEY=Fe2w-p2GK-Mn26-j8ZY-Xe25
```

## Step 4. Call the cross-language module and run it

Create `index.js`:

```javascript
const { GraftConfig, SimpleCurrencyConverter } = require("graft.pypi.sdncenter-currency-converter");

GraftConfig.host = "inMemory";

(async () => {
  const result = await SimpleCurrencyConverter.convert(100, "USD", "EUR");
  console.log("Converted amount:", result);
})();
```

Run it:

```bash
node index.js
```

You should see the converted amount printed in your terminal. `SimpleCurrencyConverter.convert(...)` comes from a Python package, but your code reads like a regular method call - no HTTP request, no response parsing, no serialization. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the Python module inside the same process.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

With a Project Key, point `GraftConfig.host` at your project's stable registry URL instead of a raw WebSocket address. A Project Key gives you:

- **Stable registry URL** - the address for your Grafts stays permanent, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

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
- The module runs in-process or on a remote host, controlled by a single configuration line

> Technology choice stops being an integration constraint. You can keep writing JavaScript and use the best libraries from any ecosystem - Python, .NET, Java - as if they were native npm packages.

</collapsible>
