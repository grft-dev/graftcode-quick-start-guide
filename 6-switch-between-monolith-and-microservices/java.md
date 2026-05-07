---
title: "Java"
description: "Challenge 6 — run two Java classes as a monolith, then split one off as a microservice. Switch back and forth with one environment variable."
---

## Goal

Start with two Java classes — `LotteryService` and `TicketCounter` — running as a monolith. Extract `TicketCounter` into a standalone microservice. Then flip between monolith and microservice with **one environment variable** — zero code changes from then on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create the project

```bash
mkdir java-lottery-platform
cd java-lottery-platform
```

Create `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>lottery-platform</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
</project>
```

## Step 2. Write the two classes

Create `src/main/java/lottery/TicketCounter.java`:

```java
package lottery;

import java.util.concurrent.ConcurrentHashMap;

public class TicketCounter {
    private static final ConcurrentHashMap<String, Integer> POOL = new ConcurrentHashMap<>();

    public static int addTicket(String email) {
        return POOL.merge(email, 1, Integer::sum);
    }
}
```

Create `src/main/java/lottery/LotteryService.java`:

```java
package lottery;

public class LotteryService {
    public static int enter(String email) {
        return TicketCounter.addTicket(email);
    }
}
```

A regular method call — direct in-process. No Graftcode involved yet.

## Step 3. Host as a monolith

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

CMD ["gg", "--modules", "/usr/app/target/lottery-platform-1.0.0.jar"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-platform-java:test .
docker run -d -p 80:80 -p 81:81 --name lottery_platform lottery-platform-java:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `LotteryService.enter("you@example.com")`. Both classes run inside one container.

## Step 4. Extract TicketCounter into its own project

Move the file into a sub-project so it can ship as its own JAR:

```bash
mkdir -p ticket-counter/src/main/java/lottery
mv src/main/java/lottery/TicketCounter.java ticket-counter/src/main/java/lottery/
```

Create `ticket-counter/pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>ticket-counter</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
</project>
```

Add it as a dependency in the root `pom.xml`:

```xml
<dependencies>
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>ticket-counter</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

And update the root `Dockerfile` to install the sub-project first:

```dockerfile
RUN cd ticket-counter && mvn install -q && cd ..
RUN mvn package -q
```

The monolith still works exactly as before.

## Step 5. Run TicketCounter as a standalone service

Create `Dockerfile.ticketCounter`:

```dockerfile
FROM maven:3.9-eclipse-temurin-21
WORKDIR /usr/app
COPY ticket-counter /usr/app/

RUN mvn package -q

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/target/ticket-counter-1.0.0.jar", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

```bash
docker build --no-cache --pull -f Dockerfile.ticketCounter -t ticket-counter-java:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name ticket_counter ticket-counter-java:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `TicketCounter` is now its own service.

## Step 6. Connect through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the Maven coordinates and add the Graftcode repository + dependency to the root `pom.xml`:

```xml
<repositories>
    <repository>
        <id>graft-repository</id>
        <url>https://grft.dev/maven2/YOUR_KEY__free</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>graft.maven.com.example</groupId>
        <artifactId>ticket-counter</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

Update `src/main/java/lottery/LotteryService.java` — the **only code change** in the entire tutorial:

```java
package lottery;

import com.graft.maven.ticketcounter.GraftConfig;
import com.graft.maven.ticketcounter.TicketCounter;

public class LotteryService {
    static {
        GraftConfig.setConfig(System.getenv("GRAFT_CONFIG"));
    }

    public static int enter(String email) throws Exception {
        return TicketCounter.addTicket(email);
    }
}
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 7. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-java:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=com.graft.maven.ticketcounter;host=ticket_counter:9092;runtime=jvm;modules=/usr/app/target" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-java:test
```

Call `LotteryService.enter` in Vision — same result, but the call now hits a remote container.

## Step 8. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=com.graft.maven.ticketcounter;host=inMemory;runtime=jvm;modules=/usr/app/target" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-java:test
```

```text
# Monolith:    host=inMemory
# Microservice: host=ticket_counter:9092
```

Same image, same code — just one env var.

## Step 9. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass `--projectKey YOUR_PROJECT_KEY` to each gateway. You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Extracting a class from a monolith is no longer a rewrite — it's one import change followed by a configuration switch.
