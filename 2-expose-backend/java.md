---
title: "Java"
description: "Challenge 2 — expose your own Java booth service that internally calls the central Lottery service. Compose remote services like local code."
---

## Goal

Build your own Java backend service that **internally calls the central Lottery service** (built and hosted by us) to add tickets, then expose your service through Graftcode Gateway. Same `gg` workflow on both sides — you're a Graft consumer **and** a Graftcode producer at once.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

```bash
mkdir java-booth-service
cd java-booth-service
```

## Step 2. Add the Lottery Graft dependency

The central Lottery service is implemented and hosted by us. Add its Graft to your `pom.xml`:

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

## Step 3. Write the booth class

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
}
```

`Booth.checkIn(email)` is your method. Inside, it calls the remote `Lottery.addTicket(email)` like a normal Java call — no REST client, no DTOs.

## Step 4. Host with Graftcode Gateway

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

CMD ["gg", "--modules", "/usr/app/target/booth-service-1.0.0.jar", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-service-java:test .
docker run -d -p 80:80 -p 81:81 --name booth_demo_java booth-service-java:test
```

Inside the container, `gg` exposes `Booth.checkIn`. Your code reaches across the network to the central Lottery for every call.

## Step 5. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Booth.checkIn` — hit **Try it out**, pass your email, and the response shows your total ticket count from the central Lottery.

> Your booth is both a producer (its `Booth.checkIn` is callable) and a consumer (it calls remote `Lottery.addTicket`). Same `gg` workflow on both sides — no REST, no DTOs, no client code.
