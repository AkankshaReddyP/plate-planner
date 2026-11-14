# Firebase Auth + Firestore setup for Plate Planner (Issue #3)

**Project ID:** `plate-planner-2bc28`

## One-time setup in Firebase Console

1. Open https://console.firebase.google.com/project/plate-planner-2bc28/overview .
2. Under **Build → Authentication → Get started → Sign-in method**, enable **Google** and select a project support email. Avoid anonymous sign-in.
3. Under **Project settings → General → Your apps**, register a **Web** app (</> icon). Its nickname can be `Plate Planner Web`. The Firebase SDK config gives you `apiKey`, `authDomain`, `projectId`, `appId`. Firebase web API key is a client identifier, **not** a service-account secret; Firestore rules enforce access.
4. Under **Authentication → Settings → Authorized domains**, verify your Firebase Hosting domain `plate-planner-2bc28.web.app` is allowed for Google sign-in. Do not add untrusted domains.
5. Under **Build → Firestore Database**, create the database in **production mode**, choosing a region deliberately. Pick close to the family and consider that location cannot simply be changed later. Do not use test mode.
6. Install the Firebase CLI. After tests pass, publish the reviewed rules from this repository with `firebase deploy --only firestore:rules --project plate-planner-2bc28`. **Do not deploy rules before running emulator tests and reviewing access policy.**

## Local app configuration

Copy `.env.example` to `.env.local` and populate the four `VITE_FIREBASE_...` entries from your Web app config. Run `npm run dev` to show the Google sign-in control. This file is ignored by Git. Never put a Firebase Admin SDK private key in `.env.local` or any `VITE_` field.

For production `npm run build`, the same four Vite environment variables must be set on the *machine building the site*. Running `firebase deploy` on an old `dist` folder won't inject them.

## Family membership: deliberate bootstrap (no self-invites)

The client **cannot create families or grant roles**. After the admin's Firebase Authentication user exists, a trusted project administrator must provision a family document and `families/{familyId}/members/{uid}` with `status: 'active', role: 'admin'` using Firebase Console or a deliberately reviewed Admin SDK script. Member IDs **must equal Firebase Auth UIDs**. Admin can view other membership records, but role changes and new users still require trusted provisioning. This prevents a user from promoting themselves.

No family medical data should be entered until rules are deployed and tested against the live project with test accounts. Do not place UIDs, private health information, or personal identifiers in the public GitHub repository.

## Registration and two roles

Every newly signed-in Google account gets a private `users/{authUid}` account record with **role `user` by default**. Its creation is restricted to its authenticated owner and an exact limited document shape; users cannot write `admin` or change their own role later. Admin promotion requires a trusted Firebase administrator using Console/Admin SDK, not client-side code.

**Sign-in is not family membership.** No one obtains access to family health data just by registering. A trusted administrator must separately add `families/{familyId}/members/{uid}` with `status: 'active'` and role `user` or `admin`. Only two roles are valid; `admin` can inspect membership and will eventually manage catalog/users via explicitly authorized administrative workflows, while `user` will eventually plan meals and record consumption.

## Current permissions (v1 conservative)

- Active authenticated members: read their own family metadata, member (own; admins may see other members), profiles, targets, plans, logs and measurements.
- Signed-in users: read **active** reference foods only.
- Everyone using the client SDK: **cannot write any family record or catalog item yet**. Role-specific writes will be added in #8/#9 with validation and tests. Administrator via Firebase Console/Admin SDK bypasses rules: protect its credentials with Google Cloud IAM.
- Unauthorized users: no access to private family paths. No cross-family sharing.
- Do not interpret authenticated login alone as authorization to a family.

## Local rules tests

Firebase's rules testing SDK must be run against the local Firestore emulator, not production. Use:

```powershell
npm install --no-save --package-lock=false @firebase/rules-unit-testing@6.0.0
firebase emulators:exec --only firestore --project demo-plate-planner "node --test tests/firestore.rules.test.mjs"
```

Java 21 or later may be needed depending on the installed Firestore emulator. Firebase CLI downloads the emulator on first use. Do not seed real medical records in tests.

The web UI currently only shows the sign-in status; catalog loading and persistence are future issues.

## Required onboarding (after sign-in)

The user experience is locked until the signed-in account completes a private onboarding record at `users/{uid}/private/onboarding`. It captures height in centimeters, weight in kilograms and a response about health conditions (including `None` and `Prefer not to share`). The profile uses server timestamps and the latest saved record is checked on every sign-in, not only the first registration. If incomplete, unavailable or not accessible, the dashboard and meal workflows remain hidden until completion is saved successfully.

Only the signed-in user can read or create/update their own onboarding document; other accounts (including app admins) cannot access it through the web SDK. Firestore rules validate allowed keys, numeric ranges, condition choices and server timestamp and prohibit deletion. App-managed family records remain separate. Do not put medical details into publicly visible account documents or the repository. This onboarding asks for self-reported context, not a clinical assessment.

The app will show an error/retry state if Firestore cannot be reached. Onboarding does not use local-only completion flags that could bypass the requirement.

## Firestore food catalog and South Indian seed

The signed-in app now reads active `foodCatalog` documents from Firestore with a live query filtered by `isActive == true`. It no longer supplies the former hardcoded 10-food array in production. Unauthenticated access and client catalog modifications remain forbidden by `firestore.rules`.

The manual GitHub Hosting deployment workflow creates absent reference-food documents using the trusted service account **after Firestore rules tests and deployment**, and before publishing Hosting. This is idempotent: existing documents are never overwritten. It seeds 10 legacy **illustrative** numeric foods and South Indian names such as idli, dosa, sambar, rasam, upma, pongal, pappu and poriyal. To publish the catalog and UI, run `.github/workflows/deploy-hosting.yml` on `main` using the configured service-account secret.

South Indian recipe records intentionally have `nutritionStatus: 'pending'` and **no nutrient totals**. They're discoverable in the Foods library but cannot be added to the nutrition-optimizing meal builder until a review provides food-specific **per-100g edible-portion** calories, protein, carbs, fat, fibre and a named primary recipe/source. Recipe variants, water and oil alter values; false precision could mislead users managing medical conditions. A record is usable after a trusted administrator adds validated numeric `values` and changes `nutritionStatus` to `verified` (or explicitly `sample` for non-clinical illustrative entries). Do not allow client-side upgrades of this status.

Every catalog document includes a primary browsing `category`, which is not a claim that the dish only contains that macronutrient. Mixed dishes span several nutrient groups. Count-based serving conversions likewise require a reviewed edible gram equivalence; the initial boiled egg uses 50 g per egg only as a clearly approximate sample value.

## Research-backed South Indian recipe batch (2024 laboratory data)

The seed now includes **12 specific cooked recipe variants** transcribed from Table 4 of Anitha et al., *Frontiers in Sustainable Food Systems* (2024), DOI https://doi.org/10.3389/fsufs.2024.1331260 . These include white-rice idli, plain dosa, bisi bele bath, pongal, puttu, and selected millet variants. Every record stores `nutritionSource` with article, variant, cooked 100 g basis and fibre method. Values are *research recipe-specific*, not typical for every home/restaurant preparation, so `nutritionStatus` is set to `sample` rather than `verified`.

**Fibre caution:** the paper's Table 4 reports **crude fibre** (an older analytical method), not modern *total dietary fibre*. The five-nutrient dashboard retains a comparison of sample values but must not claim those crude-fibre numbers are a medically validated dietary-fibre requirement or accurate all-food total. An app-wide standardization to total dietary fibre should happen before use for health recommendations. Energy and other macronutrients are likewise for the particular cooked recipes, which may differ sharply from other recipes, water content, and oil amounts.

The privileged seed first creates missing reference records, then transactionally updates **only active, pending** records without pre-existing nutrient values. Any already reviewed, changed, inactive or otherwise non-pending record is left as-is. The seed is safe to rerun. No user medical data is involved. These changes are not live until manually running the deployment workflow on `main` using the configured service account.

Before expanding to dishes without direct laboratory values, use a properly licensed cooked-recipe database or calculate from a documented ingredient recipe, cooking yields and validated ingredient composition; label such values as *estimates* and retain provenance. ICMR-NIN IFCT 2017 largely covers raw ingredients, not the prepared dishes; do not copy its tables into a product without reviewing rights and attribution.
