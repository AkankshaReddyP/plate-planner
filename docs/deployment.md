# Firebase Hosting deployment

Project ID: `plate-planner-2bc28`. Live URL: https://plate-planner-2bc28.web.app

## GitHub Actions: production web app build + manually triggered deployment

The repository includes `.github/workflows/deploy-hosting.yml`, a workflow available in **Actions → Deploy Plate Planner to Firebase Hosting → Run workflow**. It builds React with the Firebase **public Web SDK config** provided by the project owner. Only Hosting assets are deployed; Firestore security rules are **not** deployed by this workflow.

The four `VITE_FIREBASE_*` values in the build are **public client config**, not private admin credentials. Any production bundle would contain these values. **Do not** commit private service-account keys, access tokens, medical data, or privileged credentials.

### One-time deploy authorization (performed by Firebase project owner)

Preferred: run `firebase init hosting:github` in the cloned repo and authorize repository `AkankshaReddyP/plate-planner`. Firebase CLI creates a dedicated deployment service account and uploads an encrypted GitHub Actions secret. See https://firebase.google.com/docs/hosting/github-integration . **Do not blindly commit its generated workflow files:** this repo already has `deploy-hosting.yml`; review any generated workflows and avoid duplicate automatic deploys. The workflow in this repo expects the secret to be named:

```
FIREBASE_SERVICE_ACCOUNT_PLATE_PLANNER_2BC28
```

If the CLI uses a different secret name, set the name in the workflow accordingly. The secret value must be the **entire JSON key** for the dedicated Hosting deployment service account, supplied through **GitHub Settings → Secrets and variables → Actions → New repository secret**, not in this document or the chat. Avoid overly broad project roles and remove unused service-account keys.

### Deploy

1. Verify **Authentication → Settings → Authorized domains** includes `plate-planner-2bc28.web.app` (and `plate-planner-2bc28.firebaseapp.com` if using that domain).
2. Ensure GitHub Actions secret is present.
3. Go to https://github.com/AkankshaReddyP/plate-planner/actions/workflows/deploy-hosting.yml and choose **Run workflow** on `main`.
4. Confirm npm lint, typecheck, Vitest, Vite build and Firebase deploy succeed.
5. Open https://plate-planner-2bc28.web.app on a browser, hard-refresh, and test **Sign in with Google** and **Sign out**.
6. Authentication alone does not create family membership or permit Firestore writes.

### Firestore security rules

The separate `firestore.rules` file is read-restricted and write-denied. Run its emulator tests in CI and deploy only after review with:

```powershell
firebase deploy --only firestore:rules --project plate-planner-2bc28
```

Do not enter real family health records until permissions and family bootstrap are explicitly validated.

## Manual fallback

From a computer with Firebase CLI access and `.env.local` containing the four Vite config keys:

```powershell
git pull origin main
npm ci
npm run build
firebase deploy --only hosting --project plate-planner-2bc28
```

Make sure the build includes the Firebase configuration. A stale `dist/` will not acquire it automatically.

## Security

The repository is presently public. Keep real health data out of the repository and CI. Web SDK API keys are public identifiers; Firestore Security Rules and IAM are the true authorization boundary.
