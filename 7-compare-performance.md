## Goal

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
- **Business Value**: Performance improvements directly impact your bottom line
