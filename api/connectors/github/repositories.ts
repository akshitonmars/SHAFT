import type { VercelRequest, VercelResponse } from "@vercel/node"
import { githubApiHeaders, readGithubConnection, sendGithubError, verifyUser } from "../../_lib/githubConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const connection = await readGithubConnection(user.uid)
    if (!connection?.data.accessToken) return res.status(409).json({ error: "Connect GitHub in SHAFT Settings first." })
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member", {
      headers: githubApiHeaders(connection.data.accessToken),
    })
    const result = await response.json()
    if (response.status === 401) {
      await connection.doc.delete()
      return res.status(401).json({ error: "Your GitHub session expired. Connect GitHub again." })
    }
    if (!response.ok || !Array.isArray(result)) throw new Error("GitHub could not return your repositories. Check the authorized account and try again.")
    const repositories = result.map((repo: Record<string, unknown>) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
    }))
    return res.status(200).json({ repositories })
  } catch (error) {
    return sendGithubError(res, error)
  }
}
