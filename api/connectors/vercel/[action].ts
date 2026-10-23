import type { VercelRequest, VercelResponse } from "@vercel/node"
import connect from "../../../_lib/vercelRoutes/connect.js"
import callback from "../../../_lib/vercelRoutes/callback.js"
import projects from "../../../_lib/vercelRoutes/projects.js"
import disconnect from "../../../_lib/vercelRoutes/disconnect.js"

const handlers: Record<string, (req: VercelRequest, res: VercelResponse) => unknown> = {
  connect, callback, projects, disconnect,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = typeof req.query.action === "string" ? req.query.action : ""
  const selected = handlers[action]
  if (!selected) return res.status(404).json({ error: "Unknown Vercel connector action." })
  return selected(req, res)
}
