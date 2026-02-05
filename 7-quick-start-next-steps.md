---
title: "Next Steps"
order: 7
description: "See what to do next after completing the quick start and how to expand this setup into real-world projects using Graftcode across different architectures."
---

# What’s Next? Using Graftcode in the Real World

This quick start guide showed you how to use **Graftcode** without any accounts, commitments, or setup friction.
You can already build and consume grafts exactly like in this tutorial - completely **account-free**.

That’s intentional.

We want you to experience how Graftcode works **before** you decide to go any further.

---

## You can use Graftcode without an account

As you’ve seen in this guide:

- You can run **Graftcode Gateway (`gg`) locally**
- You can expose your .NET services as grafts
- You can install and consume grafts via **npm** and **NuGet**
- You don’t need to register, sign in, or provide any credentials

This is perfect for:
- learning Graftcode,
- local development,
- experiments and prototypes,
- trying it out with LLM-driven development.

If this is all you need — you’re good to go.

---

## Why create a (free) Graftcode account?

Once you start building real services, a free Graftcode account unlocks important capabilities:

- **Stable registry address**  
  Your grafts get a permanent registry URL, so clients can automatically refresh and update.

- **Visibility of your services**  
  See all your gateways and exposed services in one place.

- **Access control**  
  Decide who can download your grafts using authentication and permissions in package managers.

- **Project-level management**  
  Group gateways and services under a single project using a `Project Key`.

None of this is required to start — but it becomes essential for real-world usage.

---

## Create your free Graftcode account

To get started:

👉 **Create a free account at:**  
https://portal.graftcode.com

After signing up, create a project and copy its **Project Key**.

---

## Run your service with a Project Key

When starting your gateway, either via Docker or directly from command line, pass the Project Key:

```bash
gg --projectKey YOUR_PROJECT_KEY
```

What this gives you:

- your service appears in the **Gateways** view in the portal - https://gateways.graftcode.com/ 
- your registry and package sources stay **stable**,
- your grafts can be safely shared with teams or CI/CD pipelines.

This is the recommended setup for any long-lived service.

---

## Join the community

We’re building Graftcode in the open and shipping new features **every few days**.

👉 Join our **Discord** and tell us what you think:
- what worked well,
- what felt confusing,
- what you’d like to see next.

Your feedback directly shapes the product.

Stay tuned — a lot more is coming 🚀
