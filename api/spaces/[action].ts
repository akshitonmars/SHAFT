import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleDelete } from "../_lib/spaceRoutes/delete.js"
import { handleIdentity } from "../_lib/spaceRoutes/identity.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action

  if (action === "identity") return handleIdentity(req, res)
  if (action === "delete") return handleDelete(req, res)

  return res.status(404).json({ error: "Unknown Space action." })
}
