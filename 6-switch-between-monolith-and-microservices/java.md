---
title: "Java"
description: "Challenge 6 — run two Java classes as a monolith, then split one off as a microservice. Both topologies still call the central Lottery service."
---

## Goal

Build two Java classes — `Booth` (orchestrator) and `LotterySubmitter` (which calls the central **Lottery** service hosted by us). Run them as a monolith first. Then extract `LotterySubmitter` into a standalone microservice and switch between monolith and microservice with **one environment variable** — zero code changes from then on.

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

## Step 2. Write the two classes

Create `src/main/java/lottery/LotterySubmitter.java`:

```java
package lottery;

import graft.nuget.Lottery.GraftConfig;
import graft.nuget.Lottery.Lottery;

public class LotterySubmitter {
    static {
        GraftConfig.host = "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
    }

    public static int submit(String email) throws Exception {
        return Lottery.addTicket(email);
    }
}
```

Create `src/main/java/lottery/Booth.java`:

```java
package lottery;

public class Booth {
    public static String checkIn(String email) throws Exception {
        int tickets = LotterySubmitter.submit(email);
        return "Welcome " + email + "! Total tickets in pool: " + tickets;
    }
}
```

`Booth.checkIn` calls `LotterySubmitter.submit` directly. `LotterySubmitter` calls the central `Lottery.addTicket` over WebSocket.

## Step 3. Host as a monolith

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

CMD ["gg", "--modules", "/usr/app/target/lottery-platform-1.0.0.jar"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-platform-java:test .
docker run -d -p 80:80 -p 81:81 --name lottery_platform lottery-platform-java:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `Booth.checkIn("you@example.com")`. Both classes run inside one container; the central Lottery is reached over the network.

## Step 4. Run LotterySubmitter as a standalone service

Move `LotterySubmitter.java` into a sub-project so it can ship as its own JAR:

```bash
mkdir -p lottery-submitter/src/main/java/lottery
mv src/main/java/lottery/LotterySubmitter.java lottery-submitter/src/main/java/lottery/
```

Create `lottery-submitter/pom.xml` (same shape as the root `pom.xml` — keep the Lottery Graft dependency and Graftcode repository, change `<artifactId>` to `lottery-submitter`).

Add a dependency on the new sub-project to the root `pom.xml`:

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>lottery-submitter</artifactId>
    <version>1.0.0</version>
</dependency>
```

Update root `Dockerfile` so it installs the sub-project first:

```dockerfile
RUN cd lottery-submitter && mvn install -q && cd ..
RUN mvn package -q
```

Create `Dockerfile.submitter`:

```dockerfile
FROM maven:3.9-eclipse-temurin-21
WORKDIR /usr/app
COPY lottery-submitter /usr/app/

RUN mvn package -q

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/target/lottery-submitter-1.0.0.jar", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

```bash
docker build --no-cache --pull -f Dockerfile.submitter -t lottery-submitter-java:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name lottery_submitter lottery-submitter-java:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `LotterySubmitter` is now its own service that still talks to the central Lottery internally.

## Step 5. Connect Booth through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the Maven coordinates and add the new repository + dependency to the root `pom.xml`:

```xml
<repositories>
    <repository>
        <id>submitter-repo</id>
        <url>https://grft.dev/maven2/YOUR_KEY__free</url>
    </repository>
</repositories>

<dependencies>
    <dependency>
        <groupId>graft.maven.com.example</groupId>
        <artifactId>lottery-submitter</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

Update `src/main/java/lottery/Booth.java` — the **only code change** in the entire tutorial:

```java
package lottery;

import com.graft.maven.lotterysubmitter.GraftConfig;
import com.graft.maven.lotterysubmitter.LotterySubmitter;

public class Booth {
    static {
        GraftConfig.setConfig(System.getenv("GRAFT_CONFIG"));
    }

    public static String checkIn(String email) throws Exception {
        int tickets = LotterySubmitter.submit(email);
        return "Welcome " + email + "! Total tickets in pool: " + tickets;
    }
}
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 6. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-java:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=com.graft.maven.lotterysubmitter;host=lottery_submitter:9092;runtime=jvm;modules=/usr/app/target" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-java:test
```

Call `Booth.checkIn` in Vision — same result. The chain is now Booth (container A) → LotterySubmitter (container B) → central Lottery.

## Step 7. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=com.graft.maven.lotterysubmitter;host=inMemory;runtime=jvm;modules=/usr/app/target" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-java:test
```

```text
# Monolith:    host=inMemory                 (LotterySubmitter in Booth's process)
# Microservice: host=lottery_submitter:9092  (LotterySubmitter is remote)
```

Same image, same code — just one env var. The central Lottery is always remote either way.

## Step 8. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and pass `--projectKey YOUR_PROJECT_KEY` to each gateway. You get a stable registry URL, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Splitting `LotterySubmitter` out of the monolith is no longer a rewrite — it's one import change followed by a configuration switch.
