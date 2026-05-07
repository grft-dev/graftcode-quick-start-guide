---
title: "Kotlin"
description: "Challenge 2 — turn a Kotlin class into a remotely callable lottery service with Graftcode Gateway. No Spring, no REST, no specs."
---

## Goal

Expose your own **lottery service** built in Kotlin — any public method becomes instantly callable from any language, no Spring, no REST routes, no OpenAPI specs.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

```bash
mkdir kotlin-lottery-service
cd kotlin-lottery-service
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
        <kotlin.version>2.0.21</kotlin.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib</artifactId>
            <version>${kotlin.version}</version>
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

## Step 2. Write the lottery class

Create `src/main/kotlin/lottery/Lottery.kt`:

```kotlin
package lottery

import java.util.concurrent.ConcurrentHashMap

class Lottery {
    companion object {
        private val pool = ConcurrentHashMap<String, Int>()

        @JvmStatic
        fun addTicket(email: String): Int =
            pool.merge(email, 1, Int::plus)!!
    }
}
```

`@JvmStatic` ensures the method is exposed as a static method on the JVM — Graftcode Gateway picks it up automatically.

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
docker build --no-cache --pull -t lottery-service-kotlin:test .
docker run -d -p 80:80 -p 81:81 --name lottery_demo_kotlin lottery-service-kotlin:test
```

`gg` discovers `Lottery.addTicket(String)` and exposes it. Port `80` handles service calls, port `81` serves Graftcode Vision.

## Step 4. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Lottery.addTicket` listed — hit **Try it out**, pass your email, and watch the ticket count grow.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass it to the gateway:

```dockerfile
CMD ["gg", "--modules", "/usr/app/target/lottery-service-1.0.0.jar", "--projectKey", "YOUR_PROJECT_KEY"]
```

You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), access control, and an [MCP endpoint](https://modelcontextprotocol.io/) for free.

> One Dockerfile, no API design. Your `Lottery.addTicket(email)` is now callable from any app, in any language.
