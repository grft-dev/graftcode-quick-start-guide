---
title: ".NET"
description: "Challenge 2 — turn a .NET class into a remotely callable lottery service with Graftcode Gateway. No controllers, no REST, no specs."
---

## Goal

Expose your own **lottery service** built in .NET — any public method becomes instantly callable from any language, no controllers, no REST routes, no OpenAPI specs.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create a class library

```bash
dotnet new classlib -n LotteryService
cd LotteryService
```

## Step 2. Write the lottery class

Delete `Class1.cs` and create `LotteryService.cs`:

```csharp
using System.Collections.Concurrent;

namespace LotteryService;

public class Lottery
{
    private static readonly ConcurrentDictionary<string, int> Pool = new();

    public static int AddTicket(string email)
    {
        return Pool.AddOrUpdate(email, 1, (_, count) => count + 1);
    }
}
```

A plain C# class. Any public method becomes remotely callable once hosted.

## Step 3. Host it with Graftcode Gateway

Create a `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0
WORKDIR /usr/app
COPY . /usr/app/

RUN dotnet publish -c Release -o /usr/app/

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "LotteryService.dll"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-service-dotnet:test .
docker run -d -p 80:80 -p 81:81 --name lottery_demo_dotnet lottery-service-dotnet:test
```

`gg` discovers `Lottery.AddTicket(string)` automatically. Port `80` handles service calls, port `81` serves Graftcode Vision.

## Step 4. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Lottery.AddTicket` listed — hit **Try it out**, pass your email, and watch the ticket count grow.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass it to the gateway:

```dockerfile
CMD ["gg", "--modules", "LotteryService.dll", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), access control, and an [MCP endpoint](https://modelcontextprotocol.io/) for free.

> One Dockerfile, no API design. Your `Lottery.AddTicket(email)` is now callable from any app, in any language.
