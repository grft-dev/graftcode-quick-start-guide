---
title: "Java"
description: "Make any Java class callable by AI agents through MCP with Graftcode Gateway - no API design, no tool definitions, no MCP server code. Any public method becomes an MCP tool automatically."
---

## Goal

Turn a Java class into an MCP-compatible service that AI agents can discover and call - with zero MCP server code, no tool definitions, and no OpenAPI specs.

### What You'll See

- Create a small Java class with public methods.
- Host it through Graftcode Gateway using Docker - the gateway automatically exposes an MCP endpoint.
- Connect an AI tool (Cursor or Claude Desktop) to the MCP endpoint.
- Ask the AI agent to call your methods - it discovers and invokes them through the Model Context Protocol.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally
- An AI tool with MCP support - for example [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a project folder

Create a new folder and set up a Maven project:

```bash
mkdir java-ai-backend
cd java-ai-backend
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
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
```

## Step 2. Write a Java class with public methods

Create `src/main/java/energy/EnergyPriceCalculator.java`:

```java
package energy;

import java.util.Random;

public class EnergyPriceCalculator {
    public static int getPrice() {
        return new Random().nextInt(5) + 100;
    }

    public static int calculateBill(int kwhUsed) {
        var pricePerKwh = new Random().nextInt(5) + 100;
        return kwhUsed * pricePerKwh;
    }
}
```

This is a plain Java class - no annotations, no frameworks, no MCP-specific interfaces. Any public method you write here will automatically become a callable MCP tool once hosted through Graftcode Gateway.

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

CMD ["gg"]
```

`gg` (Graftcode Gateway) reads your `pom.xml`, discovers all public methods, and exposes them automatically - both as Grafts for app-to-app calls and as MCP tools for AI agents. Port `80` handles service calls and the MCP endpoint, port `81` serves Graftcode Vision.

<collapsible title="🐳 Understanding the Dockerfile - click to see what each line does">

- **FROM maven:3.9-eclipse-temurin-21** - Uses the official Maven image with JDK 21 as the base, which includes everything needed to build and run Java applications.
- **COPY . /usr/app/** - Copies your project files (including `pom.xml` and source files) into the container.
- **RUN mvn package -q** - Compiles the project and packages it into a JAR in `target/`.
- **RUN apt-get update && apt-get install -y wget** - Installs tools needed to download Graftcode Gateway.
- **wget -O /usr/app/gg.deb ... && dpkg -i /usr/app/gg.deb** - Downloads and installs the latest Graftcode Gateway package.
- **EXPOSE 80** - Declares the port used for service communication, including the MCP endpoint.
- **EXPOSE 81** - Declares the port used by Graftcode Vision, the live portal for exploring and testing exposed methods.
- **CMD ["gg"]** - Runs Graftcode Gateway. It reads `pom.xml` to find your compiled classes, discovers public methods, and exposes them as both Grafts and MCP tools.

</collapsible>

Build and run the container:

```bash
docker build --no-cache --pull -t java-ai-backend:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_mcp_demo_java java-ai-backend:test
```

Your Java service is now running with an MCP endpoint exposed automatically by Graftcode Gateway.

## Step 4. Explore the service in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV) in your browser.

You will see all public methods from your Java class - their names, parameter types, and return types. Every method listed here is also available as an MCP tool that AI agents can discover and call. Graftcode Vision also provides:

- A **"Try it out"** button to call methods live, directly from the browser.
- A **package manager command** to install this service as a strongly-typed client in any other application.

## Step 5. Connect an AI tool to the MCP endpoint

Graftcode Gateway exposes an [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) endpoint alongside your service automatically. Point your AI tool at it.

**For Cursor**, create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "energy-service": {
      "url": "http://localhost/mcp"
    }
  }
}
```

**For Claude Desktop**, edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "energy-service": {
      "url": "http://localhost/mcp"
    }
  }
}
```

The AI tool now sees your Java methods as callable tools - with their names, parameters, and return types - discovered automatically through MCP.

## Step 6. Call your methods through AI

Open your AI tool and ask it to use your service. For example, in Cursor:

> "What is the current energy price?"

The AI agent discovers `EnergyPriceCalculator.getPrice()` through MCP and calls it directly. You can also try:

> "Calculate the energy bill for 250 kWh"

The agent calls `EnergyPriceCalculator.calculateBill(250)` and returns the result. No prompt engineering, no tool definitions in your code - MCP handles discovery and invocation automatically.

## Step 7. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateway:

```dockerfile
CMD ["gg", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable MCP URL** - AI tools connect to a permanent endpoint that doesn't change when you redeploy.
- **Stable registry URL** - consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can access your MCP endpoint and download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Making backend methods callable by AI agents typically requires:

- Implementing an MCP server with explicit tool definitions for each operation
- Mapping each tool to your business logic manually
- Defining input and output JSON schemas for every tool
- Hosting and maintaining the MCP server alongside your service
- Updating tool definitions every time your backend methods change
- Or exposing a REST API and writing custom function-calling schemas for each AI platform

### With Graftcode

- Write your business logic as plain public methods - no MCP server code, no tool definitions, no schemas
- Run it on Graftcode Gateway with one Dockerfile
- Every public method is automatically available as an MCP tool
- When you add or change a method, AI tools discover the update immediately

> Your Java class is now an AI-callable backend service - with one Dockerfile and two commands. Any public method you add is instantly discoverable by AI agents through MCP. No tool definitions, no API design, no integration code.

</collapsible>
