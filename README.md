# Graftcode Quick Start Guide

This repository contains the documentation and quick start guide for Graftcode - a platform that allows you to connect frontends, mobile apps, and backend services seamlessly, removing the overhead of APIs, SDK generation, and client maintenance.

## Overview

Graftcode enables developers to:
- **Write** any public methods
- **Install** auto-generated, strongly-typed client using regular package manager command
- **Call** remote methods like local dependency

Behind the scenes, communication is handled through the **Hypertube™ protocol** which uses native-level runtime integration and binary messages, processing calls 5x to 10× faster than WebService or gRPC and requiring 30–60% less code.

## Documentation Structure

This guide is organized into the following sections:

1. **Graftcode Introduction** - Overview of Graftcode and its benefits
2. **Add Your First Graft - Frontend to Backend** - Connect a React app to a .NET backend
3. **Expose Methods as Services** - Turn your code into a discoverable backend service
4. **Connect Backend Services** - Connect backend services using Graftcode
5. **Mix Modules Across Languages** - Use modules from different programming languages
6. **Switch Between Monolith and Microservices** - Change architecture with just configuration
7. **Compare Performance** - Understand Graftcode's performance benefits
8. **Migrate Your Existing Project** - Transform existing applications to use Graftcode

## Setup

This documentation is managed with Tina CMS. To edit content:

1. Ensure you have the required environment variables configured:
   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `GITHUB_BRANCH`

2. The documentation files are Markdown files with frontmatter containing:
   - `title`: Document title
   - `order`: Display order
   - `description`: Document description

3. Content is managed through Tina CMS interface, which syncs changes to this GitHub repository.

## File Structure

- `*.md` - Documentation files (numbered 1-8)
- `tina.config.ts` - Tina CMS configuration
- `pmf-demo-data.ts` - Demo data for PMF sections

## Contributing

Documentation updates are managed through Tina CMS. Changes made through the CMS interface will be automatically synced to this repository.
