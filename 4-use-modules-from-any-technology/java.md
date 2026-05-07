---
title: "Java"
description: "Challenge 4 — use a Python lottery module directly from Java with Graftcode. No REST wrapper, no rewrite. The module runs in-process."
---

## Goal

Use the **Challenge 4 lottery module** — published as a Python package — directly from Java as if it were a native Maven dependency. The module runs in-process; no REST wrapper, no rewrite.

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
            <artifactId>lotterychallenge4</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
</project>
```

## Step 2. Pull in the Python module

Drop the actual Python module locally so Graftcode can run it in-process:

```bash
python -m pip install lotterychallenge4 --target ./
mvn dependency:resolve -q
```

## Step 3. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 4. Call the lottery module in-process

Create `src/main/java/lottery/Main.java`:

```java
package lottery;

import graft.pypi.lotterychallenge4.GraftConfig;
import graft.pypi.lotterychallenge4.Challenge4;

public class Main {
    public static void main(String[] args) throws Exception {
        GraftConfig.host = "inMemory";

        int tickets = Challenge4.addTickets("you@example.com");
        System.out.println("Challenge 4 complete — tickets in pool: " + tickets);
    }
}
```

Run it:

```bash
mvn compile exec:java "-Dexec.mainClass=lottery.Main"
```

`Challenge4.addTickets(...)` comes from a Python package, but reads like a normal Java method call. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the Python module inside the same process.

## Step 5. Project Key for production

Create a free project at [portal.graftcode.com](https://portal.graftcode.com) and point `GraftConfig.host` at your project's stable registry URL. You get a permanent address, portal visibility at [gateways.graftcode.com](https://gateways.graftcode.com/), and access control.

> Technology choice stops being an integration constraint — keep writing Java and use any module from any ecosystem.
