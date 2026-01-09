---
title: "Migrate Your Existing Project"
order: 8
description: "Transform your existing application to use Graftcode without a complete rewrite, preserving your current investment while gaining new capabilities, simplify maintenance, enable AI based enhancements and increase performance."
---

# Migrate Your Existing Project

## Goal

Transform your existing application to use Graftcode without a complete rewrite, preserving your current investment while gaining new capabilities, simplify maintenance, enable AI based enhancements and increase performance - lowering cloud cost and CO2 emissions.

## What you'll see

- Gradual migration path with minimal risk
- Existing code continues to work during transition
- Immediate benefits without full migration

## Demo Steps

1. **Assessment and Planning**
   - Analyze your current architecture
   - Identify integration pain points
   - Plan migration priorities

2. **Incremental Adoption**
   - Start with new features using Graftcode
   - Gradually wrap existing services
   - Maintain backward compatibility

## Migration Strategies

### Strategy 1: New Features First

- Build new functionality with Graftcode
- Leave existing code untouched
- Gradually expand Graftcode usage

### Strategy 2: Service Co-Hosting

- Replace middleware for existing web service applications to Graftcode Gateway
- Keep using REST/SOAP endpoints for backward compatibility
- Get ability to retrieve Grafts for this service
- Add Grafts on client side and start with switching one REST method to direct call on Graft
- Gradually replace all calls with direct Graft calls
- Remove legacy client code
- Remove legacy service API code and replace it with simple pure facade classes or expose business logic directly

Detailed migration guide is coming soon!
