## Goal

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

```bash
dotnet add package -s https://grft.dev/graftcode-demo__e74616d1-1661-45ff-92a7-e7770a70d24a graft.nuget.EnergyPriceService --version 1.1.0.0
```


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

```csharp
using graft.nuget.be;
using graft.nuget.MyEnergyService;
```

Create a static constructor for your **MyEnergyService** class and add the following line to configure the connection to the remote service (remember, you can set the configuration in multiple ways - code, env variable or config file):

```csharp
static MyEnergyService()
{
    GraftConfig.host="wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws";
}
```

## Step 4. Use the method

And add new method to **MyEnergyService** class which returns current cost retrieving consumption calculated by remote cloud service and multiplying by generated random price. Add this code to your _MyEnergyService.cs_ file, below the _GetPrice()_ method, and remeber to **Save it**:

```csharp
public static double GetMyCurrentCost(int previousReadingKwh, int currentReadingKwh)
{
    var consumption = MeterLogic.NetConsumptionKWh(previousReadingKwh, currentReadingKwh);
    return consumption * GetPrice();
}
```

The method call is:
- **Strongly-typed** - You get full IntelliSense and compile-time type checking
- **Always in sync** - The client automatically reflects any changes made to the backend service
- **Direct integration** - No REST calls, DTOs, or manual client code needed

Focus on the way how your interaction with remote service looks like. It is fully decoupled from architecture or communication channel and feels like local method. 

![image_1757538666786.png]

<collapsible title="🔧 Click here to see the full code of MyEnergyService.cs">
```csharp
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
```
</collapsible>

## Step 5. Build and test your updated service

Now let's build and publish your project:

```bash
dotnet build .\\MyEnergyService.csproj
dotnet publish .\\MyEnergyService.csproj
```

Build the Docker image again and run it to test your updated service with the new _GetMyCurrentCost_ method.

Stop Docker container if it's running, remove it and run again by executing the following commands:

```bash
docker stop graftcode_demo
docker rm graftcode_demo

docker build --no-cache --pull -t myenergyservice:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_demo myenergyservice:test
```

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

> ⚡ **Important:** This example is proving that Graftcode not only covers the edge connection from Web app or mobile client to cloud backend but also allows to integrate across microservices. It all works regardless if module with your business logic is hosted in cloud, locally on your machine or within container. From code perspective the _NetConsumptionKWh_ method behaves exactly like a local function in your codebase, but it's actually executing on the remote backend service keeping your code decoupled from system architecture.
