import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createGithubState, githubCallbackUrl, githubClientId, sendGithubError, verifyUser } from "../../_lib/githubConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const state = createGithubState(user.uid)
    const url = new URL("https://github.com/login/oauth/authorize")
    url.searchParams.set("client_id", githubClientId())
    url.searchParams.set("redirect_uri", githubCallbackUrl())
    url.searchParams.set("scope", "repo read:user user:email")
    url.searchParams.set("state", state)
    return res.status(200).json({ authorizationUrl: url.toString() })
  } catch (error) {
    return sendGithubError(res, error)
  }
}
