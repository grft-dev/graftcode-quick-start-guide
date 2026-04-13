---
title: "Java"
description: "Use a module from any supported technology in your Java service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a Java service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a Python module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using Maven - just like any other dependency.
- Import and call it from your Java code as if it were a native Maven library.
- Host the service through Graftcode Gateway and test the cross-language call live in Graftcode Vision.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

Create a new folder and set up a Maven project:

```bash
mkdir java-python-module-demo
cd java-python-module-demo
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
    <artifactId>currency-demo</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>graftcode</id>
            <url>https://grft.dev/maven2</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>com.hypertube</groupId>
            <artifactId>hypertube-java-sdk</artifactId>
            <version>2.5.0</version>
        </dependency>
        <dependency>
            <groupId>graft.pypi</groupId>
            <artifactId>sdncenter-currency-converter</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
</project>
```

## Step 2. Install a module from another technology

For this example we'll use a Python currency converter from PyPI ([sdncenter-currency-converter](https://pypi.org/project/sdncenter-currency-converter/)), but the same approach works with any module from a supported repository - `npm`, `PyPI`, or `NuGet`.

`hypertube-java-sdk` is still required for this example today, but that extra step is temporary.

The dependencies declared in `pom.xml` above install a **Graft** - a strongly-typed Java client generated from the module. You import and call it like any other Maven dependency, regardless of which technology the module was originally written in.

Download the dependencies:

```bash
mvn dependency:resolve -q
```

## Step 3. Write a service that uses the module

Create `src/main/java/energy/CurrencyService.java`:

```java
package energy;

import graft.pypi.sdncentercurrencyconverter.GraftConfig;
import graft.pypi.sdncentercurrencyconverter.SimpleCurrencyConverter;

public class CurrencyService {
    static {
        GraftConfig.setConfig(System.getenv("GRAFT_CONFIG"));
    }

    public static double convertUsdToEur(double amount) throws Exception {
        return SimpleCurrencyConverter.convert(amount, "USD", "EUR");
    }
}
```

`SimpleCurrencyConverter` comes from a Python package, but in Java it looks like a regular import. The code reads its configuration entirely from the `GRAFT_CONFIG` environment variable - it has no knowledge of which technology the module was written in or whether it runs in-process or on a remote host.

## Step 4. Host the service with Graftcode Gateway

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

CMD ["gg"]
```

`gg` (Graftcode Gateway) reads your `pom.xml`, discovers all public methods, and exposes them automatically. Port `80` handles service calls, port `81` serves Graftcode Vision.

<collapsible title="🐳 Understanding the Dockerfile - click to see what each line does">

- **FROM maven:3.9-eclipse-temurin-21** - Uses the official Maven image with JDK 21 as the base, which includes everything needed to build and run Java applications.
- **COPY . /usr/app/** - Copies your project files (including `pom.xml` and source files) into the container.
- **RUN mvn package -q** - Compiles the project and packages it into a JAR in `target/`, downloading the Graft dependency from the Graftcode registry.
- **RUN apt-get update && apt-get install -y wget** - Installs tools needed to download Graftcode Gateway.
- **wget -O /usr/app/gg.deb ... && dpkg -i /usr/app/gg.deb** - Downloads and installs the latest Graftcode Gateway package.
- **EXPOSE 80** - Declares the port used for service communication (Grafts connect here).
- **EXPOSE 81** - Declares the port used by Graftcode Vision, the live portal for exploring and testing exposed methods.
- **CMD ["gg"]** - Runs Graftcode Gateway. It reads `pom.xml` to find your compiled classes, discovers public methods, and makes them callable.

</collapsible>

Build and run the container, passing the Graft configuration through an environment variable:

```bash
docker build --no-cache --pull -t java-python-module-demo:test .
docker run -d \
  -e GRAFT_CONFIG="name=graft.pypi.sdncentercurrencyconverter;host=inMemory;modules=currency_converter;runtime=python" \
  -p 80:80 -p 81:81 \
  --name java_python_demo java-python-module-demo:test
```

`host=inMemory` tells Graftcode to load and execute the module inside the same process - no network calls, no separate service.

## Step 5. Test the cross-language call in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV) in your browser.

You will see `CurrencyService.convertUsdToEur` listed with its parameter types. Click **"Try it out"** and call it with a value like `100` - the result is a live currency conversion, executed by the Python module running inside your Java service. The same workflow applies to any module from any supported technology.

## Step 6. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateway:

```dockerfile
CMD ["gg", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable registry URL** - consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

## Old Way vs New Way

### Without Graftcode

Using a module from another language in Java typically requires:

- Building a separate service around the module with REST or gRPC endpoints
- Defining request and response DTOs for every operation
- Hosting and deploying that service independently
- Writing HTTP or gRPC client code in your Java project
- Maintaining the integration layer as the module evolves
- Or rewriting the module entirely in Java

### With Graftcode

- Install any public module from PyPI, NuGet, or npm as a strongly-typed Graft with one Maven dependency
- Import and call it like a regular Java class - no wrappers, no clients
- The module runs in-process or on a remote host, controlled by one environment variable

> Technology choice stops being an integration constraint. You can keep writing Java and use the best libraries from any ecosystem - Python, .NET, JavaScript - as if they were native Maven dependencies.
