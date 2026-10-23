import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, vercelCallbackUrl, vercelClientId, vercelClientSecret, verifyVercelState } from "../vercelConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  const base = (process.env.APP_URL || "https://buildatshaft.vercel.app").replace(/\/$/, "")
  if (req.method !== "GET") return res.status(405).send("Method not allowed.")
  if (typeof req.query.error === "string") {
    const providerError = req.query.error.slice(0, 120)
    const providerMessage = typeof req.query.error_description === "string" ? req.query.error_description.slice(0, 240) : ""
    console.error("[SHAFT Vercel OAuth] Provider rejected authorization", { providerError, providerMessage })
    const query = new URLSearchParams({ error: "authorization_denied", provider_error: providerError })
    if (providerMessage) query.set("provider_message", providerMessage)
    return res.redirect(302, base + "/vercel?" + query.toString())
  }
  try {
    const code = typeof req.query.code === "string" ? req.query.code : ""
    const state = typeof req.query.state === "string" ? req.query.state : ""
    if (!code || !state) throw new Error("Vercel did not return an authorization code.")
    const { uid } = verifyVercelState(state)
    const response = await fetch("https://api.vercel.com/login/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ grant_type: "authorization_code", client_id: vercelClientId(), client_secret: vercelClientSecret(), code, redirect_uri: vercelCallbackUrl() }),
    })
    const tokens = await response.json()
    if (!response.ok || typeof tokens.access_token !== "string") {
      const providerError = typeof tokens.error === "string" ? tokens.error.slice(0, 120) : "no_access_token"
      const providerMessage = typeof tokens.error_description === "string" ? tokens.error_description.slice(0, 240) : ""
      throw new Error("Vercel token exchange failed (HTTP " + response.status + ", " + providerError + ")" + (providerMessage ? ": " + providerMessage : "."))
    }
    let profile: Record<string, unknown> = {}
    try {
      const profileResponse = await fetch("https://api.vercel.com/login/oauth/userinfo", { headers: { Authorization: "Bearer " + tokens.access_token, Accept: "application/json" } })
      if (profileResponse.ok) profile = await profileResponse.json()
    } catch { /* Profile metadata is optional. */ }
    await firestore().collection("shaftConnectorSecrets").doc(uid + "_vercel").set({
      accessToken: tokens.access_token,
      refreshToken: typeof tokens.refresh_token === "string" ? tokens.refresh_token : null,
      expiresAt: typeof tokens.expires_in === "number" ? Date.now() + tokens.expires_in * 1000 : null,
      accountName: typeof profile.name === "string" ? profile.name : typeof profile.username === "string" ? profile.username : null,
      email: typeof profile.email === "string" ? profile.email : null,
      avatarUrl: typeof profile.picture === "string" ? profile.picture : null,
      connectedAt: Date.now(),
    })
    return res.redirect(302, base + "/vercel?connected=1")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed."
    console.error("[SHAFT Vercel OAuth] Callback failed", {
      name: error instanceof Error ? error.name : typeof error,
      message: message.slice(0, 400),
    })
    return res.redirect(302, base + "/vercel?error=" + (/not configured|Missing FIREBASE_SERVICE_ACCOUNT_JSON/.test(message) ? "configuration_required" : "connection_failed"))
  }
}
