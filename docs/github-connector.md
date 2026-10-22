# GitHub connector setup

SHAFT uses a GitHub OAuth App. OAuth credentials must be stored as **server-side Vercel environment variables** and must never use the `VITE_` prefix.

## 1. Create the OAuth App

In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App** and use:

- **Application name:** SHAFT
- **Homepage URL:** `https://buildatshaft.vercel.app`
- **Authorization callback URL:** `https://buildatshaft.vercel.app/api/connectors/github/callback`

If the production domain changes, update both the OAuth App callback and SHAFT's `APP_URL` variable to match.

## 2. Add Vercel environment variables

In the SHAFT Vercel project, add these variables for **Production** (and Preview if you want to test previews):

- `GITHUB_CLIENT_ID`: the OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: the OAuth App Client Secret
- `APP_URL`: `https://buildatshaft.vercel.app`

Redeploy after saving the variables. Do not put the client secret in frontend code or commit it to GitHub.

## 3. What the connector does

- Connects the currently signed-in SHAFT user to GitHub through OAuth.
- Stores the OAuth token server-side in the existing Firestore connector-secrets collection.
- Lists repositories the authorized GitHub account can access, including private repositories.
- Supports checking the connection and disconnecting it from SHAFT.

The initial OAuth scopes are `repo read:user user:email`. The `repo` scope grants broad repository access, including write permissions for private repositories, even though this first SHAFT connector only reads repository metadata and does not push code. Review the requested access before authorizing. A future GitHub App with narrower permissions would be preferable before enabling repository write actions.
