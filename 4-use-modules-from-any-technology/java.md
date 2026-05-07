---
title: "Java"
description: "Challenge 4 — embed the Python edition of the Lottery module directly in your Java app. No REST wrapper, no rewrite — runs in-process."
---

## Goal

We publish the **Lottery** logic in multiple languages so you can either call it remotely (Tutorials 1–3) or embed it directly in your process. Here you'll use the Python edition of Lottery from a Java app — same `Lottery.addTicket(email)` API, but executed in-memory inside your JVM.

### Prerequisites

- [JDK 17+](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally
- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

```bash
mkdir java-lottery-demo
cd java-lottery-demo
```

Create `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>lottery-demo</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
    <repositories>
        <repository>
            <id>graftcode</id>
            <url>https://grft.dev/maven2</url>
        </repository>
    </repositories>
    <dependencies>
        <dependency>
            <groupId>graft.pypi</groupId>
            <artifactId>lottery</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
</project>
```

## Step 2. Pull in the Python module

Drop the actual Python module locally so Graftcode can run it in-process:

```bash
python -m pip install lottery --target ./
mvn dependency:resolve -q
```

## Step 3. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 4. Run Lottery in-process

Create `src/main/java/lottery/Main.java`:

```java
package lottery;

import graft.pypi.lottery.GraftConfig;
import graft.pypi.lottery.Lottery;

public class Main {
    public static void main(String[] args) throws Exception {
        GraftConfig.host = "inMemory";

        int tickets = Lottery.addTicket("you@example.com");
        System.out.println("Challenge 4 complete — local tickets: " + tickets);
    }
}
```

Run it:

```bash
mvn compile exec:java "-Dexec.mainClass=lottery.Main"
```

`Lottery.addTicket(...)` comes from a Python package, but reads like a normal Java call. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the Python Lottery module inside your JVM — your tickets are tracked locally, not in the central pool.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Technology choice stops being an integration constraint — same Lottery API, embedded in your process from a Python package.
