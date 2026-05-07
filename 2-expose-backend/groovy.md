---
title: "Groovy"
description: "Challenge 2 — turn a Groovy class into a remotely callable lottery service with Graftcode Gateway. No Spring, no REST, no specs."
---

## Goal

Expose your own **lottery service** built in Groovy — any public method becomes instantly callable from any language, no Spring, no REST routes, no OpenAPI specs.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

```bash
mkdir groovy-lottery-service
cd groovy-lottery-service
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
        <groovy.version>4.0.24</groovy.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
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
                    <execution><goals><goal>compile</goal></goals></execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

## Step 2. Write the lottery class

Create `src/main/groovy/lottery/Lottery.groovy`:

```groovy
package lottery

import java.util.concurrent.ConcurrentHashMap

class Lottery {
    private static final ConcurrentHashMap<String, Integer> POOL = new ConcurrentHashMap<>()

    static int addTicket(String email) {
        POOL.merge(email, 1, { a, b -> a + b })
    }
}
```

Groovy methods are public by default — every method becomes remotely callable once hosted.

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
docker build --no-cache --pull -t lottery-service-groovy:test .
docker run -d -p 80:80 -p 81:81 --name lottery_demo_groovy lottery-service-groovy:test
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
