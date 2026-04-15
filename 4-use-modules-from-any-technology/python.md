---
title: "Python"
description: "Use a module from any supported technology in your Python service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a Python service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a JavaScript module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using `pip` - just like any other package.
- Configure the generated client to point at the in-memory host.
- Import and call it from your Python code as if it were a native pip package.

### Prerequisites

- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

Create a new folder for your project:

```bash
mkdir py-js-module-demo
cd py-js-module-demo
```

## Step 2. Install a module from another technology

For this example we'll use a JavaScript currency converter from npm, but the same approach works with any module from a supported repository - `npm`, `PyPI`, `Maven` or `NuGet`.

`hypertube-python-sdk` is still required for this example today, but that extra step is temporary.

```bash
pip install hypertube-python-sdk
python -m pip install --extra-index-url https://grft.dev/simple graft-nuget-sdnTestSimpleCar==0.1.0
```

This installs a **Graft** - a strongly-typed Python client generated from the module. You import and call it like any other pip package, regardless of which technology the module was originally written in.

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

Create `main.py`:

```python
from graft_nuget_sdntestsimplecar.simplecar import SimpleCar, GraftConfig
 
GraftConfig.host = "inMemory"
 
car = SimpleCar("Toyota", "Corolla", 2022, "car-001")
 
print(car.toString())
print("Running:", car.isRunning)

//Now let's call some method!
car.start();
print("Running:", car.isRunning)
```

Run it:

```bash
python main.py
```

You should see the converted amount printed in your terminal. `SimpleCurrencyConverter.convert(...)` comes from a JavaScript package, but your code reads like a regular method call - no HTTP request, no response parsing, no serialization. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the JavaScript module inside the same process.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

With a Project Key, point `GraftConfig.host` at your project's stable registry URL instead of a raw WebSocket address. A Project Key gives you:

- **Stable registry URL** - the address for your Grafts stays permanent, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

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
- The module runs in-process or on a remote host, controlled by a single configuration line

> Technology choice stops being an integration constraint. You can keep writing Python and use the best libraries from any ecosystem - JavaScript, .NET, Java - as if they were native pip packages.

</collapsible>
