import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createVercelState, firestore, vercelIntegrationSlug, sendVercelError, verifyUser } from "../vercelConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const { state, nonce } = createVercelState(user.uid)
    await firestore().collection("shaftVercelOAuthStates").doc(nonce).set({
      uid: user.uid,
      expiresAt: Date.now() + 10 * 60 * 1000,
    })
    const slug = vercelIntegrationSlug()
    const url = new URL("https://vercel.com/integrations/" + encodeURIComponent(slug) + "/new")
    url.searchParams.set("state", state)
    return res.status(200).json({ authorizationUrl: url.toString() })
  } catch (error) {
    return sendVercelError(res, error)
  }
}
