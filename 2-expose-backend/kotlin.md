---
title: "Kotlin"
description: "Challenge 2 — expose your own Kotlin booth service that internally calls the central Lottery service. Compose remote services like local code."
---

## Goal

Build your own Kotlin backend service that **internally calls the central Lottery service** (built and hosted by us) to add tickets, then expose your service through Graftcode Gateway. Same `gg` workflow on both sides — you're a Graft consumer **and** a Graftcode producer at once.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

```bash
mkdir kotlin-booth-service
cd kotlin-booth-service
```

## Step 2. Add the Lottery Graft dependency

Create `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>booth-service</artifactId>
    <version>1.0.0</version>
    <properties>
        <kotlin.version>2.0.21</kotlin.version>
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
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
        <dependency>
            <groupId>graft.nuget</groupId>
            <artifactId>lottery</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
    <build>
        <sourceDirectory>src/main/kotlin</sourceDirectory>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>${kotlin.version}</version>
                <executions>
                    <execution><id>compile</id><goals><goal>compile</goal></goals></execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

The central Lottery service is implemented and hosted by us — `graft.nuget.lottery` is the typed Graft your booth calls into.

## Step 3. Write the booth class

Create `src/main/kotlin/booth/Booth.kt`:

```kotlin
package booth

import graft.nuget.Lottery.GraftConfig
import graft.nuget.Lottery.Lottery

class Booth {
    companion object {
        init {
            GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"
        }

        @JvmStatic
        fun checkIn(email: String): String {
            val tickets = Lottery.addTicket(email)
            return "Welcome $email! Total tickets in pool: $tickets"
        }
    }
}
```

`Booth.checkIn(email)` is your method. Inside, it calls the remote `Lottery.addTicket(email)` like a normal Kotlin call — no REST client, no DTOs.

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
docker build --no-cache --pull -t booth-service-kotlin:test .
docker run -d -p 80:80 -p 81:81 --name booth_demo_kotlin booth-service-kotlin:test
```

Inside the container, `gg` exposes `Booth.checkIn`. Your code reaches across the network to the central Lottery for every call.

## Step 5. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Booth.checkIn` — hit **Try it out**, pass your email, and the response shows your total ticket count from the central Lottery.

> Your booth is both a producer (its `Booth.checkIn` is callable) and a consumer (it calls remote `Lottery.addTicket`). Same `gg` workflow on both sides — no REST, no DTOs, no client code.
