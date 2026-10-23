import type { VercelRequest, VercelResponse } from "@vercel/node"
import { appUrl, firestore, verifyState } from "../../_lib/supabaseConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  const base = appUrl() + "/workspace"
  if (req.method !== "GET") return res.status(405).send("Method not allowed.")
  if (typeof req.query.error === "string") {
    return res.redirect(302, base + "?connector=supabase&status=denied")
  }
  try {
    const code = typeof req.query.code === "string" ? req.query.code : ""
    const state = typeof req.query.state === "string" ? req.query.state : ""
    if (!code || !state) throw new Error("Supabase did not return an authorization code.")
    const { uid } = verifyState(state)
    const clientId = process.env.SUPABASE_CLIENT_ID
    const clientSecret = process.env.SUPABASE_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error("Supabase connector is not configured on the server.")
    const redirectUri = appUrl() + "/api/connectors/supabase/callback"
    const tokenResponse = await fetch("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    })
    const tokens = await tokenResponse.json()
    if (!tokenResponse.ok || typeof tokens.access_token !== "string") {
      throw new Error("Supabase token exchange failed. Check the registered callback URL and OAuth app.")
    }
    const expiresAt = Date.now() + Math.max(60, Number(tokens.expires_in) || 3600) * 1000
    await firestore().collection("shaftConnectorSecrets").doc(uid + "_supabase").set({
      provider: "supabase",
      accessToken: tokens.access_token,
      refreshToken: typeof tokens.refresh_token === "string" ? tokens.refresh_token : null,
      expiresAt,
      connectedAt: Date.now(),
      scopes: typeof tokens.scope === "string" ? tokens.scope : null,
    })
    return res.redirect(302, base + "?connector=supabase&status=connected")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not connect Supabase."
    return res.redirect(302, base + "?connector=supabase&status=error&reason=" + encodeURIComponent(message.slice(0, 180)))
  }
}