import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, sendError, verifyUser } from "../../_lib/supabaseConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const doc = await firestore().collection("shaftConnectorSecrets").doc(user.uid + "_supabase").get()
    if (!doc.exists) return res.status(200).json({ connected: false, projects: [] })
    const data = doc.data()!
    let accessToken = data.accessToken as string
    if (typeof data.expiresAt === "number" && data.expiresAt < Date.now() + 60_000 && data.refreshToken) {
      const clientId = process.env.SUPABASE_CLIENT_ID
      const clientSecret = process.env.SUPABASE_CLIENT_SECRET
      if (!clientId || !clientSecret) throw new Error("Supabase connector is not configured on the server.")
      const response = await fetch("https://api.supabase.com/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: String(data.refreshToken) }),
      })
      const refreshed = await response.json()
      if (!response.ok || typeof refreshed.access_token !== "string") {
        await doc.ref.delete()
        return res.status(200).json({ connected: false, projects: [], reconnectRequired: true })
      }
      accessToken = refreshed.access_token
      await doc.ref.set({
        ...data,
        accessToken,
        refreshToken: typeof refreshed.refresh_token === "string" ? refreshed.refresh_token : data.refreshToken,
        expiresAt: Date.now() + Math.max(60, Number(refreshed.expires_in) || 3600) * 1000,
      })
    }
    const response = await fetch("https://api.supabase.com/v1/projects", {
      headers: { Authorization: "Bearer " + accessToken },
    })
    const projects = await response.json()
    if (!response.ok || !Array.isArray(projects)) throw new Error("Could not load Supabase projects. Reconnect Supabase and try again.")
    return res.status(200).json({
      connected: true,
      projects: projects.map((project: any) => ({
        id: project.ref || project.id,
        name: project.name,
        region: project.region,
        status: project.status,
        organizationId: project.organization_id,
      })),
    })
  } catch (error) {
    return sendError(res, error)
  }
}