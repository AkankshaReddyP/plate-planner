# ADR-002: Firestore food catalog and private family records

**Status:** Accepted design for MVP; implementation is pending.

## Decision

Use **one Firestore project** with two distinct domains: shared read-mostly `foodCatalog/{foodId}` documents and private `families/{familyId}/...` documents. Food choices are loaded from the database and cached locally for an offline-first UI. Use a pure TypeScript calculator on the device rather than a separate application API for every portion change.

## Rationale

Food values can be updated centrally and include origin and preparation state. Family logs have a different privacy and authorization policy. Plans and actual consumption must never be merged into one ambiguous metric.

## Consequences

Application data is not validated just by TypeScript type declarations. Firestore Security Rules, runtime validation, and test fixtures are required before enabling writes. Historical meals save a nutrient snapshot with catalog version to prevent later food edits from rewriting the past. Client-calculated totals are user-generated data, not authoritative medical evidence.
