---
title: ".NET"
description: "Challenge 2 — expose your own .NET booth service that internally calls the central Lottery service. Compose remote services like local code."
---

## Goal

Build your own .NET backend service that **internally calls the central Lottery service** (built and hosted by us) to add tickets, then expose your service through Graftcode Gateway. Same `gg` workflow on both sides — you're a Graft consumer **and** a Graftcode producer at once.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [.NET SDK](https://dotnet.microsoft.com/download) installed locally

## Step 1. Create a class library

```bash
dotnet new classlib -n BoothService
cd BoothService
```

## Step 2. Install the Lottery Graft

The central Lottery service is implemented and hosted by us. Install its Graft so your booth code can call `Lottery.AddTicket(email)` directly:

```bash
dotnet add package -s https://grft.dev/4b4e411f-60a0-4868-b8a6-46f5dee07448__free graft.nuget.lottery --version 1.0.0
```

## Step 3. Write the booth class

Delete `Class1.cs` and create `Booth.cs`:

```csharp
using graft.nuget.lottery;

namespace BoothService;

public class Booth
{
    static Booth()
    {
        GraftConfig.Host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
    }

    public static async Task<string> CheckIn(string email)
    {
        var tickets = await Lottery.AddTicket(email);
        return $"Welcome {email}! Total tickets in pool: {tickets}";
    }
}
```

`Booth.CheckIn(email)` is your method. Inside, it calls the remote `Lottery.AddTicket(email)` like a normal C# call — no REST client, no DTOs.

## Step 4. Host with Graftcode Gateway

Create `Dockerfile`:

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

CMD ["gg", "--modules", "BoothService.dll", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-service-dotnet:test .
docker run -d -p 80:80 -p 81:81 --name booth_demo_dotnet booth-service-dotnet:test
```

Inside the container, `gg` exposes `Booth.CheckIn`. Your code reaches across the network to the central Lottery for every call.

## Step 5. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Booth.CheckIn` — hit **Try it out**, pass your email, and the response shows your total ticket count from the central Lottery.

> Your booth is both a producer (its `Booth.CheckIn` is callable) and a consumer (it calls remote `Lottery.AddTicket`). Same `gg` workflow on both sides — no REST, no DTOs, no client code.
