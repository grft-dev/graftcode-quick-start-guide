---
title: "JavaScript"
description: "Switch a JavaScript service between in-process and remote execution with Graftcode by changing configuration instead of rewriting integration code."
---

## Goal

Run the same dependency either inside your JavaScript service or as a separate microservice, and switch between those two modes with configuration only.

### What You'll See

- Start with a module running in-process.
- Move that same module to a separate service.
- Change only configuration to switch from monolith to microservices.

## Step 1. Start with the in-process setup

In the previous scenario, the external module runs with an in-memory configuration.

That means your JavaScript service and the extra runtime live together, but your code still calls the module through the same Graft interface.

## Step 2. Host that module as a separate service

Move the module behind its own Graftcode Gateway instance and run it in another container or on another host.

Once it is running, Graftcode Vision gives you the host details and lets you verify that the module is available remotely.

## Step 3. Switch the configuration

Instead of using an in-memory host:

```text
host=inMemory
```

point the same Graft at the remote service:

```text
host=your-remote-service:PORT
```

Everything else in your JavaScript business logic stays the same.

## Step 4. Run the same code again

After restarting your service with the new configuration, call the same method you used before.

The call now goes over the network to a separate service, but your application code does not need a new client, new DTOs, or new REST wiring.

## Why This Matters

With Graftcode, moving between monolith and microservices is no longer a rewrite.

You keep:

- the same JavaScript code
- the same method calls
- the same dependency shape

You change only where the module runs.

> This is one of the biggest practical benefits of Graftcode: architecture can change later without forcing you to rebuild the integration layer each time.
