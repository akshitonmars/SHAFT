# Supabase connector setup

SHAFT's Supabase connector uses Supabase's Management API OAuth flow. OAuth credentials and user tokens stay server-side; the browser only receives project metadata.

## Required Vercel environment variables

Set these for **Production** (and Preview if you test previews):

- `APP_URL=https://buildatshaft.vercel.app`
- `SUPABASE_CLIENT_ID`
- `SUPABASE_CLIENT_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

The existing `VERCEL_CLIENT_ID` and `VERCEL_CLIENT_SECRET` are not used by this Supabase connector.

### Firebase Admin service account

In Firebase Console for project `shaft-d426a`, open **Project settings → Service accounts**, generate a private key for the Firebase Admin SDK, and put the full downloaded JSON contents into the Vercel environment variable `FIREBASE_SERVICE_ACCOUNT_JSON`. Keep it only in Vercel; never commit it or paste it into chat. Redeploy after changing environment variables.

## Supabase OAuth app

Register this exact callback URL in the Supabase OAuth app:

`https://buildatshaft.vercel.app/api/connectors/supabase/callback`

Grant only the read scopes required to list organizations/projects (Organizations: Read and Projects: Read). Do not grant write scopes for the initial connector. The redirect URI must match exactly.

## What is implemented

- `POST /api/connectors/supabase/connect`: verifies the signed-in Firebase user and starts OAuth.
- `GET /api/connectors/supabase/callback`: validates signed state, exchanges the authorization code, and stores tokens in server-only Firestore.
- `GET /api/connectors/supabase/projects`: refreshes an expired token when possible and returns only project metadata.
- `POST /api/connectors/supabase/disconnect`: removes the stored connection.
- The workspace Settings view provides Connect/Disconnect and lists projects.

OAuth tokens are stored in `shaftConnectorSecrets` using the Firebase Admin SDK. Firestore client rules explicitly deny access to that collection.

## Deploy

Merge the connector branch into `main`, confirm the Vercel deployment succeeds, set the environment variables above, and redeploy. Then sign into SHAFT → Workspace → Settings → Connect Supabase.
