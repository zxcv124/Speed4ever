# Speed4Ever Deployment

## Runtime

The frontend is deployed on Vercel and uses Vercel Functions under `/api` for auction bidding and finalization. Firebase remains the database, authentication provider, and storage provider.

Firebase Cloud Functions are not required for the production app path.

## Vercel Environment Variables

Set these in the Vercel project:

```text
FIREBASE_PROJECT_ID=speed-4-ever
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64 encoded Firebase service account JSON>
```

`FIREBASE_PROJECT_ID` is already safe to store as a normal project identifier. `FIREBASE_SERVICE_ACCOUNT_BASE64` must be treated as a secret.

To create `FIREBASE_SERVICE_ACCOUNT_BASE64` from a downloaded Firebase service account JSON file:

```sh
base64 -i service-account.json | tr -d '\n'
```

Then add it to Vercel:

```sh
vercel env add FIREBASE_SERVICE_ACCOUNT_BASE64 production
```

Redeploy production after changing environment variables:

```sh
vercel deploy --prod
```

## SendGrid

SendGrid is no longer required by the production app path. A previously committed SendGrid key was removed from the current source tree. Because it existed in Git history, it must remain revoked in Twilio SendGrid.

## Firebase Rules

The checked-in Firestore and Storage rules are hardened, but they still need to be deployed from a machine with Firebase CLI access:

```sh
firebase deploy --only firestore:rules,storage
```

## Verification

Run the full local verification suite before deployment:

```sh
npm run test:all
CI=true npm run build
```
