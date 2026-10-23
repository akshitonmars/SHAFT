import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, vercelCallbackUrl, vercelClientId, vercelClientSecret, verifyVercelState } from "../vercelConnector.js"

function returnToShaft(res: VercelResponse, base: string, error: string) {
  return res.redirect(302, base + "/vercel?error=" + encodeURIComponent(error))
}
function safeVercelNext(value: unknown) {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" && (url.hostname === "vercel.com" || url.hostname.endsWith(".vercel.com")) ? url.toString() : null
  } catch { return null }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  const base = (process.env.APP_URL || "https://buildatshaft.vercel.app").replace(/\/$/, "")
  if (req.method !== "GET") return res.status(405).send("Method not allowed.")
  try {
    const code = typeof req.query.code === "string" ? req.query.code : ""
    const state = typeof req.query.state === "string" ? req.query.state : ""
    if (typeof req.query.error === "string") {
      console.error("[SHAFT Vercel integration] Installation rejected", { error: req.query.error.slice(0, 120) })
      return returnToShaft(res, base, "authorization_denied")
    }
    if (!code || !state) throw new Error("Vercel did not return an integration installation code and state.")
    const { uid, nonce } = verifyVercelState(state)
    const stateRef = firestore().collection("shaftVercelOAuthStates").doc(nonce)
    const stateSnapshot = await stateRef.get()
    if (!stateSnapshot.exists) throw new Error("Vercel integration session is missing or already used. Please connect again.")
    const saved = stateSnapshot.data() as { uid?: string; expiresAt?: number }
    if (saved.uid !== uid || typeof saved.expiresAt !== "number" || saved.expiresAt < Date.now()) {
      await stateRef.delete()
      throw new Error("Vercel integration session is invalid or expired. Please connect again.")
    }
    await stateRef.delete()

    const response = await fetch("https://api.vercel.com/v2/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        client_id: vercelClientId(),
        client_secret: vercelClientSecret(),
        code,
        redirect_uri: vercelCallbackUrl(),
      }),
    })
    const tokens = await response.json()
    if (!response.ok || typeof tokens.access_token !== "string") {
      const providerError = typeof tokens.error === "string" ? tokens.error.slice(0, 120) : "no_access_token"
      const providerMessage = typeof tokens.error_description === "string" ? tokens.error_description.slice(0, 240) : ""
      throw new Error("Vercel integration token exchange failed (HTTP " + response.status + ", " + providerError + ")" + (providerMessage ? ": " + providerMessage : "."))
    }

    const teamId = typeof req.query.teamId === "string" && req.query.teamId ? req.query.teamId : (typeof tokens.team_id === "string" && tokens.team_id ? tokens.team_id : null)
    const configurationId = typeof req.query.configurationId === "string" ? req.query.configurationId : ""
    const nextUrl = safeVercelNext(req.query.next)
    await firestore().collection("shaftConnectorSecrets").doc(uid + "_vercel").set({
      accessToken: tokens.access_token,
      teamId,
      configurationId: configurationId || null,
      nextUrl,
      accountName: "",
      email: "",
      avatarUrl: null,
      connectedAt: Date.now(),
    })
    // Vercel supplies "next" for completing its installation popup. Never redirect to an arbitrary host.
    if (nextUrl) return res.redirect(302, nextUrl)
    return res.redirect(302, base + "/vercel?connected=1")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed."
    console.error("[SHAFT Vercel integration] Callback failed", { message: message.slice(0, 400) })
    return returnToShaft(res, base, /not configured|Missing FIREBASE_SERVICE_ACCOUNT_JSON/.test(message) ? "configuration_required" : "connection_failed")
  }
}
