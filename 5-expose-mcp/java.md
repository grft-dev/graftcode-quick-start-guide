---
title: "Java"
description: "Challenge 5 — make your Java lottery class callable by AI agents through MCP with Graftcode Gateway. Zero MCP server code, zero tool definitions."
---

## Goal

Expose your **lottery service** as MCP tools so an AI agent (Cursor, Claude Desktop) can enter you in the draw on its own. Zero MCP server code, zero tool definitions.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally
- An AI tool with MCP support — e.g. [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a project folder

```bash
mkdir java-lottery-mcp
cd java-lottery-mcp
```

Create `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>lottery-service</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
</project>
```

## Step 2. Write the lottery class

Create `src/main/java/lottery/Lottery.java`:

```java
package lottery;

import java.util.concurrent.ConcurrentHashMap;

public class Lottery {
    private static final ConcurrentHashMap<String, Integer> POOL = new ConcurrentHashMap<>();

    public static int addTicket(String email) {
        return POOL.merge(email, 1, Integer::sum);
    }

    public static int getTickets(String email) {
        return POOL.getOrDefault(email, 0);
    }
}
```

A plain Java class — no MCP-specific interfaces. Every public method becomes a callable MCP tool once hosted.

## Step 3. Host it with Graftcode Gateway

Create a `Dockerfile`:

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

CMD ["gg", "--modules", "/usr/app/target/lottery-service-1.0.0.jar"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-mcp-java:test .
docker run -d -p 80:80 -p 81:81 --name lottery_mcp_java lottery-mcp-java:test
```

Static methods are exposed as MCP tools automatically. Port `80` handles service calls + MCP, port `81` serves Graftcode Vision.

## Step 4. Connect your AI tool

For Cursor, edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "lottery-service": {
      "url": "http://localhost:81/mcp"
    }
  }
}
```

(Same idea for Claude Desktop in `claude_desktop_config.json`.)

## Step 5. Let the AI enter you in the lottery

Ask in Cursor:

> "Add a lottery ticket for my email: you@example.com"

The agent discovers `Lottery.addTicket` through MCP and calls it. Try also:

> "How many tickets does you@example.com have?"

The agent calls `Lottery.getTickets("you@example.com")` and replies with the count. No prompt engineering, no tool definitions in your code.

## Step 6. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass it to the gateway:

```dockerfile
CMD ["gg", "--modules", "/usr/app/target/lottery-service-1.0.0.jar", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable MCP URL, stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Any public method is instantly an MCP tool. No tool definitions, no schemas, no API design.
