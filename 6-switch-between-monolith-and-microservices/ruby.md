---
title: "Ruby"
description: "Challenge 6 — run two Ruby classes as a monolith, then split one off as a microservice. Both topologies still call the central Lottery service."
---

## Goal

Build two Ruby classes — `Booth` (orchestrator) and `LotterySubmitter` (which calls the central **Lottery** service hosted by us). Run them as a monolith first. Then extract `LotterySubmitter` into a standalone microservice and switch between monolith and microservice with **one environment variable** — zero code changes from then on.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Ruby 3.2+](https://www.ruby-lang.org/) and [Bundler](https://bundler.io/) installed locally

## Step 1. How Graftcode works

Call remote methods like local functions. Install a package, import a method, call it directly.

With one command, Graftcode generates a strongly-typed client for your service.

![How Graftcode works](../assets/how-graftcode-works.png)

*- No REST clients. No DTOs. No glue code. Just logic. -*

## Step 2. What you will build

In this challenge, you'll run Booth and LotterySubmitter as a monolith, then split one into a microservice with one config change.

![What you will build](../assets/what-you-will-build-placeholder.png)

*- Import methods and call them directly. No REST, no DTOs, no boilerplate. -*

## Step 3. Create the project

```bash
mkdir ruby-lottery-platform
cd ruby-lottery-platform
```

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

## Step 4. Write the two classes

Create `lib/lottery_submitter.rb`:

```ruby
require "graft/nuget/lottery"

module LotteryPlatform
  class LotterySubmitter
    Graft::Nuget::Lottery::GraftConfig.host =
      "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"

    def self.submit(email)
      Graft::Nuget::Lottery::Lottery.add_ticket(email)
    end
  end
end
```

Create `lib/booth.rb`:

```ruby
require_relative "lottery_submitter"

module LotteryPlatform
  class Booth
    def self.check_in(email)
      tickets = LotterySubmitter.submit(email)
      "Welcome #{email}! Total tickets in pool: #{tickets}"
    end
  end
end
```

`Booth.check_in` calls `LotterySubmitter.submit` directly. `LotterySubmitter` calls the central `Lottery.add_ticket` over WebSocket.

## Step 5. Host as a monolith

Create `Dockerfile`:

```dockerfile
FROM ruby:3.3
WORKDIR /usr/app
COPY . /usr/app/

RUN bundle install

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 80
EXPOSE 81

CMD ["gg", "--modules", "/usr/app/lib", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t lottery-platform-ruby:test .
docker run -d -p 80:80 -p 81:81 --name lottery_platform lottery-platform-ruby:test
```

Open [http://localhost:81/GV](http://localhost:81/GV) and call `Booth.check_in("you@example.com")`. Both classes run inside one container; the central Lottery is reached over the network.

## Step 6. Run LotterySubmitter as a standalone service

Create `Dockerfile.submitter`:

```dockerfile
FROM ruby:3.3
WORKDIR /usr/app
COPY . /usr/app/

RUN bundle install

RUN apt-get update && apt-get install -y wget \
 && wget -O /usr/app/gg.deb https://github.com/grft-dev/graftcode-gateway/releases/latest/download/gg_linux_amd64.deb \
 && dpkg -i /usr/app/gg.deb && rm /usr/app/gg.deb \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 90
EXPOSE 91

CMD ["gg", "--modules", "/usr/app/lib/lottery_submitter.rb", "--httpPort", "91", "--port", "90", "--TCPServer", "--tcpPort=9092", "--projectKey", "YOUR_PROJECT_KEY"]
```

```bash
docker build --no-cache --pull -f Dockerfile.submitter -t lottery-submitter-ruby:test .
docker network create graftcode_demo
docker run -d --network graftcode_demo -p 90:90 -p 91:91 -p 9092:9092 --name lottery_submitter lottery-submitter-ruby:test
```

Open [http://localhost:91/GV](http://localhost:91/GV) — `LotterySubmitter` is now its own service that still talks to the central Lottery internally.

## Step 7. Connect Booth through a Graft

From [http://localhost:91/GV](http://localhost:91/GV), copy the gem coordinates and update `Gemfile`:

```ruby
source "https://grft.dev/gems/YOUR_KEY__free" do
  gem "graft-rubygems-lotterysubmitter", "1.0.0"
end
```

```bash
bundle install
```

Update `lib/booth.rb` — the **only code change** in the entire tutorial:

```ruby
require "graft/rubygems/lotterysubmitter"

module LotteryPlatform
  class Booth
    Graft::Rubygems::Lotterysubmitter::GraftConfig.set_config(ENV["GRAFT_CONFIG"])

    def self.check_in(email)
      tickets = Graft::Rubygems::Lotterysubmitter::LotterySubmitter.submit(email)
      "Welcome #{email}! Total tickets in pool: #{tickets}"
    end
  end
end
```

From now on, topology is controlled by `GRAFT_CONFIG`.

## Step 8. Run as a microservice

```bash
docker stop lottery_platform && docker rm lottery_platform
docker build --no-cache --pull -t lottery-platform-ruby:test .
docker run -d --network graftcode_demo \
  -e GRAFT_CONFIG="name=graft.rubygems.lotterysubmitter;host=lottery_submitter:9092;runtime=ruby;modules=/usr/app/lib" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-ruby:test
```

Call `Booth.check_in` in Vision — same result. The chain is now Booth (container A) → LotterySubmitter (container B) → central Lottery.

## Step 9. Switch back to monolith

```bash
docker stop lottery_platform && docker rm lottery_platform
docker run -d \
  -e GRAFT_CONFIG="name=graft.rubygems.lotterysubmitter;host=inMemory;runtime=ruby;modules=/usr/app/lib" \
  -p 80:80 -p 81:81 --name lottery_platform lottery-platform-ruby:test
```

```text
# Monolith:    host=inMemory                  (LotterySubmitter in Booth's process)
# Microservice: host=lottery_submitter:9092   (LotterySubmitter is remote)
```

Same image, same code — just one env var. The central Lottery is always remote either way.

> Splitting `LotterySubmitter` out of the monolith is no longer a rewrite — it's one import change followed by a configuration switch.
