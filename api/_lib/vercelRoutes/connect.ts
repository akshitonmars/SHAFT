import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createVercelPkce, createVercelState, firestore, vercelCallbackUrl, vercelClientId, sendVercelError, verifyUser } from "../vercelConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const { verifier, challenge } = createVercelPkce()
    const { state, nonce } = createVercelState(user.uid)
    await firestore().collection("shaftVercelOAuthStates").doc(nonce).set({
      uid: user.uid,
      codeVerifier: verifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    })
    const url = new URL("https://vercel.com/oauth/authorize")
    url.searchParams.set("client_id", vercelClientId())
    url.searchParams.set("redirect_uri", vercelCallbackUrl())
    url.searchParams.set("response_type", "code")
    url.searchParams.set("state", state)
    url.searchParams.set("code_challenge", challenge)
    url.searchParams.set("code_challenge_method", "S256")
    return res.status(200).json({ authorizationUrl: url.toString() })
  } catch (error) {
    return sendVercelError(res, error)
  }
}
