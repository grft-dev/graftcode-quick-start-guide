---
title: "Ruby"
description: "Make any Ruby module callable by AI agents through MCP with Graftcode Gateway - no API design, no tool definitions, no MCP server code. Any public method becomes an MCP tool automatically."
---

## Goal

Turn a Ruby library into an MCP-compatible service that AI agents can discover and call - with zero MCP server code, no tool definitions, and no OpenAPI specs.

### What You'll See

- Create a small Ruby class with public class methods.
- Host it through Graftcode Gateway using Docker - the gateway automatically exposes an MCP endpoint.
- Connect an AI tool (Cursor or Claude Desktop) to the MCP endpoint.
- Ask the AI agent to call your methods - it discovers and invokes them through the Model Context Protocol.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Ruby](https://www.ruby-lang.org/en/downloads/) and [Bundler](https://bundler.io/) *(optional)* - only if you edit files outside Docker; build and Gateway run entirely in the container
- An AI tool with MCP support - for example [Cursor](https://cursor.com/) or [Claude Desktop](https://claude.ai/download)

## Step 1. Create a project folder

```bash
mkdir ruby-ai-backend
cd ruby-ai-backend
```

Add `energy-service.gemspec` (same shape as in [Expose a Backend Service — Ruby](../2-expose-backend/ruby.md)) and a `Gemfile`:

```ruby
# frozen_string_literal: true

source "https://rubygems.org"

gemspec
```

## Step 2. Write a Ruby class with public methods

Create `lib/energy_price_calculator.rb`:

```ruby
# frozen_string_literal: true

class EnergyPriceCalculator
  def self.get_price
    rand(100..104)
  end

  def self.calculate_bill(kwh_used)
    price_per_kwh = rand(100..104).to_f
    kwh_used * price_per_kwh
  end
end
```

No MCP-specific API - plain Ruby. Every **public** class method becomes a callable MCP tool once Gateway hosts the module.

## Step 3. Host it with Graftcode Gateway

Create a `Dockerfile` in the project root:

```dockerfile
FROM ruby:3.3-bookworm

WORKDIR /usr/app

COPY . /usr/app/

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
 && curl -fsSL grft.dev/get/gg | sh && dpkg -i gg.deb && rm gg.deb \
 && bundle install \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV HYPERTUBE_RUBY_RUNTIME_PATH=/usr/local/lib/libruby.so

EXPOSE 80
EXPOSE 81

CMD ["gg", ".", "--runtime", "ruby"]
```

`gg` (Graftcode Gateway) discovers public methods and exposes them both as Grafts for app-to-app calls and as MCP tools for AI agents. Port `80` carries WebSocket traffic; port `81` serves Graftcode Vision and the MCP HTTP surface.

<collapsible title="🐳 Understanding the Dockerfile - click to see what each line does">

- **FROM ruby:3.3-bookworm** - Official Ruby runtime with build tools for Bundler.
- **COPY . /usr/app/** - Copies `lib/`, the gemspec, and `Gemfile`.
- **bundle install** - Ensures dependency metadata matches what you use locally.
- **RUN curl ... grft.dev/get/gg** - Installs Graftcode Gateway (`gg`) from the published Linux package.
- **ENV HYPERTUBE_RUBY_RUNTIME_PATH** - Locates `libruby.so` for Hypertube's Ruby runtime bridge.
- **EXPOSE 80 / 81** - WebSocket (`80`) and Vision + MCP HTTP (`81`).
- **CMD ["gg", ".", "--runtime", "ruby"]** - Starts Graftcode Gateway against your gem project. It discovers public methods and exposes them as Grafts and MCP tools (same pattern as [Run Gateway locally](https://academy.dev.graftcode.com/documentation)).

</collapsible>

Build and run the container:

```bash
docker build --no-cache --pull -t ruby-ai-backend:test .
docker run -d -p 80:80 -p 81:81 --name graftcode_mcp_demo_ruby ruby-ai-backend:test
```

Your Ruby service now exposes MCP automatically alongside Grafts.

## Step 4. Explore the service in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV).

You will see each public class method with parameters and return types. Those same methods are MCP tools agents can list and invoke.

## Step 5. Connect an AI tool to the MCP endpoint

Graftcode Gateway serves MCP on the Vision HTTP port by default. Point your AI client at `http://localhost:81/mcp`.

**Cursor** - add to `.cursor/mcp.json` (or **Cursor Settings → Tools & MCP → New MCP Server**):

```json
{
  "mcpServers": {
    "energy-service": {
      "url": "http://localhost:81/mcp"
    }
  }
}
```

**Claude Desktop** - [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) bridges stdio to the HTTP endpoint:

```json
{
  "mcpServers": {
    "energy-service": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:81/mcp"
      ]
    }
  }
}
```

Restart Claude Desktop after editing its config.

## Step 6. Call your methods through AI

Ask the agent something concrete, for example:

> "What is the current energy price?"

It should call `EnergyPriceCalculator.get_price` via MCP. You can also try:

> "Calculate the energy bill for 250 kWh"

That maps to `EnergyPriceCalculator.calculate_bill(250)` with no hand-authored tool definitions.

## Step 7. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

```dockerfile
CMD ["gg", ".", "--runtime", "ruby", "--projectKey", "YOUR_PROJECT_KEY"]
```

A Project Key gives you:

- **Stable MCP URL** - AI tools connect to an endpoint that survives redeploys.
- **Stable registry URL** - RubyGems (and other managers) always resolve the same coordinates.
- **Portal visibility** - track gateways at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - package-manager auth for Grafts and MCP consumers alike.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Making backend methods callable by AI agents typically requires:

- Implementing an MCP server with explicit tool definitions
- Mapping each tool to business logic by hand
- Maintaining JSON schemas whenever signatures change
- Hosting that MCP process beside your service - or exposing REST and writing custom function-calling glue per LLM vendor

### With Graftcode

- Write plain Ruby class methods - zero MCP-specific code
- Run Gateway once; MCP mirrors whatever you expose to Grafts
- Add or rename a method and agents discover it automatically on reconnect

> Your Ruby library becomes AI-callable with the same Dockerfile you would already use for Grafts - no parallel MCP codebase.

</collapsible>
