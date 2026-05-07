---
title: ".NET"
description: "Challenge 6 — run two .NET classes as a monolith, then split one off as a microservice. Switch back and forth with one environment variable."
---

## Goal

Start with two .NET classes — `LotteryService` and `TicketCounter` — running as a monolith. Extract `TicketCounter` into a standalone microservice. Then flip between monolith and microservice with **one environment variable** — zero code changes from then on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create the project

```bash
dotnet new classlib -n LotteryPlatform
cd LotteryPlatform
```

Delete `Class1.cs`.

## Step 2. Write the two classes

Create `TicketCounter.cs`:

```csharp
using System.Collections.Concurrent;

namespace LotteryPlatform;

public class TicketCounter
{
    private static readonly ConcurrentDictionary<string, int> Pool = new();

    public static int AddTicket(string email) =>
        Pool.AddOrUpdate(email, 1, (_, count) => count + 1);
}
```

Create `LotteryService.cs`:

```csharp
namespace LotteryPlatform;

public class LotteryService
{
    public static int Enter(string email) => TicketCounter.AddTicket(email);
}
```

A plain method call — `LotteryService` references `TicketCounter` directly. No Graftcode involved yet.

## Step 3. Host as a monolith

Create a `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0
WORKDIR /usr/app
COPY . /usr/app/

RUN dotnet publish -c Release -o /usr/app/publish

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/publish/LotteryPlatform.dll"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-platform-dotnet:test .
docker run -d -p 80:80 -p 81:81 --name lottery_platform lottery-platform-dotnet:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `LotteryService.Enter("you@example.com")`. Both classes run inside one container.

## Step 4. Extract TicketCounter into its own project

```bash
dotnet new sln -n LotteryPlatform
dotnet new classlib -n TicketCounter && mv TicketCounter.cs TicketCounter/ && rm TicketCounter/Class1.cs
dotnet new classlib -n LotteryService && mv LotteryService.cs LotteryService/ && rm LotteryService/Class1.cs
dotnet sln add TicketCounter/TicketCounter.csproj LotteryService/LotteryService.csproj
dotnet add LotteryService/LotteryService.csproj reference TicketCounter/TicketCounter.csproj
rm LotteryPlatform.csproj
```

Update the monolith `Dockerfile` to publish the solution and load both DLLs:

```dockerfile
RUN dotnet publish LotteryPlatform.sln -c Release -o /usr/app/publish
...
CMD ["gg", "--modules", "/usr/app/publish/LotteryService.dll,/usr/app/publish/TicketCounter.dll"]
```

The code is unchanged — it's now a **modular monolith**, ready to be split.

## Step 5. Run TicketCounter as a standalone service

Create `Dockerfile.ticketCounter`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0
WORKDIR /usr/app
COPY . /usr/app/

RUN dotnet publish TicketCounter/TicketCounter.csproj -c Release -o /usr/app/publish

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/publish/TicketCounter.dll", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

```bash
docker build --no-cache --pull -f Dockerfile.ticketCounter -t ticket-counter-dotnet:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 --name ticket_counter ticket-counter-dotnet:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `TicketCounter` is now its own service.

## Step 6. Connect through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the NuGet install command:

```bash
dotnet add LotteryService/LotteryService.csproj package -s https://grft.dev/YOUR_KEY__free graft.nuget.ticketcounter --version 1.0.0
```

Update `LotteryService/LotteryService.cs` — the **only code change** in the entire tutorial:

```csharp
using Counter = graft.nuget.ticketcounter;

namespace LotteryPlatform;

public class LotteryService
{
    static LotteryService()
    {
        Counter.GraftConfig.SetConfig(Environment.GetEnvironmentVariable("GRAFT_CONFIG"));
    }

    public static async Task<int> Enter(string email) =>
        await Counter.TicketCounter.AddTicket(email);
}
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 7. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-dotnet:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft.nuget.ticketcounter;host=ticket_counter:9092;runtime=dotnet;modules=/usr/app/publish" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-dotnet:test
```

Call `LotteryService.Enter` in Vision — same result, but the call now hits a remote container.

## Step 8. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=graft.nuget.ticketcounter;host=inMemory;runtime=dotnet;modules=/usr/app/publish" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-dotnet:test
```

```text
# Monolith:    host=inMemory
# Microservice: host=ticket_counter:9092
```

Same image, same code — just one env var.

## Step 9. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass `--projectKey YOUR_PROJECT_KEY` to each gateway. You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Extracting a class from a monolith is no longer a rewrite — it's one import change followed by a configuration switch.
