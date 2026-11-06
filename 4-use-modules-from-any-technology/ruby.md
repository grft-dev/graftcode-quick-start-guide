---
title: "Ruby"
description: "Use a module from any supported technology in your Ruby service with Graftcode - no REST wrapper, no rewrite, no custom interop. Install it as a typed Graft and call it like any other dependency."
---

## Goal

Use a module from any supported technology directly in a Ruby service with Graftcode - no REST wrapper, no rewrite, no custom interop. In this tutorial we use a .NET NuGet module as the example.

### What You'll See

- Install a module from another technology as a strongly-typed Graft using RubyGems - just like any other gem.
- Configure the generated client for in-memory execution when the Graft ships the Receiver inside the package.
- Import and call it from your Ruby code as if it were a native library.

### Prerequisites

- [Ruby](https://www.ruby-lang.org/en/downloads/) (3.2 or newer recommended) and [Bundler](https://bundler.io/) installed locally
- [.NET SDK](https://dotnet.microsoft.com/download) (or a `Microsoft.NETCore.App` runtime) installed locally - `inmemory` loads this Graft on Netcore, not on the Ruby interpreter alone

## Step 1. Create a project folder

Create a new folder for your project:

```bash
mkdir ruby-dotnet-module-demo
cd ruby-dotnet-module-demo
```

## Step 2. Install a module from another technology

For this example we'll use a .NET sample library from NuGet (`sdnTestSimpleCar` / `SimpleCar`), but the same approach works with any module from a supported repository - npm, PyPI, Maven, or NuGet.

The published RubyGems package name is **all lowercase** (`graft-nuget-sdntestsimplecar`) — not `graft-nuget-sdnTestSimpleCar`. If `bundle exec ruby main.rb` says the gem is missing, your `Gemfile` likely used the wrong casing; fix the name and run `bundle install` again.

Install from the CLI:

```bash
gem install graft-nuget-sdntestsimplecar -v "0.1.0" --source https://grft.dev/
```

Or add a `Gemfile` (registry — **copy from Vision when connecting to your own gateway**):

```ruby
# frozen_string_literal: true

source "https://rubygems.org"

source "https://grft.dev/" do
  gem "graft-nuget-sdntestsimplecar", "0.1.0"
end
```

```bash
bundle install
```

This installs a **Graft** - a strongly-typed Ruby client generated from the remote module. You import and call it like any other gem, regardless of which technology the module was originally written in.

## Step 3. Set the SDK key

Set the `HYPERTUBE_KEY` environment variable in your terminal before running the project:

**PowerShell:**

```powershell
$env:HYPERTUBE_KEY="f7GZ-De6k-Mx4p-t7FN-q5DC"
```

**Bash (macOS / Linux):**

```bash
export HYPERTUBE_KEY="f7GZ-De6k-Mx4p-t7FN-q5DC"
```

**Windows CMD:**

```cmd
set HYPERTUBE_KEY=f7GZ-De6k-Mx4p-t7FN-q5DC
```

The first successful activation creates a `hypertube.lic` file. Later runs (and other local projects) can reuse that license. Activating the same key again in a clean environment may return `ERROR:Key already used`.

## Step 4. Call the cross-language module and run it

Create `main.rb`:

```ruby
# frozen_string_literal: true

require "bundler/setup"
require "graft_nuget_sdntestsimplecar"

GraftConfig.host = "inMemory"

car = SimpleCar.new("Toyota", "Corolla", 2022, "car-001")

puts car.to_string
puts "Running: #{car.is_running}"

car.start
puts "Running: #{car.is_running}"
```

Run it:

```bash
ruby main.rb
```

Prefer property and method names from the installed gem or Vision - generated Ruby often uses `snake_case` (`to_string`, `is_running`) even when the .NET API uses PascalCase.

You should see the car description and running state printed in your terminal. `SimpleCar` comes from a .NET NuGet package, but your code reads like ordinary Ruby - no HTTP stack, no manual deserialization. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the .NET assembly inside the Hypertube bridge for this Graft.

## Step 5. Run with a Project Key (recommended for real-world usage)

Everything above works without any account - perfect for learning and local development. When you're ready for real-world usage, create a free account at [portal.graftcode.com](https://portal.graftcode.com), set up a project, and copy its **Project Key**.

With a Project Key, point `GraftConfig.host` at your project's stable WebSocket endpoint when you switch from in-memory to remote execution. A Project Key gives you:

- **Stable registry URL** - the address for your Grafts stays permanent, so install commands don't change when you redeploy.
- **Portal visibility** - see all your gateways and services in one place at [gateways.graftcode.com](https://gateways.graftcode.com/).
- **Access control** - decide who can download your Grafts using package manager authentication and permissions.

<collapsible title="Old Way vs New Way">

### Without Graftcode

Using a module from another language in Ruby typically requires:

- Building a separate service around the module with REST or gRPC endpoints
- Defining request and response DTOs for every operation
- Hosting and deploying that service independently
- Writing HTTP or gRPC client code in your Ruby project
- Maintaining the integration layer as the module evolves
- Or rewriting the module entirely in Ruby

### With Graftcode

- Install any public module from npm, NuGet, PyPI, Maven, or Packagist as a strongly-typed Graft with one `gem` line
- Import and call it like a regular dependency - no wrappers, no hand-written clients
- The module runs in-process or on a remote host, controlled by a single configuration line on `GraftConfig`

> Technology choice stops being an integration constraint. You can keep writing Ruby and use the best libraries from any ecosystem - JavaScript, .NET, Java, Python - as if they were native gems.

</collapsible>
