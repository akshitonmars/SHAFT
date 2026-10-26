import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, sendError, verifyUser } from "../_lib/supabaseConnector"

const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

function makeSpaceId() {
  const bytes = randomBytes(6)
  let suffix = ""
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length]
  return "SH" + suffix
}

function secretRecord(secret: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(secret, salt, 64).toString("hex")
  return { salt, hash, createdAt: new Date().toISOString(), algorithm: "scrypt" }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." })
  try {
    const user = await verifyUser(req)
    const { spaceId, secret } = (req.body || {}) as { spaceId?: string; secret?: string }
    if (typeof secret !== "string" || !/^\d{6}$/.test(secret)) {
      return res.status(400).json({ error: "Choose a six-digit Space Secret." })
    }

    const db = firestore()
    const userRef = db.collection("shaftUsers").doc(user.uid)
    const secretRef = spaceId ? db.collection("shaftSpaceSecrets").doc(user.uid + "_" + spaceId) : null
    const secretData = secretRecord(secret)

    const result = await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef)
      if (!userSnap.exists) throw new Error("Your SHAFT workspace could not be found.")
      const data = userSnap.data() || {}
      const projects = Array.isArray(data.projects) ? data.projects as Record<string, unknown>[] : []
      const index = spaceId ? projects.findIndex((project) => project.id === spaceId) : -1
      if (spaceId && index < 0) throw new Error("Space not found in your account.")
      if (spaceId && secretRef) {
        const existingSecret = await tx.get(secretRef)
        if (existingSecret.exists) throw new Error("A Space Secret has already been set and cannot be changed.")
      }

      const project = spaceId ? { ...projects[index] } : null
      if (project && typeof project.publicId === "string" && project.publicId) {
        throw new Error("This Space already has a Space ID.")
      }

      let publicId = ""
      let registryRef
      for (let attempt = 0; attempt < 8; attempt++) {
        publicId = makeSpaceId()
        registryRef = db.collection("shaftSpaceRegistry").doc(publicId)
        const existing = await tx.get(registryRef)
        if (!existing.exists) break
        publicId = ""
      }
      if (!publicId || !registryRef) throw new Error("Could not allocate a unique Space ID. Please retry.")

      const internalId = spaceId || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : randomBytes(16).toString("hex"))
      const nextProject = project
        ? { ...project, publicId }
        : {
            id: internalId,
            publicId,
            name: typeof (req.body || {}).name === "string" ? String((req.body || {}).name).trim().slice(0, 100) : "",
            description: typeof (req.body || {}).description === "string" ? String((req.body || {}).description).trim().slice(0, 1200) : "",
            createdAt: new Date().toISOString(),
          }
      if (!String(nextProject.name || "").trim()) throw new Error("Add a Space name.")
      if (!String(nextProject.description || "").trim()) throw new Error("Add a Space description.")

      const nextProjects = project
        ? projects.map((item, itemIndex) => itemIndex === index ? nextProject : item)
        : [...projects, nextProject]

      tx.set(registryRef, { uid: user.uid, spaceId: internalId, createdAt: new Date().toISOString() })
      tx.set(db.collection("shaftSpaceSecrets").doc(user.uid + "_" + internalId), secretData)
      tx.set(userRef, { ...data, projects: nextProjects, updatedAt: new Date().toISOString() }, { merge: true })
      return { project: nextProject }
    })

    return res.status(200).json({ project: result.project })
  } catch (error) {
    return sendError(res, error)
  }
}
