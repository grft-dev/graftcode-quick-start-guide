import { TutorialSection } from "@shared/schema";

export const pmfDemoSections: TutorialSection[] = [
  {
    id: "pmf-demo",
    title: "Graftcode Experience",
    slug: "pmf-demo",
    content: "",
    parentId: null,
    order: "1",
    isExpandable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "Graftcode-introduction",
    title: "Get started with Graftcode",
    slug: "Graftcode-introduction",
    content: `**Graftcode allows you to connect frontends, mobile apps, and backend services seamlessly, removing the overhead of APIs, SDK generation, and client maintenance.**

Instead of writing REST endpoints, gRPC protobufs, DTOs, or client layers, you just:
- **Write** any public methods.
- **Install** auto-generated, strongly-typed client using regular package manager command.
- **Call** remote methods like local dependency.

Behind the scenes your communication will be handled through our **Hypertube(TM) protocol** which uses **native level runtimes integration and binary messages**, processing calls **5x to 10× faster than WebService or gRPC and require 30–60% less code** - while keeping your business logic fully decoupled.

> Start with the short intro video below to see Graftcode in action:

<iframe src="https://share.descript.com/embed/xDrYh06ZJfd" width="640" height="360" frameborder="0" allowfullscreen></iframe>

## How it Fits Your Project

Diagrams below show how Graftcode fits into standard software project and changes your current landscape:

![Graftcode Architecture Diagram](@assets/image_1757534682973.png)

**Graftcode changes the integration story from:**
- implement controllers
- implement request/response DTOs
- forward calls to business logic
- implement client
- parse responses to local DTOs/models
- invoke methods on client
- monitor for changes
- keep updating each layer with each update

**To:**
- expose public methods on business logic or simple plain object facades
- import entire service with package manager as direct dependency (that we call **Graft**) - strongly-typed and  always in sync client.

**Now check how clean becomes your system design with Graftcode**, so you can focus purely on business logic:

![Graftcode Clean Architecture Diagram](@assets/image_1757449669716.png)

**Graftcode removes need for all previosuly required communication code both on client and service side**. Same approach works for  frontends and between microservices in your cloud. To make any public method callable just replace your middleware (Self-hosted webservice/IIS/Tomcat/Apache) with **Graftcode Gateway** (our multi-runtime host). 

> 💡 **Tip:** It is not hiding REST or gRPC behind generated wrapper code. It is replacing it with direct runtime integration based on binary communication connecting directly to target runtime native-layer ensuring highest reliability and unbeatable performance.

As **Graftcode works across all major programming languages runtimes** both remotely as well as within **single process**, you can also leverage the best libraries from any ecosystem, including Python, Java, C#, Node.js, Perl, PHP, Ruby and Go, without complex interop and mix them in one app or service. 

This allows you to build applications faster, decouple from integration logic, iterate quickly, and scale seamlessly even changing between monolith and microservices architectures with just configuration change.

## What We Hear From Early Adopters

- **Ship features faster.** Backend client auto delivered as _strongly-typed, always up-to-date dependency_ simplifies changes and reduces bugs.
- **Less code to maintain.** Lack of controllers, DTOs, REST/gRPC clients, and SDKs reduces up to ~30%-60% of code and fully decouples app from the way how components will be connected.
- **Vibe-coding Friendly** Language models can now focus on business logic waiving narrow context window limitations.
- **Higher performance.** Native runtime communication delivers multi-x speedups (often 1.5×–10× vs REST/gRPC, network-dependent) lowering latency and increasing throughput.
- **Lower cloud costs.** Faster integrations mean less CPU time, and smaller payload-direct savings on compute, networking, and PaaS messaging and queueing.
- **Production agility.** Now you can change communication channel or extract modules as separate microservices as well as merge it back as monolith without code change.
- **Cleaner architecture.** Remove the integration layer between frontends and services/microservices; fewer moving parts and code to design, develop and maintain.
- **Fits current standards.** Graftcode is fully compatible with standard monitoring, observability and security practices. It just replaces the way developer intent is expressed and format of communication but uses standard TCP/IP TLS or WebSocket Secure and can be routed through any API Managers, gateways, load balancers and proxies.
- **Polyglot freedom.** With multi-runtime hosting capability and connection on native level you can mix programming languages per service and reuse best-in-class libraries across Python, Java, C#, Node.js, Go, PHP, Ruby, Perl without complex interop.
- **Intuitive Effortless Migration.** Migrate existing projects just running your services on Graftcode gateway, adding Graft to client and switching at least one api client call to try and next quickly scale to all.
- **Run anywhere.** Graftcode works across all major programming languages and platforms-cloud, browser, mobile. It can host logic within containers, PaaS services or on local machines.

Let's see this in action through a real-world demo.`,
    parentId: "pmf-demo",
    order: "1.1",
    isExpandable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "add-first-graft-frontend-backend",
    title: "Connect frontend to backend with Graftcode",
    slug: "add-first-graft-frontend-backend",
    content: `## Goal

Connect a simple frontend app to a backend service using Graftcode - without writing controllers, DTOs, or any other code that handles connection.

![Frontend to Backend Connection Diagram](@assets/image_1757535139098.png)

## What You'll See

- Connect a React app to a .Net backend in just one command.
- Save hours by implementing all its methods without Swagger or OpenAPI codegen.
- Call .NET backend methods like local functions - with autocomplete and type safety.

## Step 1. Clone empty React app template

Navigate to new folder and use your favorite tool to clone the template project with command below:

\`\`\`bash
git clone https://github.com/grft-dev/react-hello-world
\`\`\`

This app is minimal - just a single page with Hello World, ready to call your backend. Let's open it in your IDE:

\`\`\`bash
cd react-hello-world
code .
\`\`\`

And now let's run the app to see it in action:
\`\`\`bash
npm install
npm run dev
\`\`\`

You can see the app running at [http://localhost:5173](http://localhost:5173)

## Step 2. View the backend service

Before calling backend service, let’s see how it looks like. We prepared it in both old REST based approach and one exposed with Graftcode. 

- [With REST in Swagger](http://gc-d-ca-polc-demo-ecws-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io:8090/swagger/index.html), you’ll see a list of  endpoints - raw routes, HTTP verbs, and payloads.

- [With Graftcode in Vision Portal](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), you’ll see the same backend but exposed as regular classes and methods + package manager command to install it as dependency in any technology.

![Screenshot 2025-09-04 152416_1756993284283.png]

Graftcode saves you from writing, generating  and maintaining client code - providing package manager command to install this service almost as regular dependency.

## Step 3. Add your first Graft

Before we add our first Graft, we need to install _javonet-nodejs-sdk_ package. This is done manually for now, but we are working on making it automatic.

\`\`\`bash
npm install javonet-nodejs-sdk
\`\`\`

Once the package is installed, we can proceed with adding the Graft that will allow us to call the .NET backend service. The installation command is provided in the Graftcode Vision portal.

![graftvision-installation.png]

Select preferred package manager from the dropdown and copy the command to your terminal window. As we're creating React app, we'll use NPM:

\`\`\`bash
npm install --registry https://grft.dev/graftcode-demo__4849b22a-a92a-4da9-9e73-dc10b39dd547 @graft/nuget-EnergyPriceService@1.1.0
\`\`\`

**This command installs a Graft** - a generated package that exposes strongly-typed classes and methods, allowing you to call external services as if they were part of your local codebase.

Now, your frontend can see backend classes, methods, and receive results directly - just like local code. Any call on those methods will **pass the request through our super-fast Hypertube™ binary protocol connecting your browser directly to native-layer of runtime** running this backend service in cloud.

> 💡 **Tip:** It is not hiding REST or gRPC behind generated wrapper code. It is replacing it with direct runtime integration based on binary communication connecting directly to target runtime native-layer ensuring highest reliability and unbeatable performance.

## Step 4. Import and configure the backend client

Before making any calls, we need to **import the generated Graft client** and set up a connection to the backend service.  
This tells your React app where the service is hosted and how to reach it. The configuration is always easy to find and ready to copy from the Graftcode Vision portal.

![graftvision-configuration.png]

Open _src\\App.jsx_ and add on **top of the file**:

\`\`\`javascript
import { useState } from "react";
import { GraftConfig, BillingLogic } from '@graft/nuget-EnergyPriceService'
\`\`\`


<collapsible title="⚛️ New to React or Graftcode? Click here to understand these imports">
- **useState** - A React hook we'll use later to store the backend response and update the UI when data changes
- **GraftConfig** - A Graftcode function used to configure how your frontend connects to the backend service (connection details, protocols, etc.)
- **BillingLogic** - The strongly-typed client (Graft) for one of the classes exposed that lets you call .NET backend methods just like local functions, with full autocomplete and type safety

</collapsible>

Next, configure how the frontend connects to the backend service. **Paste this snippet right below imports** (it can be also configured via environment variables or config files):

\`\`\`javascript
GraftConfig.host="wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"
\`\`\`

## Step 5. Call the backend method

With the client imported and configured, you can now call your backend service as if it were a local function.

Let’s update _src\\App.jsx_ and call one of its method. **Put this line below** _setConfig_ **and above** _function App()_.

\`\`\`javascript
const monthlyBillCostWithTaxPromise = BillingLogic.CalculateMonthlyBill(88.4, 1.4, 23);
\`\`\`

<collapsible title="🔧 How does this method call work? Click here to understand the process">

- **BillingLogic.CalculateMonthlyBillAsync(..)** - Calls the backend method .CalculateMonthlyBill(..) on your .NET service, just like calling a local function
- **Returns a Promise** - Since this is an asynchronous call across the network, it returns a JavaScript Promise containing the result
- **Stored in monthlyBillCostWithTaxPromise** - We save this Promise so we can use its result to update the UI when the backend responds

</collapsible>


> 💡 **Important:** Notice how the backend interaction happens in this line: _BillingLogic.CalculateMonthlyBill(..)_. It feels just like calling a local function. These calls are strongly typed, so you get autocomplete in your IDE, and they always stay in sync with the backend - automatically updated through the package manager whenever service is updated.

## Step 6. Display the result in React

Next, let’s use the result of that Promise inside our React component.
**Replace** _function App()_ **in** _src\\App.jsx_ **with code provided below**:

\`\`\`javascript
function App() {
  const [data, setData] = useState(0);

  monthlyBillCostWithTaxPromise.then(setData);

  return <h1>Calculated Energy Monthly Bill is: {data.toFixed(2)}</h1>;
}
\`\`\`

<collapsible title="🔧Click here to understand how this React code works with the backend call ">
-  Inside _App()_, we use _useState(0)_ to declare a piece of state called data, which will hold the backend response.
- _monthlyBillCostWithTaxPromise.then(setData)_ waits for the backend call to finish and updates the state with the returned value.
- Finally, the JSX returns an _<h1>_ element showing the current energy monthly bill value.
</collapsible>

If you've missed any step, here is the full code of _src\\App.jsx_:
<collapsible title="🔧 Click here to see the full code of src\\App.jsx">
\`\`\`javascript
import { useState } from "react";
import { GraftConfig, BillingLogic } from '@graft/nuget-EnergyPriceService'

GraftConfig.host="wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"

const monthlyBillCostWithTaxPromise = BillingLogic.CalculateMonthlyBill(88.4, 1.4, 23);

function App() {
  const [data, setData] = useState(0);

  monthlyBillCostWithTaxPromise.then(setData);

  return <h1>Calculated Energy Monthly Bill is: {data.toFixed(2)}</h1>;
}

export default App
\`\`\`
</collapsible>

Run the app and you'll see the live backend value on your page.



\`\`\`bash
npm run dev
\`\`\`

Now open your browser at [http://localhost:5173](http://localhost:5173) and you'll see the result of your backend call displayed on the page.

## Step 7. Try more methods

**Now explore:**

- **Call 3–4 other async methods** from the backend, using for example _BillingLogic_ class.
- Notice auto-completion and type checks in your IDE for all methods and arguments.
- No REST/gRPC client code, DTOs, models  - just direct, strongly-typed calls, thanks to Graftcode.

![image_1757498435519.png]



## Step 8. Compare old-way vs new-way

Check this chart to understand how your daily integration process will change with Graftcode:

![image_1757450995977.png]

> ⚡ **Important:** Think how much time you saved. Normally, you would need to generate or hand-write client code from Swagger/OpenAPI, maintain models/DTOs and routes for every method. With Graftcode, it's just one command and a method call to any function regardless of service complexity. There is no need to monitor for changes or manually update across multiple layers. Everything stays in sync and typed checked interface validates methods usage at compile time. If the interface changes are evolutionary your Graft will keep working even if you do not decide to update to latest state.`,
    parentId: "pmf-demo",
    order: "1.2",
    isExpandable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "expose-methods-services",
    title: "Host Your own Backend with Graftcode",
    slug: "expose-methods-services",
    content: `## Goal

Turn your own code into a discoverable backend service using Graftcode Gateway on your local machine - no controllers, no REST routes, no OpenAPI specs.

![image_1757536568865.png]

## What You'll See

- You'll clone a simple .NET library app with a single public method.
- You'll expose it through Graftcode Gateway using a lightweight Dockerfile.
- You'll instantly get a GraftVision portal - like Swagger, but smarter and ready to be called from most popular languages with just one command.
- You'll see how wihtout any controllers, DTOs, and REST endpoints - Graftcode makes your business logic or plain object facade public methods callable at no effort and no coupling to any communication technology.

## Step 1. Clone the .NET backend service

Navigate back to your root new folder created for tutorial. Next clone the prepared .NET energy price service from GitHub:

\`\`\`bash
git clone https://github.com/grft-dev/dotnet-energy-price-service.git
cd dotnet-energy-price-service
code .
\`\`\`

This is a very simple service that already contains the energy price logic with public method _GetPrice()_ ready to be exposed through Graftcode Gateway. The code of the class _EnergyPriceCalculator.cs_ that will expose _EnergyPriceCalculator_ is as simple as this:

\`\`\`csharp
namespace MyEnergyService;

public class EnergyPriceCalculator
{
    public static double GetPrice()
    {
        return new Random().Next(100, 105);
    }
}
\`\`\`

## Step 2. Expose the service with Graftcode Gateway

To expose this service to the outside world, **we've created a dockerfile in your project root for you**. This file tells Docker how to build and run your service with Graftcode Gateway. The dockerfile is simple and looks like this:

\`\`\`dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0
 
# Install wget and download GG
RUN mkdir -p /usr/app \
&& apt-get update \
&& apt-get install -y wget \
&& wget -O /usr/app/gg.deb \
https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
&& dpkg -i /usr/app/gg.deb \
&& rm /usr/app/gg.deb \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*
 
# You just need to copy your binaries with public interfaces
COPY /bin/Release/net8.0/publish/ /usr/app/

EXPOSE 80
EXPOSE 81
# And run Graftcode Gateway passing name of modules that should be exposed
CMD ["gg", "--runtime", "netcore", "--modules", "/usr/app/MyEnergyService.dll", "--endpoint", "https://d.grft.dev"]
\`\`\`

<collapsible title="🐳 Understanding the Dockerfile - Click to see what each line does">

- **FROM pladynski/myrepo:graftcode** - Sets the base image to Graftcode Gateway, which contains all the necessary tools to expose your .NET methods as web APIs
- **COPY ./src/MyEnergyService/bin/Release/net8.0/publish/ /usr/app/** - Copies your compiled .NET application files from the local publish folder into the Docker container's /usr/app/ directory
- **CMD ["/usr/app/gg", "--runtime", "netcore", "--modules", "/usr/app/MyEnergyService.dll", "--GV"]** - Runs the Graftcode Gateway executable (gg) with your .NET module, automatically exposing your public methods as REST endpoints with GraftVision UI enabled

</collapsible>

Now, let's build and run your Docker container with the following commands. Please note that you need to have Docker installed and running on your machine to execute these commands:

\`\`\`bash
dotnet build .\\MyEnergyService.csproj
dotnet publish .\\MyEnergyService.csproj
docker build --no-cache --pull -t myenergyservice:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_demo myenergyservice:test
\`\`\`

<collapsible title="📖 New to Docker? Click here to understand what these commands do">

- **docker login** - Authenticates with the Docker registry using the provided credentials to access the Graftcode Gateway base image
- **dotnet publish** - Compiles and publishes your .NET application, creating optimized binaries ready for production deployment
- **docker build** - Creates a Docker image from your Dockerfile, combining the Graftcode Gateway with your published service code, and tags it as "myenergyservice:test"
- **docker run** - Starts a container from your built image in detached mode (-d), exposing ports 80 and 81 to make your service accessible via HTTP

</collapsible>

## Step 3. Explore your service with Graft Vision

Open your browser at the following URL to see your service in action through Graft Vision: 
[http://localhost:81/GV](http://localhost:81/GV)

![Graftcode Vision Interface](@assets/image_1757443479122.png)

Notice that:

- Graftcode Gateway can easily run as container on your machine or in cloud.
- Instantly it hosts Swagger-like UI with all exposed public methods.
- You can see all methods exposed by your service and "Try it out" button to call them live.
- You can easily find a command to install the Graft package using your favorite package manager allowing you to call this service from any language.

That's it! Your .NET method is now exposed as a backend service with Graftcode Gateway and can be called from any frontend web or mobile app or even another backend service.

## Step 4. Compare: old-way vs. Graftcode way

Check this chart to understand how your daily process of exposing backend logic for remote consumption will change with Graftcode:

![image_1757537577512.png]

> ⚡ **Result:** You've turned a plain .NET method into a fully accessible backend service with one simple Dockerfile and few Docker commands to run, saving hours of manual coding and maintenance. No controllers, no REST endpoints, no OpenAPI specs. Just a public methods exposed through Graftcode Gateway.`,
    parentId: "pmf-demo",
    order: "1.3",
    isExpandable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "connect-backend-services",
    title: "Connect backend services with Graftcode",
    slug: "connect-backend-services",
    content: `## Goal

Services exposed with Graftcode can be consumed from frontend or other backend services too. In both cases you will always get instant effortless connection and highest performance. **Learn how to connect the .NET app that you've built** in the previous step "Host your own backend with Graftcode" section to cloud service that we were consuming from ReactJS app.

![image_1757538118197.png]

## What You'll See

- You'll connect your previously hosted .NET backend service to our **Energy Company** cloud service that we prepared for you.
- You'll use the provided dotnet command to add the service as a direct dependency and obtain **Graft**.
- You'll find and explore the _NetConsumptionKWh_ method using **strongly-typed Graft between .NET services**.

## Step 1. Check GraftVision URL again

Open the GraftVision that we've already hosted for .NET service. You can find it under this URL: [GraftVision portal](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io)

In GraftVision portal 
locate the **NetConsumptionKWh** method under the **Meter Logic** section. This is the method we'll be implementing in your .NET app.

![Graftcode Vision showing NetConsumptionKWh method details](@assets/image_1757497238685.png)

In the GraftVision portal, you can:
- See the connection package manager command for your particular technology
- View all available methods and their signatures
- Try out these method by inserting parameters and seeing the result
- See the expected input parameters and return types

## Step 2. Connect to this service using Nuget

Since this is a .NET application, we'll now select **Nuget** as our package manager from the dropdown menu in the GraftVision portal. Let's take the command and run it in your terminal window.

\`\`\`bash
dotnet add package -s https://grft.dev/graftcode-demo__e74616d1-1661-45ff-92a7-e7770a70d24a graft.nuget.EnergyPriceService --version 1.1.0.0
\`\`\`


<collapsible title="🔧 Understanding the Command - Click to see what it does what each part means">
This command:
- Adds the Graftcode service package to your .NET project
- Uses the custom Graftcode package source URL unique for that specific Graftcode Gateway instance
- Installs the strongly-typed client for the backend service
- Enables you to call the _NetConsumptionKWh_ method directly in your code

Here's a breakdown of the command:
- **dotnet add package** - Standard .NET CLI command to add a NuGet package to your project
- **-s https://grft.dev/graftcode-demo__fa55e1ed-8373-4600-95eb-d028f21d2451** - Specifies the custom Graftcode package source where your service package is hosted
- **graft.nuget.be** - The name of the generated package that contains the strongly-typed client for your backend service

</collapsible>

## Step 3. Add usings and configure the connection

Now let's add usings to your _MyEnergyService.cs_ file to use the new Graft.

\`\`\`csharp
using graft.nuget.be;
using graft.nuget.MyEnergyService;
\`\`\`

Create a static constructor for your **MyEnergyService** class and add the following line to configure the connection to the remote service (remember, you can set the configuration in multiple ways - code, env variable or config file):

\`\`\`csharp
static MyEnergyService()
{
    GraftConfig.host="wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
}
\`\`\`

## Step 4. Use the method

And add new method to **MyEnergyService** class which returns current cost retrieving consumption calculated by remote cloud service and multiplying by generated random price. Add this code to your _MyEnergyService.cs_ file, below the _GetPrice()_ method, and remeber to **Save it**:

\`\`\`csharp
public static double GetMyCurrentCost(int previousReadingKwh, int currentReadingKwh)
{
    var consumption = MeterLogic.NetConsumptionKWh(previousReadingKwh, currentReadingKwh);
    return consumption * GetPrice();
}
\`\`\`

The method call is:
- **Strongly-typed** - You get full IntelliSense and compile-time type checking
- **Always in sync** - The client automatically reflects any changes made to the backend service
- **Direct integration** - No REST calls, DTOs, or manual client code needed

Focus on the way how your interaction with remote service looks like. It is fully decoupled from architecture or communication channel and feels like local method. 

![image_1757538666786.png]

<collapsible title="🔧 Click here to see the full code of MyEnergyService.cs">
\`\`\`csharp
namespace MyEnergyService;

using graft.nuget.be;
using graft.nuget.MyEnergyService;

public class MyEnergyService
{
    static MyEnergyService()
    {
        GraftConfig.host="wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
    }

    public static double GetMyCurrentCost(int previousReadingKwh, int currentReadingKwh)
    {
        var consumption = MeterLogic.NetConsumptionKWh(previousReadingKwh, currentReadingKwh);
        return consumption * GetPrice();
    }
    
    public static double GetPrice()
    {
        return new Random().Next(100, 105);
    }
}
\`\`\`
</collapsible>

## Step 5. Build and test your updated service

Now let's build and publish your project:

\`\`\`bash
dotnet build .\\MyEnergyService.csproj
dotnet publish .\\MyEnergyService.csproj
\`\`\`

Build the Docker image again and run it to test your updated service with the new _GetMyCurrentCost_ method.

Stop Docker container if it's running, remove it and run again by executing the following commands:

\`\`\`bash
docker stop graftcode_demo
docker rm graftcode_demo

docker build --no-cache --pull -t myenergyservice:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_demo myenergyservice:test
\`\`\`

Once your container is running, open Graftcode Vision portal at: [http://localhost:81/GV](http://localhost:81/GV)

In the portal:

- Navigate to explore the new **GetMyCurrentCost** method
- Insert parameters for:
   - **previousReadingKwh** (e.g., 100)
   - **currentReadingKwh** (e.g., 150)
- Hit the **Execute** button to see the live results
- Review the response format and data structure

![GraftVision showing GetMyCurrentCost method details and live execution](@assets/graftvision-getmycurrentcost.png)

This allows you to test your enhanced method that combines the _NetConsumptionKWh_ calculation executed on our cloud service with cost pricing implemented in your local module. Trying it in browser let you make sure it works as expected before using it in your applications.

> ⚡ **Important:** This example is proving that Graftcode not only covers the edge connection from Web app or mobile client to cloud backend but also allows to integrate across microservices. It all works regardless if module with your business logic is hosted in cloud, locally on your machine or within container. From code perspective the _NetConsumptionKWh_ method behaves exactly like a local function in your codebase, but it's actually executing on the remote backend service keeping your code decoupled from system architecture.`,
    parentId: "pmf-demo",
    order: "1.4",
    isExpandable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mix-modules-across-languages",
    title: "Mix modules across languages",
    slug: "mix-modules-across-languages",
    content: `## Goal

Augment your .NET price service with **Python currency converter** and see how easily you can pick any module regardless of technology and use it as direct dependency.

![Cross-language module integration diagram](@assets/image_1757539581063.png)

## What You'll See

- Add a Python currency converter package directly into your .NET app as regular dotnet dependency using nuget.
- Call it like a local C# method in one line.

## Step 1. Add the Python currency converter package from PyPI using nuget

From your **MyEnergyService** project call this command:

\`\`\`bash
dotnet add package -s https://grft.dev graft.pypi.sdncenter-currency-converter
\`\`\`

This generates a **typed Graft for the Python currency converter module** - ready to call from .NET.

## Step 2. Add usage of python logic in your .NET service method that calculates current cost:

Update your code to allow providing currency to be used for calculating result. First add using to new graft:

\`\`\`csharp
using graft.sdncenter_currency_converter;
\`\`\`

Next add a new method __GetMyCurrentCost()__ that takes also currency argument. Remember to **Save** your file:

\`\`\`csharp
    public static double GetMyCurrentCost(int previousReadingKwh, int currentReadingKwh, string currency)
    {
        var consumption = MeterLogic.NetConsumptionKWh(previousReadingKwh, currentReadingKwh);

        var convertedValue = SimpleCurrencyConverter.convert(consumption * (float)GetPrice(), "USD", currency);
        return convertedValue;
    }
\`\`\`

Now your service calculates the price and converts the result to the desired currency using the Python module. Because our change was evolutionary without breaking previous method overloads, Grafts generated before will keep working even if they are no updated to latest state.

## Step 3. Build, configure and test your enhanced service

First, build and publish your project with these commands:

\`\`\`bash
dotnet build .\\MyEnergyService.csproj
dotnet publish .\\MyEnergyService.csproj
\`\`\`

Now rebuild and run your Docker container:

\`\`\`bash
docker stop graftcode_demo
docker rm graftcode_demo

docker build --no-cache --pull -t myenergyservice:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_demo myenergyservice:test
\`\`\`

Now you can visit the GraftVision portal at [http://localhost:81/GV](http://localhost:81/GV)

_GetEnergyPrice.GetMyCurrentCost()_ appears automatically extended with new parameter.
You can Try it out live passing "EUR" as target currency.

## Step 4. Compare: old-way vs. Graftcode way

### Old Way (without Graftcode)

- It was impossible to use python modules directly in .NET
- you had either to use .NET counterpart of required module
  - or use python over REST and host it as separate service
  - or use complex low-level interop libraries

### New Way (with Graftcode)

- Install the package from any technology using regular package manager command.
- Call methods like local C# in one line.

> ⚡ **Result:** You've added a Python currency converter module directly to your .NET service with just one command and a single line of code. The Python module is called directly from .NET and runs in the same process - like a local C# method. You can do the same with any other language or technology thanks to Graftcode's multi-runtime support. Imagine the possibilities of being able to use any existing package from any technology regardless of technology constraints.`,
    parentId: "pmf-demo",
    order: "1.5",
    isExpandable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "switch-monolith-microservices",
    title: "Switch Between Monolith and Microservices",
    slug: "switch-monolith-microservices",
    content: `# Switch Between Monolith and Microservices

## Goal

Learn how to run the exact same service either as part of your app (monolith, in-memory) or remotely (microservice, in the cloud) - just by changing configuration.

![image_1757540728665.png]

## What You'll See

- You'll create new container that will host Currency Converter python module with Graftcode Gateway.
- You'll switch a configuration line to connect the same service remotely instead of direct monolith usage.
- You'll see how without any code change you can switch between monolith and microservices architecture.

## Step 1. Run Currency Converter as separate microservice

Let's create a new Dockerfile that will host the Currency Converter module and Graftcode Gateway as separate microservice on your local machine (Graftcode Gateway will just host the module and expose it as remote service).

Create a new folder, inside it create a new file named **Dockerfile** and copy and paste the content below into your Dockerfile:

\`\`\`PowerShell
mkdir PythonCurrencyService
cd PythonCurrencyService
code .
\`\`\`

\`\`\`Dockerfile
FROM python:3.11-slim
WORKDIR /usr/app

# Install our demo sdncenter-currency-converter python module from PyPI into a local folder
RUN pip install sdncenter-currency-converter --target ./sdncenter_currency_converter 

# Install wget and download Graftcode Gateway (GG)
RUN mkdir -p /usr/app  && apt-get update     && apt-get install -y wget     && wget -O /usr/app/gg.deb     https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb     && dpkg -i /usr/app/gg.deb     && rm /usr/app/gg.deb     && apt-get clean     && rm -rf /var/lib/apt/lists/*

# Run Graftcode Gateway pointing at that module
CMD ["gg", "--runtime", "python", "--modules", "/usr/app/sdncenter_currency_converter/", "--httpPort", "91","--port","90","--TCPServer", "--tcpPort=9092"]
\`\`\`


Now you can run this command to build the container that will install our python module to local directory, download latest Graftcode Gateway and run it to expose that python service for remote consumers through Grafts:

\`\`\`PowerShell
docker build -t pythoncurrencyservice:latest .
docker run -d -p 90:90 -p 91:91 -p 9092:9092 --name pythoncurrencyservice pythoncurrencyservice:latest
docker network create mynetwork
docker network connect mynetwork graftcode_demo
docker network connect mynetwork pythoncurrencyservice
\`\`\`

Now you can visit the GraftVision portal at [http://localhost:91/GV](http://localhost:91/GV). 

You will see that the Currency Converter module is now hosted as separate microservice. You can host any other public module in the same way or extract any custom library as separate microservice by just hosting it on Graftcode Gateway in dedicated container.

## Step 2. Switch your CurrencyConverter calls from monolith to microservice

Now we will switch the configuration of your **MyEnergyService** so that it will use the **CurrencyConverter** module hosted in separate container (as microservice) instead of in-memory module (as part of monolith).

To do this, open **Docker Desktop** and navigate to your running **graftcode_demo** container by clicking on it. Then view the files by clicking on **Files** tab and modify **usr/app/graft.pypi.sdncenter_currency_converter-config.json** file (right click and select **Edit file**).

In this file, change the channel section to use TCP/IP connection to your new container instead of in-memory (in-memory means that it is hosted within the same process as your .NET service on the same local machine, whereas TCP/IP means that the connection is made over the network).

![Docker Desktop Container File System](@assets/image_1757595889445.png)

Replace the config file with following content:
\`\`\`Json
{
  "runtimes": {
    "python": [
      {
        "calledTechKey": null,
        "name": "python__InMemoryRuntime",
        "customOptions": "",
        "channel": {
          "type": "tcp",
          "host": "currencyconverter",
          "port": 9092
        }
      }
    ]
  }
}
\`\`\`

As you see we just modified the "channel" section to use the TCP/IP connection to the new container (currently hosted on your local machine, but it can be any  remote host or cloud service) instead of in-memory connection. This is the same module that we were using before but now we're connection to it over the network. 

Now, when you restart the container, your app will start using this remote connection to connect to the remote module, without any change in code. 

Run command below to restart your container:

\`\`\`Powershell
docker stop graftcode_demo
docker start graftcode_demo
\`\`\`

Now navigate to GraftVision portal for **EnergyService** at [http://localhost:81/GV](http://localhost:81/GV) and try the _GetMyCurrentCost_ method again. 

This time execution of python module **CurrencyConverter** goes over the network to your remote microservice - but your business logic code didn't change. You can dynamically switch architecture between monolith and microservices without any modification in your core logic code - just by simple configuration change.

> ⚡ **Important:** You service is using multiple Grafts and each of them might have its own configuration. Energy Backend keeps calling our hosted cloud service through websockets but your currency converter Graft just switched from in-memory to TCP/IP. All of this can be done through configuration files, environmental variables or from code. This allows you to dynamically change the architecture of your app without any code change.

## Step 4. Old Way vs New Way

### Old Way (without Graftcode)

Without Graftcode similar change would required number of steps:
- building new python service referencing currency service module
- implementing REST endpoints to forward every operation present on currency service module
- implementing DTOs for every argument and result object
- host this service as separate microservice
- modify code of your EnergyPrice service to call new REST endpoints
- implement DTOs and mapping for every method you planned to use
- modify your code usage to REST instead of direct method calls
- deploy your service again

### New Way (with Graftcode)

- You can host any module from public/private repository or any custom library "as is" without even preparing it for remote calls
- You can switch between monolith and microservices with just configuration change and just restart service

> ⚡ **Important:**
> With Graftcode, migrating from monolith to microservices (or back) is no longer a rewrite - it's just a configuration change.`,
    parentId: "pmf-demo",
    order: "1.5",
    isExpandable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "compare-performance",
    title: "Compare Performance",
    slug: "compare-performance",
    content: `## Goal

Understand how Graftcode's Hypertube technology delivers superior performance compared to traditional REST APIs and gRPC, reducing cloud costs, CO2 emissions, and improving user experience.

## What You'll See

- How Graftcode reduces code processing overhead for every remote call
- Performance comparison between Graftcode, REST, and gRPC protocols
- Real-world benchmarks showing measurable speed improvements
- Environmental and cost benefits of optimized communication

## The Technology: Hypertube Channel

Instead of using REST or HTTP-based gRPC, Graftcode uses our proprietary **Hypertube channel** technology:

<collapsible title="🔧 How Hypertube Works - Technical Deep Dive">

**Traditional Approach (REST/gRPC):**
- Every call is processed through service client layer
- Serialize data to JSON/Protocol Buffers
- Add HTTP headers and metadata
- Process through multiple framework layers
- Parse and deserialize on the receiving end
- Invokes asociated route method
- Process the call in business logic and returns result

**Graftcode Hypertube Approach:**
- Translates one or multiple programming instructions executed on Graft into binary representation of developer intention
- Pass that message straight to native layer of calling service and sends to native layer of target runtime
- Trigger target method from native layer and returns result through the same channel

</collapsible>

## Performance Benefits

**Faster Processing**
- Reduced client-side processing
- Faster server-side execution
- Lower latency

**Cost Reduction**
- Lower cloud costs: Reduced CPU usage on both client and server
- Fewer server resources: More efficient use of compute power
- Reduced bandwidth: Optimized binary throughput usage

**Environmental Impact**
- Lower CO2 emissions: Reduced energy consumption from optimized processing
- Greener computing: More efficient resource utilization
- Sustainable architecture: Performance gains compound across millions of calls

## Step 1. Try performance testing tool

Experience the performance difference yourself with our interactive benchmarking tool:

🔗 [Graftcode Performance Lab](http://gc-t-rg-polc-perfapp-01.bzhcesgchufrcsce.polandcentral.azurecontainer.io/)

![screenshot-1757451289564.png]

The tool allows you to:
- **Run 1000 calls** using Graftcode, REST, and gRPC protocols
- **Compare with REST** HTTP GET requests to /price endpoint
- **Compare with gRPC** calls to GetPrice protobuf method
- **Measure network latency** to isolate pure protocol performance
- **See real-time results** with total execution time for each method

When running a continuous stream of requests against the same operation hosted by Graftcode vs GRPC or REST, we see that Graftcode's range of Y axis is multi-fold lower than REST and GRPC:

**REST Performance**
![REST Performance Metrics](@assets/image_1757546672374.png)

**GRPC Performance**
![GRPC Performance Metrics](@assets/image_1757546676378.png)

**GRAFTCODE Performance**
![Graftcode Performance Metrics](@assets/image_1757546679962.png)

## Step 2. Run the performance tests

- Open the Performance Lab using the link above
- Click "Run 1000 calls" for each protocol (Graftcode, REST, gRPC)
- Compare the results in the "Performance Comparison" section
- Note the time differences and calculate the performance improvement
- Check the Developers tools to see the difference in the way how communication is handled

<collapsible title="📊 Understanding the Results - What to Look For">

**Typical Results You'll See:**
- **Graftcode**: Fastest execution time due to direct binary communication
- **gRPC**: Moderate performance with Protocol Buffer overhead
- **REST**: Slowest due to JSON serialization and HTTP overhead
- **Network Latency**: Shows baseline network delay (excluded from comparison)

</collapsible>

## Step 3. Calculate your savings

Use the Cloud Cost Savings calculator in the Performance Lab to estimate your potential cost reductions:

![image_1757455198110.png]

**How to Use the Calculator**
- Select your current call volume from the RPS dropdown (requests per second)
- Choose your cloud provider (Azure, AWS, Google Cloud)
- Pick your current integration technology (REST, gRPC, GraphQL)
- Review the calculated annual savings based on performance improvements

**What the Results Show**
- Time saved per individual call compared to traditional approaches
- Total compute time saved annually across all your API calls
- Recommended cloud instance type based on your usage patterns
- Annual cost savings in USD based on current cloud pricing

**Example Results**
- At 5,000 RPS with Azure Standard_D16s_v5 instances
- Graftcode saves 4.04ms per call compared to REST
- Annual savings of $136,067 from reduced compute time
- Based on real performance differences measured by the lab

> The calculator uses actual performance benchmarks and current cloud provider pricing to give you realistic cost projections for switching to Graftcode.

## Why Performance Matters

- **User Experience**: Faster apps lead to higher user satisfaction and retention
- **Scalability**: Better performance means your app can handle more users
- **Sustainability**: Reduced resource usage contributes to environmental goals
- **Business Value**: Performance improvements directly impact your bottom line`,
    parentId: "pmf-demo",
    order: "1.6",
    isExpandable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "migrate-existing-project",
    title: "Migrate Your Existing Project",
    slug: "migrate-existing-project",
    content: `# Migrate Your Existing Project

## Goal

Transform your existing application to use Graftcode without a complete rewrite, preserving your current investment while gaining new capabilities, simplify maintenance, enable AI based enhancements and increase performance - lowering cloud cost and CO2 emissions.

## What you'll see

- Gradual migration path with minimal risk
- Existing code continues to work during transition
- Immediate benefits without full migration

## Demo Steps

1. **Assessment and Planning**
   - Analyze your current architecture
   - Identify integration pain points
   - Plan migration priorities

2. **Incremental Adoption**
   - Start with new features using Graftcode
   - Gradually wrap existing services
   - Maintain backward compatibility

## Migration Strategies

### Strategy 1: New Features First

- Build new functionality with Graftcode
- Leave existing code untouched
- Gradually expand Graftcode usage

### Strategy 2: Service Co-Hosting

- Replace middleware for existing web service applications to Graftcode Gateway
- Keep using REST/SOAP endpoints for backward compatibility
- Get ability to retrieve Grafts for this service
- Add Grafts on client side and start with switching one REST method to direct call on Graft
- Gradually replace all calls with direct Graft calls
- Remove legacy client code
- Remove legacy service API code and replace it with simple pure facade classes or expose business logic directly

Detailed migration guide is coming soon!
`,
    parentId: "pmf-demo",
    order: "1.8",
    isExpandable: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getPmfDemoSectionBySlug = (
  slug: string,
): TutorialSection | undefined => {
  return pmfDemoSections.find((section) => section.slug === slug);
};

export const getPmfDemoSectionsByParent = (
  parentId: string | null,
): TutorialSection[] => {
  return pmfDemoSections.filter((section) => section.parentId === parentId);
};
