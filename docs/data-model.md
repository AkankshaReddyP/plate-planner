# Firestore data model — Plate Planner v1

**Status: proposal only.** Data is not in Firestore yet. Do not collect medical records before Firebase Authentication, rules and emulator tests (Issue #3).

## Two data domains, one Firestore database

```text
foodCatalog/{foodId}                     # shared read-only reference foods
users/{authUid}                          # private sign-up account, default user
families/{familyId}                      # private family namespace
  members/{authUid}
  profiles/{profileId}
  targets/{targetVersionId}
  mealPlans/{mealPlanId}
  mealLogs/{mealLogId}
  measurements/{measurementId}
```

### A. Reference food data

`foodCatalog/{foodId}` contains:

- Stable food `id`; English `name`; optional Telugu `nameTe`; `category` for meal-builder grouping
- `state` = raw/cooked/ready_to_eat; distinct preparations must not be treated interchangeably
- `servingUnit` = g; optional suggested portion size in grams
- `nutrientsPer100g` = caloriesKcal, proteinG, carbohydrateG, fibreG, fatG
- `sourceName`, optional `sourceReference`, `verified`, `version`, `isActive`
- `updatedAt`, `updatedBy`

Food catalog is **read from Firestore**, not bundled as the canonical source. Authorized signed-in family members can read active foods; only a trusted administrator/ingestion process can write or edit foods. A separate catalog editor is future work. Firestore persistent local cache will enable subsequent offline access; first-time offline use without cached data must show a clear message. Avoid pulling the entire collection repeatedly when it grows: use filtered indexed queries or paginated search.

Food quantities are **grams of edible portion** in a specified raw/cooked state. Source and verification matter; no provisional nutritional number is safe to present as medically authoritative. Catalog IDs are stable across revisions; version increments when nutritional values change.

### B. Private family and activity data

- `families/{familyId}`: display name, creator, created date
- `members/{authUid}`: admin/user role, membership status and provenance; role grants cannot be self-assigned by the client
- `profiles/{profileId}`: subject identification, timezone, optional health context, authorized account association
- `targets/{targetVersionId}`: effective dates, per-day/per-meal targets, source and review provenance; preserve older versions
- `mealPlans/{mealPlanId}`: date, meal type, selected foods, **planned** grams and nutrition totals, status, revisions
- `mealLogs/{mealLogId}`: food-by-food **actual** grams, consumed totals, source plan ID, author and correction history
- `measurements/{measurementId}`: optional weight or glucose observations, explicit units and times

Each planned item embeds a **food snapshot** from the reference collection (nutrients, source, reference version and food ID) to protect historical values if the food catalog changes. Each consumption log references the plan and its item identifiers and captures its own calculated totals. Stats must read actual, non-superseded consumption logs, not meal plans; unlogged meals are missing data, not zero intake.

All families' private records live under their own family document. Query by profile ID and bounded localDate range within that family; add composite indexes if Firebase requires them. Local date is defined in the profile's IANA timezone. Timestamps use Firestore Timestamp in the adapter; ISO strings at the TypeScript domain boundary.

### Identity and access

Exactly **two roles** exist: `admin` and `user`. Every newly authenticated account creates `users/{authUid}` with immutable `role: 'user'`; no client can assign `admin`. A trusted administrator must explicitly grant family membership under `families/{familyId}/members/{authUid}`. Family records remain inaccessible to newly signed-up users until that membership exists. Both active family roles can currently read permitted family records; admin can also read other member records. All client writes to family records and food catalog remain blocked until validated implementation.

No real personal health history belongs in this public GitHub repository. Prefer making the repository private before a health-data pilot. CSV/PDF exports for doctors require deliberate user action; don't provide doctor database logins in v1.

### Data integrity and offline

- App validates numeric inputs and source data at runtime; TypeScript interfaces alone do not validate Firestore documents.
- Pure local calculation uses per-100g values × (grams/100), retains precision, rounds only for presentation.
- Firestore offline writes may sync later and conflict. `revision` alone does not guarantee compare-and-swap; add explicit conflict handling for concurrent edits.
- Use client-created stable IDs for retry safety and immutable correction records for logs, rather than silently editing consumed history.
- Do not infer diagnosis, set individualized therapeutic targets, or call calculated totals clinically verified without clinician oversight.

### Responsibility by ticket

- **#2**: data contracts, domain split, architecture decision.
- **#3**: authentication, Firestore initialization, family membership rules and emulator tests.
- **#5**: vetted source catalog ingestion, Firestore querying and offline cache.
- **#8 / #9**: persistence of meal plans and true consumption logs.
- **#10**: summaries and exports.
