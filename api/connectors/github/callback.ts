import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, githubCallbackUrl, githubClientId, sendGithubError, verifyGithubState } from "../../_lib/githubConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  const base = (process.env.APP_URL || "https://buildatshaft.vercel.app").replace(/\/$/, "")
  if (req.method !== "GET") return res.status(405).send("Method not allowed.")
  const providerError = typeof req.query.error === "string" ? req.query.error : ""
  if (providerError) return res.redirect(302, base + "/github?error=authorization_denied")
  try {
    const code = typeof req.query.code === "string" ? req.query.code : ""
    const state = typeof req.query.state === "string" ? req.query.state : ""
    if (!code || !state) throw new Error("GitHub did not return an authorization code. Please try again.")
    const { uid } = verifyGithubState(state)
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    if (!clientSecret) throw new Error("GitHub connector is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel.")
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: githubClientId(), client_secret: clientSecret, code, redirect_uri: githubCallbackUrl() }),
    })
    const tokenResult = await tokenResponse.json()
    if (!tokenResponse.ok || typeof tokenResult.access_token !== "string") {
      throw new Error("GitHub authorization failed. Check the OAuth App credentials and callback URL.")
    }
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: "Bearer " + tokenResult.access_token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    })
    const profile = await profileResponse.json()
    if (!profileResponse.ok || typeof profile.login !== "string") throw new Error("GitHub authorized SHAFT but did not return a valid profile.")
    await firestore().collection("shaftConnectorSecrets").doc(uid + "_github").set({
      accessToken: tokenResult.access_token,
      username: profile.login,
      avatarUrl: typeof profile.avatar_url === "string" ? profile.avatar_url : null,
      connectedAt: Date.now(),
      scope: typeof tokenResult.scope === "string" ? tokenResult.scope : "repo read:user user:email",
    })
    return res.redirect(302, base + "/github?connected=1")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not connect GitHub."
    const target = /not configured/.test(message) ? "configuration_required" : "connection_failed"
    return res.redirect(302, base + "/github?error=" + target)
  }
}
