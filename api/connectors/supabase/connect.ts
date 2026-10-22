import type { VercelRequest, VercelResponse } from "@vercel/node"
import { appUrl, createState, sendError, verifyUser } from "../../_lib/supabaseConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const clientId = process.env.SUPABASE_CLIENT_ID
    if (!clientId || !process.env.SUPABASE_CLIENT_SECRET) throw new Error("Supabase connector is not configured on the server.")
    const redirectUri = appUrl() + "/api/connectors/supabase/callback"
    const url = new URL("https://api.supabase.com/v1/oauth/authorize")
    url.searchParams.set("client_id", clientId)
    url.searchParams.set("redirect_uri", redirectUri)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("state", createState(user.uid))
    return res.status(200).json({ authorizationUrl: url.toString() })
  } catch (error) {
    return sendError(res, error)
  }
}