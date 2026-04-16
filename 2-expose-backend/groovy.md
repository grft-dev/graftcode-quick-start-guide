---
title: "Groovy"
description: "Turn a Groovy class into a remotely callable backend service with Graftcode Gateway - no Spring, no REST routes, no OpenAPI specs. Any public method becomes instantly available to call from any language."
---

## Goal

Turn a Groovy class into a remotely callable backend service using Graftcode Gateway - no Spring, no REST routes, no OpenAPI specs needed.

### What You'll See

- Create a small Groovy class with public methods.
- Host it through Graftcode Gateway using Docker.
- Explore the exposed methods in Graftcode Vision - your service is now accessible from any app as a strongly-typed client.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

Create a new folder and set up a Maven project:

```bash
mkdir groovy-energy-service
cd groovy-energy-service
```

Create a `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>energy-service</artifactId>
    <version>1.0.0</version>

    <properties>
        <groovy.version>4.0.24</groovy.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.groovy</groupId>
            <artifactId>groovy</artifactId>
            <version>${groovy.version}</version>
        </dependency>
    </dependencies>

    <build>
        <sourceDirectory>src/main/groovy</sourceDirectory>
        <plugins>
            <plugin>
                <groupId>org.codehaus.gmavenplus</groupId>
                <artifactId>gmavenplus-plugin</artifactId>
                <version>3.0.2</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

## Step 2. Write a Groovy class with public methods

Create the directory structure and a file `src/main/groovy/energy/EnergyPriceCalculator.groovy`:

```groovy
package energy

class EnergyPriceCalculator {
    static int getPrice() {
        return new Random().nextInt(5) + 100
    }
}
```

This is a plain Groovy class - no annotations, no frameworks, no special interfaces. Groovy methods are public by default, so every method you write here will automatically become available for remote consumption once hosted through Graftcode Gateway.

## Step 3. Host it with Graftcode Gateway

Create a `Dockerfile` in the project root:

```dockerfile
FROM maven:3.9-eclipse-temurin-21

WORKDIR /usr/app

COPY . /usr/app/

RUN mvn package -q

RUN apt-get update \ 
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg","--modules", "/usr/app/target/energy-service-1.0.0.jar"]
 
```

The key line is the last one - `gg` (Graftcode Gateway) reads your compiled JAR, discovers all public methods in your Groovy classes, and exposes them automatically. Port `80` handles service calls, port `81` serves Graftcode Vision.

<collapsible title="🐳 Understanding the Dockerfile - click to see what each line does">

- **FROM maven:3.9-eclipse-temurin-21** - Uses the official Maven image with JDK 21 as the base, which includes everything needed to build and run Groovy applications via Maven.
- **COPY . /usr/app/** - Copies your project files (including `pom.xml` and source files) into the container.
- **RUN mvn package -q** - Compiles the Groovy source and packages it into a JAR in `target/`.
- **RUN apt-get update && apt-get install -y wget** - Installs tools needed to download Graftcode Gateway.
- **wget -O /usr/app/gg.deb ... && dpkg -i /usr/app/gg.deb** - Downloads and installs the latest Graftcode Gateway package.
- **EXPOSE 80** - Declares the port used for service communication (Grafts connect here).
- **EXPOSE 81** - Declares the port used by Graftcode Vision, the live portal for exploring and testing exposed methods.
- **CMD ["gg"]** - Runs Graftcode Gateway. It reads the compiled JAR, discovers public methods, and makes them callable.

</collapsible>

Build and run the container:

```bash
docker build --no-cache --pull -t myenergyservice-groovy:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_demo_groovy myenergyservice-groovy:test
```

Your Groovy service is now running and exposed through Graftcode Gateway.

## Step 4. Explore the service in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV) in your browser.

You will see all public methods from your Groovy class - their names, parameter types, and return types. Graftcode Vision also provides:

- A **"Try it out"** button to call methods live, directly from the browser.
- A **package manager command** (npm, NuGet, PyPI, Maven, etc.) to install this service as a strongly-typed client in any other application.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateway:

```dockerfile
CMD ["gg", "--modules", "/usr/app/target/energy-service-1.0.0.jar", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable registry URL** - consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.
- **MCP endpoint** - Graftcode Gateway automatically exposes an [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) endpoint alongside your service, making your methods callable by AI agents and LLM-based tools out of the box.

## Step 6. Call it from another app

Your service is now accessible from any application. From Graftcode Vision, select your target package type - for example `Maven` - and copy the generated install command. That installs a **Graft**: a strongly-typed client that lets any app call your service methods directly.

```groovy
import com.graft.maven.energypricecalculator.EnergyPriceCalculator

def price = EnergyPriceCalculator.getPrice()
println price
```

No REST clients, no request/response models, no endpoint URLs in your code. When you add or update a public method, consumers update their Graft with a single package manager command.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Exposing backend logic for remote consumption typically requires:

- Designing and implementing REST or gRPC endpoints for each operation
- Defining request and response DTOs / schemas
- Writing or generating an OpenAPI / Protobuf spec
- Building or generating client SDKs for each consumer technology
- Maintaining and versioning the API contract over time
- Updating all clients whenever the backend changes

### With Graftcode

- Write your business logic as plain public methods - no Spring, no routes, no specs
- Run it on Graftcode Gateway with one Dockerfile
- Consumers install a typed Graft via their package manager and call methods directly
- When you add or change a method, consumers update with one command - like any other dependency

> Your Groovy class is now a fully accessible backend service - with one Dockerfile and two commands. Any public method you add is instantly discoverable and callable from any language and any platform. No endpoint design, no client SDK maintenance, no integration code.

![Old Way vs Graftcode](../assets/BackendOldWayNewWay.png)

</collapsible>
