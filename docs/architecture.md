# Plate Planner — MVP architecture

## Runtime
React + TypeScript + Vite mobile-first PWA. Firebase Hosting serves the built static UI. Firebase Authentication and Firestore will be added in later tickets; no separate custom API in the family MVP. A pure TypeScript nutrition engine calculates selected food quantities locally for responsive and offline interaction.

## Firestore domains
1. **Reference foods:** `foodCatalog/{foodId}` is the canonical database-backed catalog (source, state, version, nutrients per 100g). Only trusted editors modify it; app queries and caches it.
2. **Private family activity:** `families/{familyId}` contains members, profiles, target versions, planned meals, actual consumption logs, and optional measurements. Access is family-scoped, with authenticated roles and explicit least-privilege rules.

Details: [Firestore data model](data-model.md) and [ADR-002](decisions/ADR-002-client-calculations-and-history.md).

## Versioning and reporting
Planned meals are not consumed meals. Meals embed snapshots of food nutrients/source/version, and logs capture actual grams and totals; revisions and clinician-provided target versions remain traceable. Summaries should count consumed logs only, with missing-data coverage.

## Security and rollout
Current Firestore rules deny all reads and writes. #3 must configure and test Firebase Authentication and rules before real family data is recorded; #5 adds vetted reference catalog ingestion and loading. Do not put personal medical records in GitHub or CI; repository is currently public and should be private before any sensitive pilot.

ADR-001: No separate Cloudflare API for this pilot; add privileged backend workflows only where concrete permissions or validation needs demand them.
