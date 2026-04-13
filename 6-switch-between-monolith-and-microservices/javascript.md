---
title: "JavaScript"
description: "Build two JavaScript modules in one project as a monolith, then extract one into a separate microservice with Graftcode - and switch freely between the two topologies with a single configuration change."
---

## Goal

Start with two JavaScript modules in a single project running as a monolith, then extract one into a separate microservice using Graftcode. After that one-time setup, switch freely between monolith and microservice by changing a single configuration value - zero code changes.

### What You'll See

- Create two JavaScript modules in the same project - a price calculator and a billing service that calls it directly.
- Host both in a single container as a monolith.
- Extract the price calculator into its own container as a standalone microservice.
- Connect the billing service to it through a Graft.
- Switch between monolith and microservice by changing one environment variable - no code changes from that point on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally (for `npm` commands)

## Step 1. Create a project folder

Create a new project folder and initialize a Node.js project:

```bash
mkdir js-energy-platform
cd js-energy-platform
npm init -y
```

## Step 2. Write the price calculator module

Create `src/priceCalculator.js`:

```javascript
class EnergyPriceCalculator {
  static getPrice() {
    return Math.floor(Math.random() * 5) + 100;
  }
}

module.exports = { EnergyPriceCalculator };
```

## Step 3. Write the billing service

Create `src/billingService.js`:

```javascript
const { EnergyPriceCalculator } = require("./priceCalculator");

class BillingService {
  static calculateBill(kwhUsed) {
    const price = EnergyPriceCalculator.getPrice();
    return kwhUsed * price;
  }
}

module.exports = { BillingService };
```

A regular `require` - the billing service imports the price calculator directly as a local module. No Graftcode involved yet.

## Step 4. Host as a monolith

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

CMD ["gg", "./package.json"]
```

Build and run:

```bash
docker build --no-cache --pull -t js-energy-platform:test .
docker run -d -p 80:80 -p 81:81 --name energy_platform js-energy-platform:test
```

`gg` (Graftcode Gateway) discovers both modules automatically, and exposes all their public methods. Port `80` handles service calls, port `81` serves Graftcode Vision.

Open [http://localhost:81/GV](http://localhost:81/GV) and try calling `BillingService.calculateBill` with a value like `250`. You'll see both `BillingService` and `EnergyPriceCalculator` listed with all their methods.

At this point, everything runs inside **one container** - both modules share a single process. This is your monolith.

## Step 5. Extract the price calculator as a separate microservice

Now let's say the price calculator needs to scale independently, or another team wants to own it. We'll extract it into its own container.

Create `Dockerfile.priceCalculator` in the project root:

```dockerfile
FROM node:24

WORKDIR /usr/app

COPY ./priceCalculator.js /usr/app/

RUN apt-get update \
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/priceCalculator.js", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

Build and run the price calculator as a standalone service:

```bash
docker build --no-cache --pull -f Dockerfile.priceCalculator -t price-calculator:test .
docker run -d -p 90:90 -p 91:91 -p 9092:9092 --name price_calculator price-calculator:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) - the price calculator is now an independent service with its own Graftcode Vision. You can see `EnergyPriceCalculator.getPrice` listed with its return type.

## Step 6. Connect the billing service through a Graft

Now that the price calculator runs on its own gateway, install its **Graft** - the strongly-typed client that Graftcode generates automatically.

From Graftcode Vision at [http://localhost:91/GV](http://localhost:91/GV), select **npm** and copy the generated install command:

```bash
npm install hypertube-nodejs-sdk
npm install --registry http://localhost:91 @graft/npm-energypricecalculator
```

> The exact package name and registry URL are shown in Graftcode Vision - copy them from there. `hypertube-nodejs-sdk` is still required for this example today, but that extra step is temporary.

Update `src/billingService.js` to use the Graft instead of the direct import:

```javascript
const {
  GraftConfig,
  EnergyPriceCalculator,
} = require("@graft/npm-energypricecalculator");

GraftConfig.setConfig(process.env.GRAFT_CONFIG);

class BillingService {
  static async calculateBill(kwhUsed) {
    const price = await EnergyPriceCalculator.getPrice();
    return kwhUsed * price;
  }
}

module.exports = { BillingService };
```

This is the only code change in the entire tutorial. The billing service now reads its configuration from the `GRAFT_CONFIG` environment variable and has no knowledge of whether the price calculator runs in-process or on a remote host. From this point on, switching between monolith and microservice is purely a configuration change.

## Step 7. Run as a microservice

Stop the monolith container, rebuild the image with the updated code, and run the billing service pointing at the remote price calculator:

```bash
docker stop energy_platform
docker rm energy_platform
docker build --no-cache --pull -t js-energy-platform:test .
docker network create mynetwork
docker network connect mynetwork price_calculator
docker run -d --network mynetwork \
  -e GRAFT_CONFIG="name=@graft/npm-energypricecalculator;host=price_calculator:9092;runtime=nodejs;modules=/usr/app" \
  -p 80:80 -p 81:81 \
  --name energy_platform js-energy-platform:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `BillingService.calculateBill` with `250`. Same method, same result - but the price calculation now happens over the network in a separate container.

## Step 8. Switch back to monolith

Want to go back to a monolith? Stop and restart with `host=inMemory` instead:

```bash
docker stop energy_platform
docker rm energy_platform
docker run -d \
  -e GRAFT_CONFIG="name=@graft/npm-energypricecalculator;host=inMemory;modules=/usr/app/src/priceCalculator.js;runtime=nodejs" \
  -p 80:80 -p 81:81 \
  --name energy_platform js-energy-platform:test
```

Compare the two configurations side by side:

```text
# Monolith (in-process)
host=inMemory

# Microservice (remote)
host=price_calculator:9092
```

Same Docker image, same code - just a different environment variable. You can switch back and forth as many times as you need.

## Step 9. Prove the microservice call goes over the network

Switch back to microservice mode to verify the call is truly remote:

```bash
docker stop energy_platform
docker rm energy_platform
docker run -d --network mynetwork \
  -e GRAFT_CONFIG="name=@graft/npm-energypricecalculator;host=price_calculator:9092;runtime=nodejs;modules=/usr/app" \
  -p 80:80 -p 81:81 \
  --name energy_platform js-energy-platform:test
```

Stop the price calculator:

```bash
docker stop price_calculator
```

Call `calculateBill` in Graftcode Vision - you'll see a connection error because the remote service is down.

Start it again:

```bash
docker start price_calculator
```

The method works again. The code never changed - only the deployment topology did.

## Step 10. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateways:

```dockerfile
CMD ["gg", "--modules", "/usr/app/src/billingService.js", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable registry URL** - consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

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

- Start with both modules in the same project as plain JavaScript - a normal monolith
- When you're ready to extract, host the module on its own Graftcode Gateway and install the Graft
- One import change in the consuming service - then topology is controlled by configuration forever
- Switch between monolith and microservice (and back) with one environment variable

> With Graftcode, extracting a module from a monolith is not a rewrite - it's a one-time import change followed by a configuration switch. After that, your code stays focused on business logic while the architecture adapts to your operational needs.

</collapsible>
