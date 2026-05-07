---
title: "Java"
description: "Challenge 3 — call the lottery service from another Java service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the **Challenge 3 lottery service** from your own Java backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [JDK 17+](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

```bash
mkdir java-lottery-consumer
cd java-lottery-consumer
```

## Step 2. Install the Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `Maven`, and copy the dependency. Each challenge has its own service — Challenge 3 ships as `graft.nuget.lotterychallenge3`.

Create `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>lottery</groupId>
    <artifactId>java-lottery-consumer</artifactId>
    <version>1.0-SNAPSHOT</version>
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
            <artifactId>lotterychallenge3</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
</project>
```

## Step 3. Call the lottery method

Create `src/main/java/lottery/Main.java`:

```java
package lottery;

import graft.nuget.LotteryChallenge3.GraftConfig;
import graft.nuget.LotteryChallenge3.Challenge3;

public class Main {
    public static void main(String[] args) throws Exception {
        GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

        int tickets = Challenge3.addTickets("you@example.com");
        System.out.println("Challenge 3 complete — tickets in pool: " + tickets);
    }
}
```

Run it:

```bash
mvn compile exec:java "-Dexec.mainClass=lottery.Main"
```

`Challenge3.addTickets(...)` is a remote call but reads like a normal method invocation. Your IDE autocompletes it because the Graft is a real Maven dependency.

## Step 4. Use a Project Key for production

For real-world use, create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> No REST clients, no DTOs, no spec syncing — just one Maven dependency and call.
