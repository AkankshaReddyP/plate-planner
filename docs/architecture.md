# Plate Planner — MVP architecture

Offline-first React + TypeScript PWA. Pure nutrition engine in src/nutrition (next ticket). Firebase Authentication and Firestore in a later ticket. Family-scoped access, versioned meal plans and actual consumption records, food-source provenance, and clinician exports are planned.

Security: Firestore rules currently deny all reads and writes. Do not add real health data until authorization tests pass. Demo nutritional values must not be treated as clinical guidance.

ADR-001: Avoid a separate Cloudflare API for the first small family pilot. Add privileged server endpoints only when there is a concrete requirement.