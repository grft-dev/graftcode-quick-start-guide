---
title: "Java"
description: "Build two Java classes in one project as a monolith, then extract one into a separate microservice with Graftcode - and switch freely between the two topologies with a single configuration change."
---

## Goal

Start with two Java classes in a single project running as a monolith, then extract one into a separate microservice using Graftcode. After that one-time setup, switch freely between monolith and microservice by changing a single configuration value - zero code changes.

### What You'll See

- Create two Java classes in the same project - a price calculator and a billing service that calls it directly.
- Host both in a single container as a monolith.
- Extract the price calculator into its own container as a standalone microservice.
- Update the billing service to use a Graft - the only code change in the entire tutorial.
- Switch between monolith and microservice by changing one environment variable - no code changes from that point on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) installed locally

## Step 1. Create a project folder

Create a new folder and set up a Maven project:

```bash
mkdir java-energy-platform
cd java-energy-platform
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
    <artifactId>energy-platform</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
```

## Step 2. Write the price calculator class

Create `src/main/java/energy/EnergyPriceCalculator.java`:

```java
package energy;

import java.util.Random;

public class EnergyPriceCalculator {
    public static int getPrice() {
        return new Random().nextInt(5) + 100;
    }
}
```

## Step 3. Write the billing service

Create `src/main/java/energy/BillingService.java`:

```java
package energy;

public class BillingService {
    public static int calculateBill(int kwhUsed) {
        var price = EnergyPriceCalculator.getPrice();
        return kwhUsed * price;
    }
}
```

A regular method call - the billing service references the price calculator directly within the same project. No Graftcode involved yet.

## Step 4. Host as a monolith

Create a `Dockerfile` in the project root:

```dockerfile
FROM maven:3.9-eclipse-temurin-21

WORKDIR /usr/app

COPY . /usr/app/

RUN mvn package -q

RUN apt-get update \
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/target/energy-platform-1.0.0.jar"]
```

Build and run:

```bash
docker build --no-cache --pull -t java-energy-platform:test .
docker run -d -p 80:80 -p 81:81 --name energy_platform java-energy-platform:test
```

`gg` (Graftcode Gateway) discovers both classes automatically, and exposes all their public methods. Port `80` handles service calls, port `81` serves Graftcode Vision.

Open [http://localhost:81/GV](http://localhost:81/GV) and try calling `BillingService.calculateBill` with a value like `250`. You'll see both `BillingService` and `EnergyPriceCalculator` listed with all their methods.

At this point, everything runs inside **one container** - both classes share a single process. This is your monolith.

## Step 5. Extract the price calculator as a separate microservice

Now let's say the price calculator needs to scale independently, or another team wants to own it. We'll extract it into its own container.

To deploy the price calculator on its own, it needs to produce its own JAR - separate from the billing service. We'll move just the price calculator class into its own Maven project while the billing service stays in the root project.

### 5a. Create the price calculator project

Create the directory and move the price calculator class into it:

```bash
# bash / macOS / Linux
mkdir -p price-calculator/src/main/java/energy
mv src/main/java/energy/EnergyPriceCalculator.java price-calculator/src/main/java/energy/
```

```powershell
# PowerShell (Windows)
New-Item -ItemType Directory -Force price-calculator/src/main/java/energy
Move-Item src/main/java/energy/EnergyPriceCalculator.java price-calculator/src/main/java/energy/
```

Your project now looks like this:

```
java-energy-platform/
├── pom.xml                        # Root project (updated below)
├── Dockerfile
├── src/main/java/energy/
│   └── BillingService.java        # Stays in the root project
└── price-calculator/
    ├── pom.xml
    └── src/main/java/energy/
        └── EnergyPriceCalculator.java
```

The billing service stays exactly where it was. Only the price calculator moves out.

### 5b. Create `price-calculator/pom.xml`

The price calculator is a standalone Maven project with its own coordinates:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>price-calculator</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
```

### 5c. Update the root `pom.xml`

Add a dependency on `price-calculator` so the billing service can still compile against it:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>energy-platform</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>price-calculator</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
```

The `BillingService.java` source file stays exactly the same - no code changes.

### 5d. Update the monolith Dockerfile

Update `Dockerfile` to install the price calculator into the local Maven repository before building the root project:

```dockerfile
FROM maven:3.9-eclipse-temurin-21

WORKDIR /usr/app

COPY . /usr/app/

RUN cd price-calculator && mvn install -q && cd ..
RUN mvn package -q

RUN apt-get update \
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/target/energy-platform-1.0.0.jar"]
```

The `CMD` line stays the same - `energy-platform-1.0.0.jar` still contains the billing service and pulls in the price calculator as a dependency. The monolith keeps working exactly as before.

### 5e. Create the price calculator Dockerfile

Create `Dockerfile.priceCalculator` in the project root:

```dockerfile
FROM maven:3.9-eclipse-temurin-21

WORKDIR /usr/app

COPY price-calculator /usr/app/

RUN mvn package -q

RUN apt-get update \
 && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb \
 && rm /usr/app/gg.deb \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/target/price-calculator-1.0.0.jar", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

This Dockerfile copies only the `price-calculator/` directory and builds only that project. The resulting container has no billing service code in it.

### 5f. Build and run the price calculator

```bash
docker build --no-cache --pull -f Dockerfile.priceCalculator -t price-calculator-java:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name price_calculator price-calculator-java:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) - the price calculator is now an independent service with its own Graftcode Vision. You can see `EnergyPriceCalculator.getPrice` listed with its return type.

## Step 6. Connect the billing service through a Graft

Now that the price calculator runs on its own gateway, install its **Graft** - the strongly-typed client that Graftcode generates automatically.

From Graftcode Vision at [http://localhost:91/GV](http://localhost:91/GV), select **Maven** and copy the generated dependency coordinates. Note that the repository URL shown in your Graftcode Vision interface may be different than the example provided below.

> The exact group ID, artifact ID, and repository URL are shown in Graftcode Vision - copy them from there. `hypertube-java-sdk` is still required for this example today, but that extra step is temporary.

Add the Graftcode repository and Graft dependency to your root `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>energy-platform</artifactId>
    <version>1.0.0</version>

    <repositories>
        <repository>
            <id>graftcode-local</id>
            <url>http://localhost:91/maven2</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>graft.maven.com.example</groupId>
            <artifactId>price-calculator</artifactId>
            <version>1.0.0</version>
        </dependency>
        <repository>
            <id>graft-repository</id>
            <url>https://grft.dev/maven2/0c6395f3-4810-4756-936e-6fb5a8a579a0__free</url>
        </repository>
    </dependencies>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
```

Update `src/main/java/energy/BillingService.java` to use the Graft instead of the direct reference:

```java
package energy;

import com.graft.maven.energypricecalculator.GraftConfig;
import com.graft.maven.energypricecalculator.EnergyPriceCalculator;

public class BillingService {
    static {
        GraftConfig.setConfig(System.getenv("GRAFT_CONFIG"));
    }

    public static int calculateBill(int kwhUsed) throws Exception {
        var price = EnergyPriceCalculator.getPrice();
        return kwhUsed * price;
    }
}
```

This is the only code change in the entire tutorial. The billing service now reads its configuration from the `GRAFT_CONFIG` environment variable and has no knowledge of whether the price calculator runs in-process or on a remote host. From this point on, switching between monolith and microservice is purely a configuration change.

## Step 7. Run as a microservice

Stop the monolith container, rebuild the image with the updated code, and run the billing service pointing at the remote price calculator:

```bash
docker stop energy_platform
docker rm energy_platform
docker build --no-cache --pull -t java-energy-platform:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=com.graft.maven.energypricecalculator;host=price_calculator:9092;runtime=jvm;modules=/usr/app/target" \
  -p 80:80 -p 81:81 \
  --name energy_platform java-energy-platform:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `BillingService.calculateBill` with `250`. Same method, same result - but the price calculation now happens over the network in a separate container.

## Step 8. Switch back to monolith

Want to go back to a monolith? Stop and restart with `host=inMemory` instead:

```bash
docker stop energy_platform
docker rm energy_platform
docker run -d \
  -e GRAFT_CONFIG="name=com.graft.maven.energypricecalculator;host=inMemory;runtime=jvm;modules=/usr/app/target" \
  -p 80:80 -p 81:81 \
  --name energy_platform java-energy-platform:test
```

Compare the two configurations side by side:

```text
# Monolith (in-process)
name=com.graft.maven.energypricecalculator;host=inMemory;runtime=jvm;modules=/usr/app/target

# Microservice (remote)
name=com.graft.maven.energypricecalculator;host=price_calculator:9092;runtime=jvm;modules=/usr/app/target
```

> We're still working on the best way to pass the configuration so that it's intuitive and user friendly.

Same Docker image, same code - just a different environment variable. You can switch back and forth as many times as you need.

## Step 9. Prove the microservice call goes over the network

Switch back to microservice mode to verify the call is truly remote:

```bash
docker stop energy_platform
docker rm energy_platform
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=com.graft.maven.energypricecalculator;host=price_calculator:9092;runtime=jvm;modules=/usr/app/target" \
  -p 80:80 -p 81:81 \
  --name energy_platform java-energy-platform:test
```

Stop the price calculator:

```bash
docker stop price_calculator
```

Call `calculateBill` in Graftcode Vision - you'll see a connection error because the remote service is down.

Start it again:

```bash
docker start price_calculator
```

The method works again. The code never changed - only the deployment topology did.

## Step 10. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

Then pass the key when starting your gateways:

```dockerfile
CMD ["gg", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable registry URL** - consumers always find and update your Graft through a permanent address, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and exposed services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

---

### Old Way vs New Way

#### Without Graftcode

Extracting a module from a monolith into a microservice typically requires:

- Building a new service with REST or gRPC endpoints wrapping the module
- Defining request/response DTOs for every operation
- Hosting and deploying the new service separately
- Rewriting your consuming code to use HTTP or gRPC clients
- Implementing client-side DTOs and response mapping
- Redeploying your application with the new integration code
- Repeating all of the above if you need to move it back

#### With Graftcode

- Start with both classes in the same project as plain Java - a normal monolith
- When you're ready to extract, move the class into its own Maven project and host it on its own Graftcode Gateway
- One import change in the consuming service - then topology is controlled by configuration forever
- Switch between monolith and microservice (and back) with one environment variable

> With Graftcode, extracting a class from a monolith is not a rewrite - it's a one-time import change followed by a configuration switch. After that, your code stays focused on business logic while the architecture adapts to your operational needs.
