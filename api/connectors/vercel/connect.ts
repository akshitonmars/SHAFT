import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createVercelState, vercelCallbackUrl, vercelClientId, sendVercelError, verifyUser } from "../../_lib/vercelConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const url = new URL("https://vercel.com/oauth/authorize")
    url.searchParams.set("client_id", vercelClientId())
    url.searchParams.set("redirect_uri", vercelCallbackUrl())
    url.searchParams.set("response_type", "code")
    url.searchParams.set("state", createVercelState(user.uid))
    url.searchParams.set("scope", "openid email profile offline_access")
    return res.status(200).json({ authorizationUrl: url.toString() })
  } catch (error) {
    return sendVercelError(res, error)
  }
}