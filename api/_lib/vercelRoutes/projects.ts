import type { VercelRequest, VercelResponse } from "@vercel/node"
import { readVercelConnection, sendVercelError, vercelApiHeaders, verifyUser } from "../vercelConnector.js"

type VercelProject = Record<string, unknown>
type VercelTeam = { id?: string; name?: string; slug?: string }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const connection = await readVercelConnection(user.uid)
    if (!connection?.data.accessToken) return res.status(200).json({ connected: false, projects: [] })

    const headers = vercelApiHeaders(connection.data.accessToken)
    const projectsById = new Map<string, VercelProject>()
    const fetchProjects = async (teamId?: string) => {
      const url = new URL("https://api.vercel.com/v9/projects")
      url.searchParams.set("limit", "100")
      if (teamId) url.searchParams.set("teamId", teamId)
      const response = await fetch(url, { headers })
      const result = await response.json()
      if (response.status === 401) {
        await connection.doc.ref.delete()
        throw new Error("Vercel session expired. Please reconnect your account.")
      }
      if (!response.ok || !Array.isArray(result.projects)) {
        const message = typeof result.error?.message === "string" ? result.error.message : "Vercel could not return projects."
        // A team may deny access while other scopes remain readable.
        if (teamId && (response.status === 403 || response.status === 404)) return
        throw new Error("Vercel projects request failed (" + response.status + ")" + (teamId ? " for a team" : " for your personal account") + ": " + message)
      }
      for (const project of result.projects as VercelProject[]) {
        if (typeof project.id === "string") projectsById.set(project.id, project)
      }
    }

    // Vercel's Projects API defaults to the personal account; team projects require teamId.
    await fetchProjects()
    const teamsResponse = await fetch("https://api.vercel.com/v2/teams?limit=100", { headers })
    if (teamsResponse.ok) {
      const teamsResult = await teamsResponse.json()
      const teams = Array.isArray(teamsResult.teams) ? teamsResult.teams as VercelTeam[] : []
      for (const team of teams) {
        if (typeof team.id === "string") await fetchProjects(team.id)
      }
    } else if (teamsResponse.status !== 403 && teamsResponse.status !== 404) {
      const teamsResult = await teamsResponse.json().catch(() => ({}))
      const message = typeof teamsResult.error?.message === "string" ? teamsResult.error.message : "Could not list Vercel teams."
      throw new Error("Vercel teams request failed (" + teamsResponse.status + "): " + message)
    }

    const projects = Array.from(projectsById.values()).map(project => ({
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
