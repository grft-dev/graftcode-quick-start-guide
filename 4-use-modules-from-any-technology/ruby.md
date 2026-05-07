---
title: "Ruby"
description: "Challenge 4 — embed the Python edition of the Lottery module directly in your Ruby app. No REST wrapper, no rewrite — runs in-process."
---

## Goal

We publish the **Lottery** logic in multiple languages so you can either call it remotely (Tutorials 1–3) or embed it directly in your process. Here you'll use the Python edition of Lottery from a Ruby app — same `Lottery.add_ticket(email)` API, but executed in-memory inside your Ruby process.

### Prerequisites

- [Ruby 3.2+](https://www.ruby-lang.org/) and [Bundler](https://bundler.io/) installed locally
- [Python](https://www.python.org/downloads/) installed locally

## Step 1. Create a project folder

```bash
mkdir ruby-lottery-demo
cd ruby-lottery-demo
```

Create `Gemfile`:

```ruby
source "https://rubygems.org"

source "https://grft.dev/gems" do
  gem "graft-pypi-lottery", "1.0.0"
end

gem "hypertube-ruby-sdk"
```

## Step 2. Install the cross-language Graft

The Lottery module ships as a Python package. Graftcode lets you consume it as a Ruby gem:

```bash
bundle install
python -m pip install lottery --target ./modules
```

`pip install --target ./modules` puts the actual Python module next to your project so Graftcode can run it in-process.

## Step 3. Set the SDK key

```powershell
$env:HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

```bash
export HYPERTUBE_KEY="Fe2w-p2GK-Mn26-j8ZY-Xe25"
```

## Step 4. Run Lottery in-process

Create `main.rb`:

```ruby
require "graft/pypi/lottery"

Graft::Pypi::Lottery::GraftConfig.host = "inMemory"

tickets = Graft::Pypi::Lottery::Lottery.add_ticket("you@example.com")
puts "Challenge 4 complete — local tickets: #{tickets}"
```

Run it:

```bash
bundle exec ruby main.rb
```

`Lottery.add_ticket(...)` comes from a Python package, but reads like a normal Ruby call. `GraftConfig.host = "inMemory"` tells Graftcode to load and execute the Python Lottery module inside your Ruby process — your tickets are tracked locally, not in the central pool.

> Technology choice stops being an integration constraint — same Lottery API, embedded in your process from a Python package.
