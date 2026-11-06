---
title: "Ruby"
description: "Build two Ruby classes in one project as a monolith, then extract one into a separate microservice with Graftcode — and switch freely between the two topologies with a single configuration change."
---

## Goal

Start with two Ruby classes in a single project running as a monolith, then extract one into a separate microservice using Graftcode. After that one-time setup, switch freely between monolith and microservice by changing a single configuration value — zero further code changes.

### What You'll See

- Create two Ruby classes in the same project — a price calculator and a billing service that calls it directly.
- Host both in a single container as a monolith.
- Extract the price calculator into its own container as a standalone microservice.
- Connect the billing service through a Graft.
- Switch between monolith and microservice by changing one environment variable — no code changes from that point on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Ruby](https://www.ruby-lang.org/en/downloads/) and [Bundler](https://bundler.io/) installed locally (for `bundle` commands)

## Step 1. Create a project folder

```bash
mkdir ruby-energy-platform
cd ruby-energy-platform
```

Create `energy-platform.gemspec`:

```ruby
# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name = "energy-platform"
  spec.version = "1.0.0"
  spec.authors = ["Example"]
  spec.summary = "Energy platform - switches between monolith and microservice deployments"
  spec.license = "MIT"
  spec.files = Dir["lib/**/*.rb"]
  spec.require_paths = ["lib"]
  spec.required_ruby_version = ">= 3.2.0"
end
```

Create `Gemfile`:

```ruby
# frozen_string_literal: true

source "https://rubygems.org"

gemspec
```

## Step 2. Write the price calculator

Create `lib/energy_price_calculator.rb`:

```ruby
# frozen_string_literal: true

class EnergyPriceCalculator
  def self.get_price
    rand(100..104)
  end
end
```

## Step 3. Write the billing service

Create `lib/billing_service.rb`:

```ruby
# frozen_string_literal: true

class BillingService
  def self.calculate_bill(kwh_used)
    price = EnergyPriceCalculator.get_price
    kwh_used * price
  end
end
```

A direct class reference — no Graftcode wiring yet.

## Step 4. Host as a monolith

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

Build and run:

```bash
docker build --no-cache --pull -t ruby-energy-platform:test .
docker run -d -p 80:80 -p 81:81 --name energy_platform ruby-energy-platform:test
```

`gg` (Graftcode Gateway) scans `/usr/app/lib`, discovers both classes, and exposes their public class methods. Open [http://localhost:81/GV](http://localhost:81/GV) and invoke `BillingService.calculate_bill` — both classes show up because everything runs in one process.

## Step 5. Extract the price calculator as a separate microservice

Create `Dockerfile.priceCalculator`:

```dockerfile
FROM ruby:3.3-bookworm

WORKDIR /usr/app

COPY . /usr/app/

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
 && curl -fsSL grft.dev/get/gg | sh && dpkg -i gg.deb && rm gg.deb \
 && bundle install \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV HYPERTUBE_RUBY_RUNTIME_PATH=/usr/local/lib/libruby.so

EXPOSE 90
EXPOSE 91

CMD ["gg", ".", "--runtime", "ruby", "--types", "EnergyPriceCalculator", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092"]
```

The second container uses the same gem layout as the monolith. `--types EnergyPriceCalculator` exposes only that class as a standalone service while keeping the usual Ruby hosting path (gem root with `*.gemspec`).

Build and run the dedicated gateway:

```bash
docker build --no-cache --pull -f Dockerfile.priceCalculator -t price-calculator-ruby:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name price_calculator price-calculator-ruby:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — only `EnergyPriceCalculator` is published on this Gateway instance.

## Step 6. Connect the billing service through a Graft

From Vision at [http://localhost:91/GV](http://localhost:91/GV), choose **RubyGems** and copy the `gem install` / Bundler snippet.

Merge that gem into the root `Gemfile` next to `gemspec` (illustration only — **paste Vision's `source` + `gem` lines**):

```ruby
# frozen_string_literal: true

source "https://rubygems.org"

source "https://grft.dev/<uuid>__free" do
  gem "graft-rubygems-energy-platform", "1.0.0"
end

gemspec
```

Run `bundle install` locally so `Gemfile.lock` captures the Graft coordinates, then rebuild the Docker image — the existing `RUN bundle install` layer pulls the gem during `docker build`.

Update `lib/billing_service.rb` to load the Graft and read configuration from `GRAFT_CONFIG`:

```ruby
# frozen_string_literal: true

require "graft_rubygems_energy_platform"

class BillingService
  def self.calculate_bill(kwh_used)
    GraftConfig.set_config(ENV["GRAFT_CONFIG"])
    price = EnergyPriceCalculator.get_price
    kwh_used * price
  end
end
```

Use the exact `require` string and namespaces printed in Vision - generated Ruby typically mirrors the hosted types (for example `EnergyPriceCalculator` and `GraftConfig`). This single edit is the only code change in the tutorial; topology is now driven entirely by `GRAFT_CONFIG`, as described in [Configure Graft invocation](https://academy.dev.graftcode.com/documentation).

> In `GRAFT_CONFIG`, `name=` is the graft's internal identifier (often like `graft.rubygems.energy_platform`) — **not** the hyphenated RubyGems package id. Copy the `name=` segment from Vision or the generated `GraftConfig`.

## Step 7. Run as a microservice

Rebuild the main image and run it on the Docker network:

```bash
docker stop energy_platform
docker rm energy_platform
docker build --no-cache --pull -t ruby-energy-platform:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft.rubygems.energy_platform;host=ws://price_calculator:90/ws;runtime=ruby;modules=/usr/app" \
  -p 80:80 -p 81:81 \
  --name energy_platform ruby-energy-platform:test
```

Call `BillingService.calculate_bill` from [http://localhost:81/GV](http://localhost:81/GV) — results match the monolith, but price selection now crosses the network.

## Step 8. Switch back to monolith

```bash
docker stop energy_platform
docker rm energy_platform
docker run -d \
  -e GRAFT_CONFIG="name=graft.rubygems.energy_platform;host=inmemory;runtime=ruby;modules=/usr/app" \
  -p 80:80 -p 81:81 \
  --name energy_platform ruby-energy-platform:test
```

Side-by-side:

```text
# Monolith (in-process)
name=graft.rubygems.energy_platform;host=inmemory;runtime=ruby;modules=/usr/app

# Microservice (remote)
name=graft.rubygems.energy_platform;host=ws://price_calculator:90/ws;runtime=ruby;modules=/usr/app
```

`GRAFT_CONFIG` owns the topology — same image, same Ruby source, one environment variable.

## Step 9. Prove the remote call

Return to microservice mode, stop `price_calculator`, and watch `calculate_bill` fail in Vision until the dependency container restarts — identical behavior to the other language tutorials, proving the billing service now depends on the remote Gateway.

## Step 10. Run with a Project Key (recommended for real-world usage)

When you graduate beyond local UUID registries, add `--projectKey` to each `gg` invocation (Dockerfile `CMD` or orchestration env) so RubyGems coordinates and MCP endpoints stay stable — see [Use a project key](https://academy.dev.graftcode.com/documentation).

<collapsible title="Old Way vs New Way">

### Without Graftcode

Extracting a module from a monolith usually means new HTTP APIs, DTOs, generated clients, redeploys, and another round of work if you collapse services again.

### With Graftcode

- Begin with ordinary Ruby classes in one repo
- Host the extracted module on Gateway, install its Ruby Graft once, and call through generated types
- Flip `host` between `inmemory` and `ws://...` whenever operations need a different topology

> The Ruby code you care about stops changing after the first Graft import — architectural experiments become configuration, not rewrites.

</collapsible>
