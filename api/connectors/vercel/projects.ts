import type { VercelRequest, VercelResponse } from "@vercel/node"
import { readVercelConnection, sendVercelError, vercelApiHeaders, verifyUser } from "../../_lib/vercelConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const connection = await readVercelConnection(user.uid)
    if (!connection?.data.accessToken) return res.status(200).json({ connected: false, projects: [] })
    const response = await fetch("https://api.vercel.com/v9/projects?limit=100", { headers: vercelApiHeaders(connection.data.accessToken) })
    if (response.status === 401) {
      await connection.doc.delete()
      return res.status(200).json({ connected: false, reconnectRequired: true, projects: [] })
    }
    const result = await response.json()
    if (!response.ok || !Array.isArray(result.projects)) {
      const message = typeof result.error?.message === "string" ? result.error.message : "Vercel could not return projects. Check this OAuth app's permissions."
      return res.status(response.status >= 400 && response.status < 500 ? response.status : 502).json({ error: message })
    }
    const projects = result.projects.map((project: Record<string, unknown>) => ({
      id: project.id, name: project.name, framework: project.framework, updatedAt: project.updatedAt,
    }))
    return res.status(200).json({ connected: true, accountName: connection.data.accountName || "", email: connection.data.email || "", projects })
  } catch (error) { return sendVercelError(res, error) }
}
