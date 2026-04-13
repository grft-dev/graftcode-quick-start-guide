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
- **Lets you use modules from any language** - install a Python, Java, or .NET module into a JavaScript project (or any other combination) through your package manager and call it like a native import.
- **Switches between monolith and microservices** - run a module in-process or as a remote service, and move between the two by changing one configuration value. No rewrite, no new clients, no new endpoints.

> Watch the short intro video to see Graftcode in action:

<iframe src="https://share.descript.com/embed/xDrYh06ZJfd" width="640" height="360" frameborder="0" allowfullscreen></iframe>

## Tutorials

Each tutorial is **self-contained** - pick the scenario that interests you and follow it from start to finish. No previous tutorial is required.

| # | Tutorial | What you'll do |
|---|----------|----------------|
| 1 | [**Connect Frontend to Backend**](1-connect-frontend-to-backend/react.md) | Call a live backend service from a React app using a Graft - no REST client, no DTOs. |
| 2 | [**Expose a Backend Service**](2-expose-backend/javascript.md) | Turn a JavaScript module into a remotely callable service with Graftcode Gateway and Docker. |
| 3 | [**Connect Microservices**](3-connect-microservices/javascript.md) | Connect one backend service to another by installing a Graft and calling remote methods like local code. |
| 4 | [**Use Modules from Any Technology**](4-use-modules-from-any-technology/javascript.md) | Use a Python module directly in a JavaScript service - no REST wrapper, no rewrite. |
| 5 | [**Expose MCP for AI**](5-expose-mcp/javascript.md) | Make your service callable by AI agents through the Model Context Protocol. |
| 6 | [**Switch Between Monolith and Microservices**](6-switch-between-monolith-and-microservices/javascript.md) | Run a module in-process, then extract it as a separate microservice - by changing one config value. |

### Prerequisites

These are common to all tutorials:

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) installed locally (for JavaScript tutorials)
- No Graftcode account needed - everything works locally out of the box

## Learn More

- [graftcode.com](https://graftcode.com/) - product overview, features, and how-it-works walkthrough
- [Graftcode Academy](https://academy.dev.graftcode.com/documentation) - full documentation covering core concepts, integration patterns, security, and performance

> Ready? Pick a tutorial above and start building.
