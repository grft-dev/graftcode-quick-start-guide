---
title: "JavaScript"
description: "Build a JavaScript service with a Python module running in-process, then extract it to a separate microservice by changing one configuration line - no code changes, no new clients, no new endpoints."
---

## Goal

Build a JavaScript service that uses a Python module in a single process (monolith), then split that module into a separate microservice - by changing only one line of configuration.

### What You'll See

- Create a JavaScript service that calls a Python currency converter module in-process.
- Extract that Python module into its own container as a standalone microservice.
- Switch from monolith to microservice by changing one configuration value - zero code changes.
- Verify the call now travels over the network to the separate service.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally (for `npm` commands)

## Step 1. Create a JavaScript service with a Python module (monolith)

Create a new project folder and install the Graftcode SDK together with the Python currency converter Graft:

```bash
mkdir js-currency-service
cd js-currency-service
npm init -y
npm install javonet-nodejs-sdk
npm install --registry https://grft.dev graft.pypi.sdncenter-currency-converter
```

Now create `src/currencyService.js`:

```javascript
const {
  GraftConfig,
  SimpleCurrencyConverter,
} = require("graft.pypi.sdncenter-currency-converter");

GraftConfig.setConfig(process.env.GRAFT_CONFIG);

class CurrencyService {
  static async convertCurrency(amount, fromCurrency, toCurrency) {
    return await SimpleCurrencyConverter.convert(
      amount,
      fromCurrency,
      toCurrency
    );
  }
}

module.exports = { CurrencyService };
```

The code reads its Graft configuration entirely from the `GRAFT_CONFIG` environment variable. It has no knowledge of whether the Python module runs in-process or on a remote host - that decision lives outside the code, in the deployment configuration. This is the key to switching architectures without code changes.

## Step 2. Host the service with Graftcode Gateway

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

Build and run the container, passing the **monolith** configuration through an environment variable:

```bash
docker build --no-cache --pull -t js-currency-service:test .
docker run -d \
  -e GRAFT_CONFIG="name=graft.pypi.sdncenter_currency_converter;host=inMemory;modules=currency_converter;runtime=python" \
  -p 80:80 -p 81:81 \
  --name js_currency_service js-currency-service:test
```

`host=inMemory` tells Graftcode to load and execute the Python module inside the same process - no network calls, no separate service.

Open [http://localhost:81/GV](http://localhost:81/GV) and try calling `CurrencyService.convertCurrency` with values like `100`, `"USD"`, `"EUR"`.

At this point, everything runs inside **one container** - your JavaScript logic and the Python currency converter module share a single process. This is your monolith.

## Step 3. Extract the Python module as a separate microservice

Now let's take that same Python module and host it independently in its own container.

Create a new folder called `PythonCurrencyService` and add a `Dockerfile` inside it:

```bash
mkdir ../PythonCurrencyService
cd ../PythonCurrencyService
```

```dockerfile
FROM python:3.11-slim
WORKDIR /usr/app

RUN pip install sdncenter-currency-converter --target ./sdncenter_currency_converter

RUN mkdir -p /usr/app \
    && apt-get update \
    && apt-get install -y wget \
    && wget -O /usr/app/gg.deb \
       https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
    && dpkg -i /usr/app/gg.deb \
    && rm /usr/app/gg.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

CMD ["gg", "--modules", "/usr/app/sdncenter_currency_converter/", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

Build and run it, then connect both containers to a shared Docker network:

```bash
docker build -t pythoncurrencyservice:latest .
docker run -d -p 90:90 -p 91:91 -p 9092:9092 --name pythoncurrencyservice pythoncurrencyservice:latest
docker network create mynetwork
docker network connect mynetwork js_currency_service
docker network connect mynetwork pythoncurrencyservice
```

You can verify the Python module is running independently at [http://localhost:91/GV](http://localhost:91/GV). The currency converter is now a standalone microservice.

## Step 4. Switch from monolith to microservice

Stop and restart your JavaScript service with a different value for `GRAFT_CONFIG` - pointing at the remote Python service instead of in-memory execution:

```bash
docker stop js_currency_service
docker rm js_currency_service
docker run -d --network mynetwork \
  -e GRAFT_CONFIG="name=graft.pypi.sdncenter_currency_converter;host=pythoncurrencyservice:9092;runtime=python;modules=/usr/app" \
  -p 80:80 -p 81:81 \
  --name js_currency_service js-currency-service:test
```

Compare the two environment variable values side by side:

```text
# Monolith (in-process)
host=inMemory

# Microservice (remote)
host=pythoncurrencyservice:9092
```

That is the only difference. The same Docker image, the same JavaScript code - just a different environment variable.

Open [http://localhost:81/GV](http://localhost:81/GV) and call `CurrencyService.convertCurrency` again with the same inputs. Same method, same result - but the Python execution now happens over the network in a separate container.

## Step 5. Prove the call goes over the network

Want proof that the call is truly remote? Stop the Python service:

```bash
docker stop pythoncurrencyservice
```

Call `convertCurrency` again in Graftcode Vision - you'll see a connection error because the remote service is down.

Start it again:

```bash
docker start pythoncurrencyservice
```

The method works again. Your JavaScript code didn't change at any point - only the deployment topology did.

## Old Way vs New Way

### Without Graftcode

Extracting a module into a microservice typically requires:

- Building a new service with REST or gRPC endpoints wrapping the module
- Defining request/response DTOs for every operation
- Hosting and deploying the new service separately
- Rewriting your JavaScript code to use HTTP or gRPC clients
- Implementing client-side DTOs and response mapping
- Redeploying your application with the new integration code

### With Graftcode

- Host any public module as a standalone microservice - as-is, no modifications needed
- Switch between monolith and microservice with one configuration value and a container restart
- No new code, no new clients, no new endpoints

> With Graftcode, migrating between monolith and microservices (or back) is not a rewrite - it's a configuration change. Your code stays focused on business logic while the architecture adapts to your operational needs.
