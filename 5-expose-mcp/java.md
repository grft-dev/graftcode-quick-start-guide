---
title: "Java"
description: "Challenge 5 — expose your own Java booth service to AI agents through MCP. Internally it calls the central Lottery service."
---

## Goal

Build your own Java booth service that **internally calls the central Lottery service** (built and hosted by us), then expose it through Graftcode Gateway's MCP endpoint so an AI agent (Cursor, Claude Desktop) can enter you in the draw on its own.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally
- An AI tool with MCP support — e.g. [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a project folder

```bash
mkdir java-booth-mcp
cd java-booth-mcp
```

Create `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>booth-service</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
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
            <artifactId>lottery</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
</project>
```

## Step 2. Write the booth class

Create `src/main/java/booth/Booth.java`:

```java
package booth;

import graft.nuget.Lottery.GraftConfig;
import graft.nuget.Lottery.Lottery;

public class Booth {
    static {
        GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
    }

    public static String checkIn(String email) throws Exception {
        int tickets = Lottery.addTicket(email);
        return "Welcome " + email + "! Total tickets in pool: " + tickets;
    }

    public static int howManyTickets(String email) throws Exception {
        return Lottery.getTickets(email);
    }
}
```

Both methods will be exposed as MCP tools automatically — no MCP server code, no tool definitions.

## Step 3. Host with Graftcode Gateway

Create `Dockerfile`:

```dockerfile
FROM maven:3.9-eclipse-temurin-21
WORKDIR /usr/app
COPY . /usr/app/

RUN mvn package -q

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/target/booth-service-1.0.0.jar"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-mcp-java:test .
docker run -d -p 80:80 -p 81:81 --name booth_mcp_java booth-mcp-java:test
```

## Step 4. Connect your AI tool

For Cursor, edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "booth-service": {
      "url": "http://localhost:81/mcp"
    }
  }
}
```

(Same idea for Claude Desktop in `claude_desktop_config.json`.)

## Step 5. Let the AI enter you in the lottery

Ask in Cursor:

> "Check me in to the lottery, my email is you@example.com"

The agent discovers `Booth.checkIn` through MCP and calls it. Inside, your code reaches the central Lottery. Try also:

> "How many lottery tickets does you@example.com have?"

The agent calls `Booth.howManyTickets`, which forwards to the central `Lottery.getTickets`. No prompt engineering, no tool definitions in your code.

## Step 6. Project Key for production

```dockerfile
CMD ["gg", "--modules", "/usr/app/target/booth-service-1.0.0.jar", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable MCP URL, stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Any public method on your booth becomes an MCP tool. Same `gg` workflow as Tutorial 2 — plus AI agents on top.
