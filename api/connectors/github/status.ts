import type { VercelRequest, VercelResponse } from "@vercel/node"
import { githubApiHeaders, readGithubConnection, sendGithubError, verifyUser } from "../../_lib/githubConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const connection = await readGithubConnection(user.uid)
    if (!connection?.data.accessToken) return res.status(200).json({ connected: false })
    const response = await fetch("https://api.github.com/user", { headers: githubApiHeaders(connection.data.accessToken) })
    if (response.status === 401) {
      await connection.doc.delete()
      return res.status(200).json({ connected: false, reconnectRequired: true })
    }
    if (!response.ok) throw new Error("Could not verify your GitHub connection. Try again.")
    const profile = await response.json()
    return res.status(200).json({
      connected: true,
      username: connection.data.username || profile.login,
      avatarUrl: connection.data.avatarUrl || profile.avatar_url || null,
      connectedAt: connection.data.connectedAt || null,
    })
  } catch (error) {
    return sendGithubError(res, error)
  }
}
