# Firebase Hosting deployment

Project ID: `plate-planner-2bc28`

This React/Vite site uses static **Firebase Hosting** (not App Hosting). Its built output is `dist/`. A project ID is not a password; never commit private keys.

## First manual deployment

1. Install Node.js 22+ and Firebase CLI (`npm install -g firebase-tools`).
2. Clone the repository and enter the `plate-planner` directory.
3. Run `npm ci` then `npm run build`.
4. Run `firebase login`, then `firebase projects:list` to confirm you can see `plate-planner-2bc28`.
5. In Firebase Console, open Build → Hosting → Get started if Hosting hasn't been activated.
6. Run `firebase deploy --only hosting --project plate-planner-2bc28`.

Expected URL after success: https://plate-planner-2bc28.web.app

For this manual deploy, the repository includes `firebase.json` and no `.firebaserc` is required because the project is specified on the command line. Do not run `firebase init` unless the CLI reports missing setup.

## Later: CI/CD

Configure GitHub deployment separately after the first successful manual deployment. Never paste service account secrets into chat or GitHub source files.

## Safety

The current demo does not collect or save personal health information. Firebase login, Firestore rules, and real food data will be added in later tickets.