# Plate Planner — Developer setup

A family-first nutrition planning prototype. The initial screen uses demo quantities and is **not medical advice**.

## Getting started

Requires Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Check code quality:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Firebase integration is not active yet. `.env.example` documents future Firebase configuration; keep actual `.env` files untracked.

## Architecture
See [docs/architecture.md](docs/architecture.md). GitHub Issue #1 tracks initial setup and Issue #2 covers detailed data contracts.

## Security
Never commit real family/patient health records, credentials or service-account keys. Firestore rules default to deny all until properly tested.
