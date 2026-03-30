---
title: "JavaScript"
description: "Expose a JavaScript backend through Graftcode Gateway so its public methods become discoverable and installable without building REST routes or OpenAPI specs."
---

## Goal

Turn a small JavaScript module into a remotely callable backend service with Graftcode Gateway.

### What You'll See

- Create a small backend module with public logic.
- Run it through Graftcode Gateway.
- Explore the result in Graftcode Vision and install it from another app.

## Step 1. Create a small JavaScript service

Create a simple Node.js project and add one file such as `src/energyPriceCalculator.js`:

```javascript
class EnergyPriceCalculator {
  static getPrice() {
    return Math.floor(Math.random() * 5) + 100;
  }
}

module.exports = { EnergyPriceCalculator };
```

## Step 2. Run it with Graftcode Gateway

Add a `Dockerfile` that installs Graftcode Gateway and points it at your JavaScript module:

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

CMD ["gg", "--modules", "/usr/app/src/energyPriceCalculator.js"]
```

## Step 3. Build and run the container

```bash
docker build --no-cache --pull -t myenergyservice-js:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_demo_js myenergyservice-js:test
```

This starts the service endpoint on port `80` and Graftcode Vision on port `81`.

## Step 4. Explore the service in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV).

You should see your public JavaScript methods exposed as a service together with the package manager command needed to install them as a Graft in another app.

## Step 5. Use it in another app

From Graftcode Vision, you can now select your correlated package type (npm, nuget, pypi, etc.) and copy the generated install command to use it in any frontend or backend project.

That is the main value of Graftcode: your JavaScript logic becomes a typed dependency for other applications, without writing REST handlers, request models, or client SDK code. When you add or update a public method, consumers get notified through their package manager and can update with a single command - the same way they update any other dependency.
