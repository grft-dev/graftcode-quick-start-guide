---
title: "Host a Backend Service with Graftcode Gateway"
order: 3
description: "Turn your own code into a discoverable backend service using Graftcode Gateway on your local machine - no controllers, no REST routes, no OpenAPI specs."
---

## Goal

Turn your own code into a discoverable backend service using Graftcode Gateway on your local machine - no controllers, no REST routes, no OpenAPI specs.

![](assets/ClientSideCloud.png)

## What You'll See

- You'll clone a simple .NET library app with a single public method.
- You'll expose it through Graftcode Gateway using a lightweight Dockerfile.
- You'll instantly get a GraftVision portal - like Swagger, but smarter and ready to be called from most popular languages with just one command.
- You’ll see how, without controllers, DTOs, or REST endpoints, Graftcode makes your business logic or plain object facade methods directly callable, with no coupling to any specific communication technology.

## Step 1. Clone the .NET backend service

**Return to terminal window and navigate back to the root folder you created for this tutorial**. Next clone the prepared .NET energy price service from GitHub and open the project in your IDE by pasting these commands:

```bash
git clone https://github.com/grft-dev/dotnet-energy-price-service.git
cd dotnet-energy-price-service
code .
```

This is a very simple service that already contains the energy price logic with a public method _GetPrice()_ ready to be exposed through Graftcode Gateway. The code of the class _EnergyPriceCalculator.cs_ that will expose _EnergyPriceCalculator_ is as simple as this:

```csharp
namespace MyEnergyService;

public class EnergyPriceCalculator
{
    public static double GetPrice()
    {
        return new Random().Next(100, 105);
    }
}
```

## Step 2. Expose the service with Graftcode Gateway

To expose this service to the outside world, **we've created a dockerfile in your project root for you**. This file tells Docker how to build and run your service with Graftcode Gateway. The dockerfile is simple and looks like this:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /usr/app

# Install wget, python3 + python3-dev and download GG
RUN mkdir -p /usr/app \
 && apt-get update \
 && apt-get install -y \
    wget \
    python3-dev \
 && wget -O /usr/app/gg.deb \
    https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
 
# You just need to copy your binaries with public interfaces
COPY /bin/Release/net8.0/publish/ /usr/app/

EXPOSE 80
EXPOSE 81
# And run Graftcode Gateway passing name of modules that should be exposed
CMD ["gg", "--modules", "/usr/app/MyEnergyService.dll"]
```

<collapsible title="🐳 Understanding the Dockerfile - Click to see what each line does">

- **FROM mcr.microsoft.com/dotnet/aspnet:9.0** - Pulls the official Microsoft .NET ASP.NET runtime image, providing a Linux environment with the .NET 9 runtime required to execute your published service binaries.
- **RUN mkdir -p /usr/app && apt-get update && apt-get install -y wget** - Creates the application directory and installs required system tools for downloading Graftcode Gateway.
- **wget -O /usr/app/gg.deb ... && dpkg -i /usr/app/gg.deb** - Downloads and installs the latest Graftcode Gateway package, which is responsible for discovering and exposing public methods from your .NET assemblies.
- **rm /usr/app/gg.deb && apt-get clean && rm -rf /var/lib/apt/lists/** - Removes installer files and cleans package caches to reduce the final image size.
- **COPY /bin/Release/net8.0/publish/ /usr/app/** - Copies your already-published .NET service binaries into the container. Only compiled output is included, not source code.
- **EXPOSE 80** - Declares the port used for service communication.
- **EXPOSE 81** - Declares the port used by Graftcode Vision, the Swagger-like UI for exploring and testing exposed methods.
- **CMD ["gg", "--modules", "/usr/app/MyEnergyService.dll"** - Runs the Graftcode Gateway executable (gg) with your .NET module, automatically exposing your public methods as REST endpoints with Graftcode Vision UI enabled

</collapsible>

Now, let's build and run your Docker container with the following commands. Please note that you need to have Docker installed and running on your machine to execute these commands:

```bash
dotnet build .\\MyEnergyService.csproj
dotnet publish .\\MyEnergyService.csproj
docker build --no-cache --pull -t myenergyservice:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_demo myenergyservice:test
```

<collapsible title="📖 New to Docker? Click here to understand what these commands do">
- **dotnet build** - Compiles .NET application, creating optimized binaries ready for production deployment
- **dotnet publish** - Publishes your .NET application to publish folder including all dependencies
- **docker build** - Creates a Docker image from your Dockerfile, combining the Graftcode Gateway with your published service code, and tags it as "myenergyservice:test"
- **docker run** - Starts a container from your built image in detached mode (-d), exposing ports 80 and 81 to make your service accessible via HTTP

</collapsible>

## Step 3. Explore your service with Graft Vision

Open your browser at the following URL to see your service in action through Graft Vision: 
[http://localhost:81/GV](http://localhost:81/GV)

![Graftcode Vision Interface](assets/ExploreServiceUsingGraftcodeVision.png)

Notice that:

- Graftcode Gateway can easily run as container on your machine or in cloud.
- Instantly it hosts Swagger-like UI with all exposed public methods.
- You can see all methods exposed by your service and "Try it out" button to call them live.
- You can easily find a command to install the Graft package using your favorite package manager allowing you to call this service from any language.

That's it! Your .NET method is now exposed as a backend service with Graftcode Gateway and can be called from any frontend web or mobile app or even another backend service.

## Step 4. Compare: old-way vs. Graftcode way

Check this chart to understand how your daily process of exposing backend logic for remote consumption will change with Graftcode:

![](assets/BackendOldWayNewWay.png)

> ⚡ **Result:** You've turned a plain .NET method into a fully accessible backend service with one simple Dockerfile and few Docker commands to run, saving hours of manual coding and maintenance. No controllers, no REST endpoints, no OpenAPI specs. Just a public methods exposed through Graftcode Gateway.
