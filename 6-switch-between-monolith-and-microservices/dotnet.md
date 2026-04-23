---
title: ".NET"
description: "Build two .NET classes in one project as a monolith, extract one into a separate module, then deploy it as a microservice with Graftcode — and switch freely between the two topologies with a single configuration change."
---

## Goal

Start with two .NET classes in a single project running as a monolith, extract one into its own module, then deploy it as a separate microservice using Graftcode. After that one-time setup, switch freely between monolith and microservice by changing a single configuration value — zero code changes.

### What You'll See

- Create two .NET classes in the same project — a price calculator and a billing service that calls it directly.
- Host both in a single container as a monolith.
- Extract the price calculator into its own project, turning the monolith into a modular monolith — two DLLs that still run together in one container.
- Deploy the price calculator into its own container as a standalone microservice.
- Update the billing service to use a Graft — the only code change in the entire tutorial.
- Switch between monolith and microservice by changing one environment variable — no code changes from that point on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create a project folder

Create a new .NET class library project:

```bash
dotnet new classlib -n EnergyPlatform
cd EnergyPlatform
```

Delete the auto-generated `Class1.cs` — we'll create our own files in the next steps.

## Step 2. Write the price calculator class

Create `EnergyPriceCalculator.cs`:

```csharp
namespace EnergyPlatform;

public class EnergyPriceCalculator
{
    public static int GetPrice()
    {
        return new Random().Next(100, 105);
    }
}
```

## Step 3. Write the billing service

Create `BillingService.cs`:

```csharp
namespace EnergyPlatform;

public class BillingService
{
    public static int CalculateBill(int kwhUsed)
    {
        var price = EnergyPriceCalculator.GetPrice();
        return kwhUsed * price;
    }
}
```

A regular method call — the billing service references the price calculator directly within the same project. No Graftcode involved yet.

## Step 4. Host as a monolith

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

CMD ["gg", "--modules", "/usr/app/publish/EnergyPlatform.dll"]
```

Build and run:

```bash
docker build --no-cache --pull -t dotnet-energy-platform:test .
docker run -d -p 80:80 -p 81:81 --name energy_platform dotnet-energy-platform:test
```

`gg` (Graftcode Gateway) discovers both classes automatically and exposes all their public methods. Port `80` handles service calls, port `81` serves Graftcode Vision.

Open [http://localhost:81/GV](http://localhost:81/GV) and try calling `BillingService.CalculateBill` with a value like `250`. You'll see both `BillingService` and `EnergyPriceCalculator` listed with all their methods.

At this point, everything runs inside **one container** — both classes share a single process and a single DLL. This is your monolith.

## Step 5. Extract the price calculator into its own module

Before deploying the price calculator as a separate service, extract it into its own project. This turns the single-project monolith into a **modular monolith** — two assemblies that still run together in one container, but can be deployed independently.

From the `EnergyPlatform/` directory, restructure the project:

```bash
# Create a solution to hold both projects
dotnet new sln -n EnergyPlatform

# Create the price calculator as its own class library
dotnet new classlib -n EnergyPriceCalculator
mv EnergyPriceCalculator.cs EnergyPriceCalculator/
rm EnergyPriceCalculator/Class1.cs

# Create the billing service as its own class library
dotnet new classlib -n BillingService
mv BillingService.cs BillingService/
rm BillingService/Class1.cs

# Add both projects to the solution
dotnet sln add EnergyPriceCalculator/EnergyPriceCalculator.csproj
dotnet sln add BillingService/BillingService.csproj

# The billing service needs to reference the price calculator
dotnet add BillingService/BillingService.csproj reference EnergyPriceCalculator/EnergyPriceCalculator.csproj

# Remove the old single-project file
rm EnergyPlatform.csproj
```

Your folder now looks like this:

```
EnergyPlatform/
├── EnergyPlatform.sln
├── Dockerfile
├── EnergyPriceCalculator/
│   ├── EnergyPriceCalculator.csproj
│   └── EnergyPriceCalculator.cs
└── BillingService/
    ├── BillingService.csproj
    └── BillingService.cs
```

The code in both `.cs` files is unchanged — same namespace, same method calls. The only difference is they now compile into **separate DLLs**.

Update the `Dockerfile` to build the solution and load both modules:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /usr/app

COPY . /usr/app/

RUN dotnet publish EnergyPlatform.sln -c Release -o /usr/app/publish

RUN apt-get update \
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/publish/BillingService.dll,/usr/app/publish/EnergyPriceCalculator.dll"]
```

Rebuild and run:

```bash
docker stop energy_platform
docker rm energy_platform
docker build --no-cache --pull -t dotnet-energy-platform:test .
docker run -d -p 80:80 -p 81:81 --name energy_platform dotnet-energy-platform:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) — everything works exactly as before. Both classes, same methods, same results. But now each module is its own DLL, ready to be deployed independently.

## Step 6. Deploy the price calculator as a separate microservice

Now let's say the price calculator needs to scale independently, or another team wants to own it. Because it's already its own project with its own DLL, we just need to host it on its own gateway.

Create `Dockerfile.priceCalculator` in the project root:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0

WORKDIR /usr/app

COPY . /usr/app/

RUN dotnet publish EnergyPriceCalculator/EnergyPriceCalculator.csproj -c Release -o /usr/app/publish

RUN apt-get update \
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/publish/EnergyPriceCalculator.dll", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

Build and run the price calculator as a standalone service:

```bash
docker build --no-cache --pull -f Dockerfile.priceCalculator -t price-calculator-dotnet:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name price_calculator price-calculator-dotnet:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — the price calculator is now an independent service with its own Graftcode Vision. You can see `EnergyPriceCalculator.GetPrice` listed with its return type.

## Step 7. Connect the billing service through a Graft

Now that the price calculator runs on its own gateway, install its **Graft** — the strongly-typed client that Graftcode generates automatically.

From Graftcode Vision at [http://localhost:91/GV](http://localhost:91/GV), select **NuGet** and copy the generated install command. Note that the source URL shown in your Graftcode Vision interface may be different than the example provided below.

```bash
dotnet add BillingService/BillingService.csproj package -s https://grft.dev/009f24d4-64b6-49af-9834-4119d581c64d__free graft.nuget.energypricecalculator --version 1.0.0
```

> The exact package name and source URL are shown in Graftcode Vision — copy them from there. `Hypertube.Netcore.Sdk` is still required for this example today, but that extra step is temporary.

Update `BillingService/BillingService.cs` to use the Graft instead of the direct reference:

```csharp
using Pricing = graft.nuget.energypricecalculator;

namespace EnergyPlatform;

public class BillingService
{
    static BillingService()
    {
        Pricing.GraftConfig.SetConfig(Environment.GetEnvironmentVariable("GRAFT_CONFIG"));
    }

    public static async Task<int> CalculateBill(int kwhUsed)
    {
        var price = await Pricing.EnergyPriceCalculator.GetPrice();
        return kwhUsed * price;
    }
}
```

This is the **only code change** in the entire tutorial. The `Pricing` alias distinguishes the Graft's `EnergyPriceCalculator` from the local class of the same name. The billing service now reads its configuration from the `GRAFT_CONFIG` environment variable and has no knowledge of whether the price calculator runs in-process or on a remote host. From this point on, switching between monolith and microservice is purely a configuration change.

## Step 8. Run as a microservice

Stop the monolith container, rebuild the image with the updated code, and run the billing service pointing at the remote price calculator:

```bash
docker stop energy_platform
docker rm energy_platform
docker build --no-cache --pull -t dotnet-energy-platform:test .
docker run -d --network graftcode_demo -e GRAFT_CONFIG="name=graft.nuget.energypricecalculator;host=price_calculator:9092;runtime=dotnet;modules=/usr/app/publish" -p 80:80 -p 81:81 --name energy_platform dotnet-energy-platform:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `BillingService.CalculateBill` with `250`. Same method, same result — but the price calculation now happens over the network in a separate container.

## Step 9. Switch back to monolith

Want to go back to a monolith? Stop and restart with `host=inMemory` instead:

```bash
docker stop energy_platform && docker rm energy_platform
docker run -d \
  -e GRAFT_CONFIG="name=graft.nuget.energypricecalculator;host=inMemory;runtime=dotnet;modules=/usr/app/publish" \
  -p 80:80 -p 81:81 \
  --name energy_platform dotnet-energy-platform:test
```

Compare the two configurations side by side:

```text
# Monolith (in-process)
name=graft.nuget.energypricecalculator;host=inMemory;runtime=dotnet;modules=/usr/app/publish

# Microservice (remote)
name=graft.nuget.energypricecalculator;host=price_calculator:9092;runtime=dotnet;modules=/usr/app/publish
```

> We're still working on the best way to pass the configuration so that it's intuitive and user friendly.

Same Docker image, same code — just a different environment variable. You can switch back and forth as many times as you need.

## Step 10. Prove the microservice call goes over the network

Switch back to microservice mode to verify the call is truly remote:

```bash
docker stop energy_platform && docker rm energy_platform
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft.nuget.energypricecalculator;host=price_calculator:9092;runtime=dotnet;modules=/usr/app/publish" \
  -p 80:80 -p 81:81 \
  --name energy_platform dotnet-energy-platform:test
```

Stop the price calculator:

```bash
docker stop price_calculator
```

Call `CalculateBill` in Graftcode Vision — you'll see a connection error because the remote service is down.

Start it again:

```bash
docker start price_calculator
```

The method works again. The code never changed — only the deployment topology did.

## Step 11. Run with a Project Key (recommended for real-world usage)

Everything above works without any account — perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateways:

```dockerfile
CMD ["gg", "--projectKey", "YOUR_PROJECT_KEY"]
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

- Start with both classes in the same project as plain C# — a normal monolith
- Extract the price calculator into its own project — a modular monolith with separate DLLs
- When you're ready to deploy independently, host the module on its own Graftcode Gateway and install the Graft
- One import change in the consuming service — then topology is controlled by configuration forever
- Switch between monolith and microservice (and back) with one environment variable

> With Graftcode, extracting a class from a monolith is not a rewrite — it's a one-time import change followed by a configuration switch. After that, your code stays focused on business logic while the architecture adapts to your operational needs.

</collapsible>
