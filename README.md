# Graftcode Quick Start Guide

Hands-on tutorials that take you from zero to working Graftcode integration - each one self-contained, each completable in minutes.

## What is Graftcode?

Graftcode lets you connect frontends, backends, and services without writing APIs, generating SDKs, or maintaining client layers.

Instead, you:
- **Write** public methods in your language of choice.
- **Run** them on Graftcode Gateway - it discovers and exposes your methods automatically.
- **Install** a strongly-typed client (called a **Graft**) in any other app using a regular package manager command.
- **Call** remote methods as if they were local code.

Behind the scenes, communication is handled through Graftcode's Hypertube protocol - native runtime integration with binary messaging. No REST, no gRPC, no generated wrappers. In benchmarks, it processes calls up to 70% faster than traditional web services and uses a fraction of the CPU compared to REST or gRPC.

On top of that, Graftcode also:
- **Exposes MCP automatically** - every hosted service gets a [Model Context Protocol](https://modelcontextprotocol.io/) endpoint out of the box, so AI agents can call your methods directly. If your project already has a REST API, it stays intact - Graftcode adds this new layer alongside it.
- **Lets you use modules from any language** - install a module from Python, Java, .NET, or JavaScript into any project through your package manager and call it like a native import.
- **Switches between monolith and microservices** - run a module in-process or as a remote service, and move between the two by changing one configuration value. No rewrite, no new clients, no new endpoints.

> Watch the short intro video to see Graftcode in action:

<iframe src="https://share.descript.com/embed/xDrYh06ZJfd" width="640" height="360" frameborder="0" allowfullscreen></iframe>

## Conference Lottery — Tutorials

We host one central **Lottery** service with a single method: `Lottery.AddTicket(email)`. Every challenge is a different way of integrating with it. Pick a scenario, run it, and your email is added to the conference pool — the more challenges you complete, the more tickets you collect. Every tutorial is available in multiple languages.

| # | Challenge | What you'll do | Languages |
|---|-----------|----------------|-----------|
| 1 | [**Connect Frontend to Backend**](/quick-start/connect-frontend-to-backend) | Call our `Lottery.AddTicket(email)` directly from a frontend app — no REST client, no DTOs. | [React](1-connect-frontend-to-backend/react.md) · [Vue](1-connect-frontend-to-backend/vue.md) · [Angular](1-connect-frontend-to-backend/angular.md) |
| 2 | [**Expose a Backend Service**](/quick-start/expose-backend/) | Host your own `Booth.CheckIn(email)` that internally calls our `Lottery.AddTicket(email)` — be a Graft consumer **and** a Graftcode producer. | [JavaScript](2-expose-backend/javascript.md) · [.NET](2-expose-backend/dotnet.md) · [Python](2-expose-backend/python.md) · [Java](2-expose-backend/java.md) · [Kotlin](2-expose-backend/kotlin.md) · [Groovy](2-expose-backend/groovy.md) |
| 3 | [**Connect Microservices**](/quick-start/connect-microservices/) | Call `Lottery.AddTicket(email)` from your own backend by installing a typed Graft. | [JavaScript](3-connect-microservices/javascript.md) · [.NET](3-connect-microservices/dotnet.md) · [Python](3-connect-microservices/python.md) · [Java](3-connect-microservices/java.md) |
| 4 | [**Use Modules from Any Technology**](/quick-start/use-modules-from-any-technology/) | Embed the Lottery module from a different language directly in your process — same `Lottery.AddTicket(email)`, in-memory. | [JavaScript](4-use-modules-from-any-technology/javascript.md) · [.NET](4-use-modules-from-any-technology/dotnet.md) · [Python](4-use-modules-from-any-technology/python.md) · [Java](4-use-modules-from-any-technology/java.md) |
| 5 | [**Expose MCP for AI**](/quick-start/expose-mcp/) | Expose your `Booth.CheckIn(email)` (which calls `Lottery.AddTicket(email)` inside) so an AI agent can enter you in the draw via MCP. | [JavaScript](5-expose-mcp/javascript.md) · [.NET](5-expose-mcp/dotnet.md) · [Python](5-expose-mcp/python.md) · [Java](5-expose-mcp/java.md) |
| 6 | [**Switch Between Monolith and Microservices**](/quick-start/switch-between-monolith-and-microservices/) | Run `Booth` + `LotterySubmitter` as a monolith, split `LotterySubmitter` into a microservice, switch with one config value — both topologies still call our `Lottery.AddTicket(email)`. | [JavaScript](6-switch-between-monolith-and-microservices/javascript.md) · [.NET](6-switch-between-monolith-and-microservices/dotnet.md) · [Python](6-switch-between-monolith-and-microservices/python.md) · [Java](6-switch-between-monolith-and-microservices/java.md) |

### Prerequisites

All tutorials require:

- [Docker](https://docs.docker.com/get-docker/) installed and running
- No Graftcode account needed - everything works locally out of the box

Depending on the language you choose, you'll also need one of:

- [Node.js](https://nodejs.org/) - for JavaScript / React tutorials
- [.NET SDK](https://dotnet.microsoft.com/download) - for .NET tutorials
- [Python](https://www.python.org/downloads/) - for Python tutorials
- [JDK 21](https://adoptium.net/) and [Maven](https://maven.apache.org/download.cgi) - for Java tutorials

## Learn More

- [graftcode.com](https://graftcode.com/) - product overview, features, and how-it-works walkthrough
- [Graftcode Academy](https://academy.dev.graftcode.com/documentation) - full documentation covering core concepts, integration patterns, security, and performance

> Ready? Pick a tutorial above and start building.
