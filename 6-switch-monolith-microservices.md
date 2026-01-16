---
title: "Switch Between Monolith and Microservices"
order: 6
description: "Learn how to run the exact same service either as part of your app (monolith, in-memory) or remotely (microservice, in the cloud) - just by changing configuration."
---

## Goal

Learn how to run the exact same service either as part of your app (monolith, in-memory) or remotely (microservice, in the cloud) - just by changing configuration.

![](assets/switch-monolith-microservices-1.png)

## What You'll See

- You'll create new container that will host Currency Converter python module with Graftcode Gateway.
- You'll switch a configuration line to connect the same service remotely instead of direct monolith usage.
- You'll see how without any code change you can switch between monolith and microservices architecture.

## Step 1. Run Currency Converter as separate microservice

Let's create a new Dockerfile that will host the Currency Converter module and Graftcode Gateway as separate microservice on your local machine (Graftcode Gateway will just host the module and expose it as remote service).

Create a new folder, inside it create a new file named **Dockerfile** and copy and paste the content below into your Dockerfile:

```PowerShell
mkdir PythonCurrencyService
cd PythonCurrencyService
code .
```

```Dockerfile
FROM python:3.11-slim
WORKDIR /usr/app

# Install our demo sdncenter-currency-converter python module from PyPI into a local folder
RUN pip install sdncenter-currency-converter --target ./sdncenter_currency_converter 

# Install wget and download Graftcode Gateway (GG)
RUN mkdir -p /usr/app  && apt-get update     && apt-get install -y wget     && wget -O /usr/app/gg.deb     https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb     && dpkg -i /usr/app/gg.deb     && rm /usr/app/gg.deb     && apt-get clean     && rm -rf /var/lib/apt/lists/*

# Run Graftcode Gateway pointing at that module
CMD ["gg", "--runtime", "python", "--modules", "/usr/app/sdncenter_currency_converter/", "--httpPort", "91","--port","90","--TCPServer", "--tcpPort=9092"]
```


Now you can run this command to build the container that will install our python module to local directory, download latest Graftcode Gateway and run it to expose that python service for remote consumers through Grafts:

```PowerShell
docker build -t pythoncurrencyservice:latest .
docker run -d -p 90:90 -p 91:91 -p 9092:9092 --name pythoncurrencyservice pythoncurrencyservice:latest
docker network create mynetwork
docker network connect mynetwork graftcode_demo
docker network connect mynetwork pythoncurrencyservice
```

Now you can visit the GraftVision portal at [http://localhost:91/GV](http://localhost:91/GV). 

You will see that the Currency Converter module is now hosted as separate microservice. You can host any other public module in the same way or extract any custom library as separate microservice by just hosting it on Graftcode Gateway in dedicated container.

## Step 2. Switch your CurrencyConverter calls from monolith to microservice

Now we will switch the configuration of your **MyEnergyService** so that it will use the **CurrencyConverter** module hosted in separate container (as microservice) instead of in-memory module (as part of monolith).

To do this, open **Docker Desktop** and navigate to your running **graftcode_demo** container by clicking on it. Then view the files by clicking on **Files** tab and modify **usr/app/graft.pypi.sdncenter_currency_converter-config.json** file (right click and select **Edit file**).

In this file, change the channel section to use TCP/IP connection to your new container instead of in-memory (in-memory means that it is hosted within the same process as your .NET service on the same local machine, whereas TCP/IP means that the connection is made over the network).

![Docker Desktop Container File System](@assets/image_1757595889445.png)

Replace the config file with following content:
```Json
{
  "runtimes": {
    "python": [
      {
        "calledTechKey": null,
        "name": "python__InMemoryRuntime",
        "customOptions": "",
        "channel": {
          "type": "tcp",
          "host": "currencyconverter",
          "port": 9092
        }
      }
    ]
  }
}
```

As you see we just modified the "channel" section to use the TCP/IP connection to the new container (currently hosted on your local machine, but it can be any  remote host or cloud service) instead of in-memory connection. This is the same module that we were using before but now we're connection to it over the network. 

Now, when you restart the container, your app will start using this remote connection to connect to the remote module, without any change in code. 

Run command below to restart your container:

```Powershell
docker stop graftcode_demo
docker start graftcode_demo
```

Now navigate to GraftVision portal for **EnergyService** at [http://localhost:81/GV](http://localhost:81/GV) and try the _GetMyCurrentCost_ method again. 

This time execution of python module **CurrencyConverter** goes over the network to your remote microservice - but your business logic code didn't change. You can dynamically switch architecture between monolith and microservices without any modification in your core logic code - just by simple configuration change.

> ⚡ **Important:** You service is using multiple Grafts and each of them might have its own configuration. Energy Backend keeps calling our hosted cloud service through websockets but your currency converter Graft just switched from in-memory to TCP/IP. All of this can be done through configuration files, environmental variables or from code. This allows you to dynamically change the architecture of your app without any code change.

## Step 4. Old Way vs New Way

### Old Way (without Graftcode)

Without Graftcode similar change would required number of steps:
- building new python service referencing currency service module
- implementing REST endpoints to forward every operation present on currency service module
- implementing DTOs for every argument and result object
- host this service as separate microservice
- modify code of your EnergyPrice service to call new REST endpoints
- implement DTOs and mapping for every method you planned to use
- modify your code usage to REST instead of direct method calls
- deploy your service again

### New Way (with Graftcode)

- You can host any module from public/private repository or any custom library "as is" without even preparing it for remote calls
- You can switch between monolith and microservices with just configuration change and just restart service

> ⚡ **Important:**
> With Graftcode, migrating from monolith to microservices (or back) is no longer a rewrite - it's just a configuration change.
