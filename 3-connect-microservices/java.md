---
title: "Java"
description: "Connect one Java backend service to another with Graftcode - no REST clients, no DTOs, no handwritten integration code. Install a strongly-typed Graft and call remote methods directly from your service logic."
---

## Goal

Connect a Java backend service to another remote service using Graftcode - so the remote integration stays strongly typed and reads like a normal method call.

### What You'll See

- Install a remote service as a strongly-typed Graft via Maven.
- Configure the generated client to point at the remote host.
- Call a remote method from your own service logic as if it were a local class.
- Use IDE autocompletion on the remote service's methods and classes.

### Prerequisites

- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally
* minimum JDK 17

## Step 1. Create a Java service

Create a new project folder for your backend service:

```bash
mkdir java-energy-consumer
cd java-energy-consumer
```

## Step 2. Find the remote method in Graftcode Vision

We're hosting this sample service for you so you can see exactly what connecting to another team's service looks like in practice - open it in [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io) to explore.

Graftcode Vision shows all public classes and methods exposed by the remote service - their names, parameter types, and return types. It also gives you the exact package manager command needed to install that service as a Graft.

## Step 3. Install the Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `Maven`, and copy the generated dependency coordinates.

`hypertube-java-sdk` is still required for this example today, but that extra step is temporary.

Create a `pom.xml` with the Graft dependency and the Graftcode repository:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>energy</groupId>
    <artifactId>java-energy-consumer</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <repositories>
        <repository>
            <id>graft-repository</id>
            <url>https://grft.dev/maven2/4b4e411f-60a0-4868-b8a6-46f5dee07448__free</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>graft.nuget</groupId>
            <artifactId>energypriceservice</artifactId>
            <version>1.2.0</version>
        </dependency>
    </dependencies>
</project>
```

This adds the generated strongly-typed client for the remote service to your project.

## Step 4. Call the remote method and run it

The exact configuration snippet for your language is available in [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io) under the **Configuration** installation tab. Create `src/main/java/energy/Main.java`:

```java
package energy;

import graft.nuget.EnergyPriceService.GraftConfig;
import graft.nuget.EnergyPriceService.EnergyPriceService.MeterLogic;

public class Main {
    public static void main(String[] args) throws Exception {
        GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

        int consumption = MeterLogic.netConsumptionKWh(1000, 1150);
        System.out.println("Net consumption: " + consumption);
    }
}
```

Run it:

```bash
mvn compile exec:java "-Dexec.mainClass=energy.Main"
```

You should see the net consumption value printed in your terminal. `MeterLogic.NetConsumptionKWh(...)` is a remote call, but your code reads like a normal method invocation - no HTTP request, no response parsing, no serialization.

Your IDE can autocomplete available methods on `MeterLogic`, `BillingLogic`, and any other class from that service because the Graft is a real Maven dependency.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

With a Project Key, point `GraftConfig.host` at your project's stable registry URL instead of a raw WebSocket address. A Project Key gives you:

- **Stable registry URL** - the address for your Grafts stays permanent, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Connecting one backend service to another typically requires:

- Designing and implementing REST or gRPC endpoints in the remote service
- Defining request/response DTOs for every operation
- Writing or generating an OpenAPI or Protobuf spec
- Building or generating a client SDK in the consuming service's language
- Manually keeping both sides in sync when signatures change
- Adding error handling, retry logic, and serialization code

### With Graftcode

- Install the remote service as a strongly-typed Graft via Maven
- Import its classes and call methods directly - no REST client code
- When the remote service changes, update with one command - like any other dependency

> Connecting two backend services with Graftcode is as simple as adding a Maven dependency. No REST routes, no DTOs, no client generation - just import and call.

![Old Way vs Graftcode](../assets/BackendOldWayNewWay.png)

</collapsible>
