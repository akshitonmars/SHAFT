import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, sendVercelError, verifyUser } from "../../_lib/vercelConnector.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    await firestore().collection("shaftConnectorSecrets").doc(user.uid + "_vercel").delete()
    return res.status(200).json({ disconnected: true })
  } catch (error) { return sendVercelError(res, error) }
}
