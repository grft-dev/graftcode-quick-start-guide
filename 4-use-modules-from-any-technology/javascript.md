---
title: "JavaScript"
description: "Use a module from another language in a JavaScript service through Graftcode so cross-language code feels like a normal dependency."
---

## Goal

Use a public module from another language in a JavaScript service with Graftcode, without wrapping it in REST or rewriting it in Node.js.

### What You'll See

- Choose a real Python module published on PyPI to use in your JavaScript project.
- Install the Python module as a typed Graft dependency in JavaScript using Graftcode.
- Import and call the module directly from your JavaScript code, just like any other dependency.

## Step 1. Pick a module from a supported repository

Visit the Python package page for the module we will use in this example: [sdncenter-currency-converter](https://pypi.org/project/sdncenter-currency-converter/).

This one happens to come from PyPI, but the same approach works with modules from supported repositories like `npm`, `PyPI`, or `NuGet`.



## Step 2. Install the module through Graftcode

Use this install command:

```bash
npm add package -s https://grft.dev graft.pypi.sdncenter-currency-converter
```

> That is the key idea: Instead of building a REST wrapper, Graftcode lets you use a package from any supported language as if it were a local dependency in your JavaScript code - or any other language Graftcode supports. You can import and call it just like a native module, no matter which language it was originally written in.

## Step 3. Configure the module

Next, let's add configuration for Python Currency Converter module. As you can see, we're telling to use this Python module inMemory, so in the same process.

```javascript
import { GraftConfig } from "graft.pypi.sdncenter-currency-converter";

const config =
  process.env.GRAFT_CONFIG ??
  "name=graft.pypi.sdncenter_currency_converter;host=inMemory;modules=currency_converter;runtime=python";

GraftConfig.setConfig(config);
```


## Step 4. Call it from your own code

Now create a small stateless utility that uses the Python module:

```javascript
import {
  GraftConfig,
  SimpleCurrencyConverter,
} from "graft.pypi.sdncenter-currency-converter";

const config =
  process.env.GRAFT_CONFIG ??
  "name=graft.pypi.sdncenter_currency_converter;host=inMemory;modules=currency_converter;runtime=python";

GraftConfig.setConfig(config);

class CurrencyService {
  static async convertUsdToEur(amount) {
    return await SimpleCurrencyConverter.convert(amount, "USD", "EUR");
  }
}

module.exports = { CurrencyService };
```

## Step 5. What just happened

`SimpleCurrencyConverter.convert(...)` comes from the Python package, but in JavaScript it looks like a regular method call on a normal dependency.

The important shift is architectural:

- without Graftcode, you would usually need a separate service, REST wrapper, or custom interop layer
- with Graftcode, you install the module and call it through a typed dependency

You can keep writing JavaScript while reusing the best module for the job, regardless of whether it comes from Python, .NET, Java, or another runtime.

> This is where Graftcode becomes especially valuable: technology choice stops being an integration constraint. You can keep writing JavaScript and still use the best libraries from other ecosystems directly.
