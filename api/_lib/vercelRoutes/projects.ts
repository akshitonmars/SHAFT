import { readVercelConnection, sendVercelError, vercelApiHeaders, verifyUser } from "../vercelConnector.js"
import type { VercelRequest, VercelResponse } from "@vercel/node"

type VercelProject = Record<string, unknown>

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const connection = await readVercelConnection(user.uid)
    if (!connection?.data.accessToken) return res.status(200).json({ connected: false, projects: [] })

    const headers = vercelApiHeaders(connection.data.accessToken)
    const url = new URL("https://api.vercel.com/v9/projects")
    url.searchParams.set("limit", "100")
    // Integration tokens are scoped to the account where the integration was installed.
    if (connection.data.teamId) url.searchParams.set("teamId", connection.data.teamId)
    const response = await fetch(url, { headers })
    const result = await response.json()
    if (response.status === 401) {
      await connection.doc.ref.delete()
      throw new Error("Vercel integration token was rejected. Reinstall the integration and connect again.")
    }
    if (!response.ok || !Array.isArray(result.projects)) {
      const message = typeof result.error?.message === "string" ? result.error.message : "Vercel could not return projects."
      throw new Error("Vercel projects request failed (" + response.status + "): " + message)
    }
    const projects = (result.projects as VercelProject[]).map(project => ({
      id: project.id, name: project.name, framework: project.framework, updatedAt: project.updatedAt,
    }))
    return res.status(200).json({
      connected: true,
      accountName: connection.data.accountName || "",
      email: connection.data.email || "",
      projects,
    })
  } catch (error) {
    return sendVercelError(res, error)
  }
}
