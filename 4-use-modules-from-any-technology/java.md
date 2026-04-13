---
title: "Java"
description: "Use a module from any supported technology in your Java service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a Java service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a Python module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using Maven - just like any other dependency.
- Configure the generated client to point at the in-memory host.
- Import and call it from your Java code as if it were a native Maven library.

### Prerequisites

- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

Create a new folder and set up a Maven project:

```bash
mkdir java-python-module-demo
cd java-python-module-demo
```

Create a `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>currency-demo</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>graftcode</id>
            <url>https://grft.dev/maven2</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>com.hypertube</groupId>
            <artifactId>hypertube-java-sdk</artifactId>
            <version>2.5.0</version>
        </dependency>
        <dependency>
            <groupId>graft.pypi</groupId>
            <artifactId>sdncenter-currency-converter</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
</project>
```

## Step 2. Install a module from another technology

For this example we'll use a Python currency converter from PyPI ([sdncenter-currency-converter](https://pypi.org/project/sdncenter-currency-converter/)), but the same approach works with any module from a supported repository - `npm`, `PyPI`, `Maven` or `NuGet`.

`hypertube-java-sdk` is still required for this example today, but that extra step is temporary.

The dependencies declared in `pom.xml` above install a **Graft** - a strongly-typed Java client generated from the module. You import and call it like any other Maven dependency, regardless of which technology the module was originally written in.

Download the dependencies:

```bash
mvn dependency:resolve -q
```

## Step 3. Set the SDK key

Set the `HYPERTUBE_KEY` environment variable in your terminal before running the project:

**PowerShell:**

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

**Bash (macOS / Linux):**

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

**Windows CMD:**

```cmd
set HYPERTUBE_KEY=Fe2w-p2GK-Mn26-j8ZY-Xe25
```

## Step 4. Call the cross-language module and run it

Create `src/main/java/energy/Main.java`:

```java
package energy;

import graft.pypi.sdncentercurrencyconverter.GraftConfig;
import graft.pypi.sdncentercurrencyconverter.SimpleCurrencyConverter;

public class Main {
    public static void main(String[] args) throws Exception {
        GraftConfig.host = "inMemory";

        var result = SimpleCurrencyConverter.convert(100, "USD", "EUR");
        System.out.println("Converted amount: " + result);
    }
}
```

Run it:

```bash
mvn compile exec:java "-Dexec.mainClass=energy.Main"
```

You should see the converted amount printed in your terminal. `SimpleCurrencyConverter.convert(...)` comes from a Python package, but your code reads like a regular method call - no HTTP request, no response parsing, no serialization. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the Python module inside the same process.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

With a Project Key, point `GraftConfig.host` at your project's stable registry URL instead of a raw WebSocket address. A Project Key gives you:

- **Stable registry URL** - the address for your Grafts stays permanent, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Using a module from another language in Java typically requires:

- Building a separate service around the module with REST or gRPC endpoints
- Defining request and response DTOs for every operation
- Hosting and deploying that service independently
- Writing HTTP or gRPC client code in your Java project
- Maintaining the integration layer as the module evolves
- Or rewriting the module entirely in Java

### With Graftcode

- Install any public module from PyPI, NuGet, or npm as a strongly-typed Graft with one Maven dependency
- Import and call it like a regular Java class - no wrappers, no clients
- The module runs in-process or on a remote host, controlled by a single configuration line

> Technology choice stops being an integration constraint. You can keep writing Java and use the best libraries from any ecosystem - Python, .NET, JavaScript - as if they were native Maven dependencies.

</collapsible>
