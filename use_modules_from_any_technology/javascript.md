---
title: "JavaScript"
description: "Use a module from another language in a JavaScript service through Graftcode so cross-language code feels like a normal dependency."
---

## Goal

Use a module from another language in a JavaScript service with Graftcode, without wrapping it in REST or rewriting it in Node.js.

### What You'll See

- Install a typed Graft for a module from another ecosystem.
- Configure it in your JavaScript service.
- Call it from your own business logic like a normal dependency.

## Step 1. Install the generated package

Open the target module in Graftcode Vision and copy the generated `npm` command for JavaScript.

For example, if you want to use a Python-based currency converter, the package manager command comes from the portal, not from handwritten integration code.

That is the key idea: Graftcode turns a package from another runtime into a JavaScript dependency you can import and call directly.

## Step 2. Configure the module

Use the configuration string provided for that Graft. In the original quick start, the module is configured for in-memory execution so it runs as part of the same service:

```javascript
const config = process.env.GRAFT_CONFIG ??
  "licenseKey=YOUR_LICENSE_KEY\nname=your_python_module;host=inMemory;modules=your_module;runtime=python";
```

Use the exact module name and configuration generated for your package.

## Step 3. Call it from your own logic

Your service code keeps its own business logic and uses the external module only where it adds value, for example converting the final result to another currency before returning it.

The important shift is architectural:

- without Graftcode, you would usually need a separate service, REST wrapper, or custom interop layer
- with Graftcode, you install the module and call it through a typed dependency

## Step 4. Keep your service API stable

You can extend your JavaScript service with cross-language modules without rewriting the rest of the application.

That means you can keep your current service contract while reusing the best module for the job, regardless of whether it comes from Python, .NET, Java, or another runtime.

> This is where Graftcode becomes especially valuable: technology choice stops being an integration constraint. You can keep writing JavaScript and still use the best libraries from other ecosystems directly.
