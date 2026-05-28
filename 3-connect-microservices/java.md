---
title: "Java"
description: "Challenge 3 — call the central Lottery service from another Java service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the central **Lottery service** (built and hosted by us) from your own Java backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [JDK 17+](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll call the central Lottery service from your backend by installing a typed Graft package.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create a project folder

```bash
mkdir java-lottery-consumer
cd java-lottery-consumer
```

## Step 4. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `Maven`, and copy the dependency. The Lottery service is published by us as a strongly-typed Graft you can install like any other Maven dependency.

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
            <artifactId>lottery</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
</project>
```

## Step 5. Call the lottery method

Create `src/main/java/lottery/Main.java`:

```java
package lottery;

import graft.nuget.Lottery.GraftConfig;
import graft.nuget.Lottery.Lottery;

public class Main {
    public static void main(String[] args) throws Exception {
        GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";

        int tickets = Lottery.addTicket("you@example.com");
        System.out.println("Challenge 3 complete — tickets in pool: " + tickets);
    }
}
```

Run it:

```bash
mvn compile exec:java "-Dexec.mainClass=lottery.Main"
```

`Lottery.addTicket(...)` is a remote call but reads like a normal method invocation. Your IDE autocompletes it because the Graft is a real Maven dependency.

> No REST clients, no DTOs, no spec syncing — just one Maven dependency and call.
