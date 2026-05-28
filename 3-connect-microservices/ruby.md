---
title: "Ruby"
description: "Challenge 3 — call the central Lottery service from another Ruby service with Graftcode. Install a typed Graft and call remote methods like local code."
---

## Goal

Call the central **Lottery service** (built and hosted by us) from your own Ruby backend using Graftcode — strongly typed, no REST client, no DTOs.

### Prerequisites

- [Ruby 3.2+](https://www.ruby-lang.org/) and [Bundler](https://bundler.io/) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll call the central Lottery service from your backend by installing a typed Graft package.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create a project folder

```bash
mkdir ruby-lottery-consumer
cd ruby-lottery-consumer
```

## Step 4. Install the Lottery Graft

Open [Graftcode Vision](https://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io), pick `RubyGems`, and copy the install command. The Lottery service is published by us as a strongly-typed Graft you can install like any other gem.

Create `Gemfile`:

```ruby
source "https://rubygems.org"

source "https://grft.dev/gems/4b4e411f-60a0-4868-b8a6-46f5dee07448__free" do
  gem "graft-nuget-lottery", "1.0.0"
end

gem "hypertube-ruby-sdk"
```

```bash
bundle install
```

## Step 5. Call the lottery method

Create `main.rb`:

```ruby
require "graft/nuget/lottery"

Graft::Nuget::Lottery::GraftConfig.host =
  "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"

tickets = Graft::Nuget::Lottery::Lottery.add_ticket("you@example.com")
puts "Challenge 3 complete — tickets in pool: #{tickets}"
```

Run it:

```bash
bundle exec ruby main.rb
```

`Lottery.add_ticket(...)` is a remote call but reads like a normal method invocation. Your IDE autocompletes it because the Graft is a real gem.

> No REST clients, no DTOs, no spec syncing — just `bundle install` and call.
