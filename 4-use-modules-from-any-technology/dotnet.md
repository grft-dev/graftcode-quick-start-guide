---
title: ".NET"
description: "Use a module from any supported technology in your .NET service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a .NET service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a Python module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using `NuGet` - just like any other package.
- Import and call it from your C# code as if it were a native NuGet library.
- Host the service through Graftcode Gateway and test the cross-language call live in Graftcode Vision.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create a project folder

Create a new .NET class library project:

```bash
dotnet new classlib -n CurrencyDemo
cd CurrencyDemo
```

Delete the auto-generated `Class1.cs` - we'll create our own file in the next steps.

## Step 2. Install a module from another technology

For this example we'll use a Python currency converter from PyPI ([sdncenter-currency-converter](https://pypi.org/project/sdncenter-currency-converter/)), but the same approach works with any module from a supported repository - `npm`, `PyPI`, or `NuGet`.

`Hypertube.Netcore.Sdk` is still required for this example today, but that extra step is temporary.

```bash
dotnet add package Hypertube.Netcore.Sdk
dotnet nuget add source "https://grft.dev/" --name graftcode
dotnet add package graft.pypi.sdncenter-currency-converter
```

This installs a **Graft** - a strongly-typed C# client generated from the module. You import and call it like any other NuGet package, regardless of which technology the module was originally written in.

## Step 3. Write a service that uses the module

Create `CurrencyService.cs`:

```csharp
using graft.pypi.sdncentercurrencyconverter;

namespace CurrencyDemo;

public class CurrencyService
{
    static CurrencyService()
    {
        GraftConfig.SetConfig(Environment.GetEnvironmentVariable("GRAFT_CONFIG"));
    }

    public static async Task<double> ConvertUsdToEur(double amount)
    {
        return await SimpleCurrencyConverter.Convert(amount, "USD", "EUR");
    }
}
```

`SimpleCurrencyConverter` comes from a Python package, but in C# it looks like a regular class. The code reads its configuration entirely from the `GRAFT_CONFIG` environment variable - it has no knowledge of which technology the module was written in or whether it runs in-process or on a remote host.

## Step 4. Host the service with Graftcode Gateway

Create a `Dockerfile` in the project root:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /usr/app

COPY . /usr/app/

RUN dotnet publish -c Release -o /usr/app/publish

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

`gg` (Graftcode Gateway) reads your `.csproj`, discovers all public methods, and exposes them automatically. Port `80` handles service calls, port `81` serves Graftcode Vision.

<collapsible title="🐳 Understanding the Dockerfile - click to see what each line does">

- **FROM mcr.microsoft.com/dotnet/sdk:9.0** - Uses the official .NET 9 SDK image as the base, which includes everything needed to build and run .NET applications.
- **COPY . /usr/app/** - Copies your project files (including `CurrencyService.cs` and the `.csproj`) into the container.
- **RUN dotnet publish -c Release -o /usr/app/publish** - Builds and publishes the project in Release mode, outputting the compiled assembly to `/usr/app/publish`.
- **RUN apt-get update && apt-get install -y wget** - Installs tools needed to download Graftcode Gateway.
- **wget -O /usr/app/gg.deb ... && dpkg -i /usr/app/gg.deb** - Downloads and installs the latest Graftcode Gateway package.
- **EXPOSE 80** - Declares the port used for service communication (Grafts connect here).
- **EXPOSE 81** - Declares the port used by Graftcode Vision, the live portal for exploring and testing exposed methods.
- **CMD ["gg"]** - Runs Graftcode Gateway. It reads the `.csproj` to find your assembly, discovers public methods, and makes them callable.

</collapsible>

Build and run the container, passing the Graft configuration through an environment variable:

```bash
docker build --no-cache --pull -t dotnet-python-module-demo:test .
docker run -d \
  -e GRAFT_CONFIG="name=graft.pypi.sdncentercurrencyconverter;host=inMemory;modules=currency_converter;runtime=python" \
  -p 80:80 -p 81:81 \
  --name dotnet_python_demo dotnet-python-module-demo:test
```

`host=inMemory` tells Graftcode to load and execute the module inside the same process - no network calls, no separate service.

## Step 5. Test the cross-language call in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV) in your browser.

You will see `CurrencyService.ConvertUsdToEur` listed with its parameter types. Click **"Try it out"** and call it with a value like `100` - the result is a live currency conversion, executed by the Python module running inside your .NET service. The same workflow applies to any module from any supported technology.

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

<collapsible title="Old Way vs New Way">

### Without Graftcode

Using a module from another language in .NET typically requires:

- Building a separate service around the module with REST or gRPC endpoints
- Defining request and response DTOs for every operation
- Hosting and deploying that service independently
- Writing HTTP or gRPC client code in your .NET project
- Maintaining the integration layer as the module evolves
- Or rewriting the module entirely in C#

### With Graftcode

- Install any public module from PyPI, NuGet, or npm as a strongly-typed Graft with one command
- Import and call it like a regular NuGet package - no wrappers, no clients
- The module runs in-process or on a remote host, controlled by one environment variable

> Technology choice stops being an integration constraint. You can keep writing C# and use the best libraries from any ecosystem - Python, JavaScript, Java - as if they were native NuGet packages.

</collapsible>
