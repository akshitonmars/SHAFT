import { scryptSync, timingSafeEqual } from "node:crypto"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, sendError, verifyUser } from "../supabaseConnector.js"

export async function handleDelete(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const { spaceId, secret, confirmName } = (req.body || {}) as {
      spaceId?: string
      secret?: string
      confirmName?: string
    }
    if (typeof spaceId !== "string" || !spaceId) return res.status(400).json({ error: "Space ID is required." })
    if (typeof secret !== "string" || !/^\d{6}$/.test(secret)) {
      return res.status(400).json({ error: "Enter the six-digit Space Secret to delete this Space." })
    }

    const db = firestore()
    const userRef = db.collection("shaftUsers").doc(user.uid)
    const secretRef = db.collection("shaftSpaceSecrets").doc(user.uid + "_" + spaceId)

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef)
      const secretSnap = await tx.get(secretRef)
      if (!userSnap.exists) throw new Error("Your SHAFT workspace could not be found.")
      const data = userSnap.data() || {}
      const projects = Array.isArray(data.projects) ? data.projects as Record<string, unknown>[] : []
      const index = projects.findIndex((project) => project.id === spaceId)
      if (index < 0) throw new Error("Space not found in your account.")
      const project = projects[index]
      if (typeof project.name !== "string" || project.name !== confirmName) {
        throw new Error("The Space name confirmation does not match.")
      }
      if (!secretSnap.exists) throw new Error("This Space has no Space Secret yet. Set its identity in Project Settings first.")
      const record = secretSnap.data() || {}
      if (typeof record.salt !== "string" || typeof record.hash !== "string") throw new Error("The Space Secret record is invalid.")
      const actual = new Uint8Array(scryptSync(secret, record.salt, 64))
      const expected = new Uint8Array(Buffer.from(record.hash, "hex"))
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        throw new Error("Incorrect Space Secret. The Space was not deleted.")
      }

      const nextProjects = projects.filter((project) => project.id !== spaceId)
      tx.set(userRef, { ...data, projects: nextProjects, updatedAt: new Date().toISOString() }, { merge: true })
      tx.delete(secretRef)
      if (typeof project.publicId === "string" && project.publicId) {
        tx.delete(db.collection("shaftSpaceRegistry").doc(project.publicId))
      }
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    return sendError(res, error)
  }
}
