---
title: "Ruby"
description: "Challenge 2 — expose your own Ruby booth service that internally calls the central Lottery service. Compose remote services like local code."
---

## Goal

Build your own Ruby backend service that **internally calls the central Lottery service** (built and hosted by us) to add tickets, then expose your service through Graftcode Gateway. Same `gg` workflow on both sides — you're a Graft consumer **and** a Graftcode producer at once.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Ruby 3.2+](https://www.ruby-lang.org/) and [Bundler](https://bundler.io/) installed locally

## Step 1. Create a project folder

```bash
mkdir ruby-booth-service
cd ruby-booth-service
```

Create `Gemfile`:

```ruby
source "https://rubygems.org"

source "https://grft.dev/gems/4b4e411f-60a0-4868-b8a6-46f5dee07448__free" do
  gem "graft-nuget-lottery", "1.0.0"
end

gem "hypertube-ruby-sdk"
```

## Step 2. Install the Lottery Graft

The central Lottery service is implemented and hosted by us. Bundler pulls it in like any other gem:

```bash
bundle install
```

## Step 3. Write the booth class

Create `booth.rb`:

```ruby
require "graft/nuget/lottery"

module Booth
  Graft::Nuget::Lottery::GraftConfig.host =
    "wss://gc-d-ca-polc-demo-ecbe-01.blackgrass-d2c29aae.polandcentral.azurecontainerapps.io/ws"

  class Booth
    def self.check_in(email)
      tickets = Graft::Nuget::Lottery::Lottery.add_ticket(email)
      "Welcome #{email}! Total tickets in pool: #{tickets}"
    end
  end
end
```

`Booth::Booth.check_in(email)` is your method. Inside, it calls the remote `Lottery.add_ticket(email)` like a normal Ruby call — no REST client, no DTOs.

## Step 4. Host with Graftcode Gateway

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

CMD ["gg", "--modules", "/usr/app/booth.rb", "--projectKey", "YOUR_PROJECT_KEY"]
```

Build and run:

```bash
docker build --no-cache --pull -t booth-service-ruby:test .
docker run -d -p 80:80 -p 81:81 --name booth_demo_ruby booth-service-ruby:test
```

Inside the container, `gg` exposes `Booth::Booth.check_in`. Your code reaches across the network to the central Lottery for every call.

## Step 5. Try it in Graftcode Vision

Open [http://localhost:81/GV](http://localhost:81/GV). You'll see `Booth.check_in` — hit **Try it out**, pass your email, and the response shows your total ticket count from the central Lottery.

> Your booth is both a producer (its `Booth.check_in` is callable) and a consumer (it calls remote `Lottery.add_ticket`). Same `gg` workflow on both sides — no REST, no DTOs, no client code.
