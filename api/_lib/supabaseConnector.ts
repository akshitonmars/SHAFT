import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function adminApp() {
  if (getApps().length) return getApps()[0]
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.")
  const serviceAccount = JSON.parse(raw)
  return initializeApp({ credential: cert(serviceAccount) })
}

export function firestore() {
  adminApp()
  return getFirestore()
}

export async function verifyUser(req: VercelRequest) {
  const header = req.headers.authorization || ""
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) throw new Error("Sign in to SHAFT before connecting a service.")
  adminApp()
  return getAuth().verifyIdToken(match[1])
}

function stateSecret() {
  const secret = process.env.SUPABASE_CLIENT_SECRET
  if (!secret) throw new Error("Supabase connector is not configured on the server.")
  return secret
}

function sign(value: string) {
  return createHmac("sha256", stateSecret()).update(value).digest("base64url")
}

export function createState(uid: string) {
  const payload = Buffer.from(JSON.stringify({
    uid,
    nonce: randomBytes(18).toString("base64url"),
    exp: Date.now() + 10 * 60 * 1000,
  })).toString("base64url")
  return payload + "." + sign(payload)
}

export function verifyState(state: string) {
  const [payload, signature, extra] = state.split(".")
  if (!payload || !signature || extra) throw new Error("Invalid OAuth state.")
  const expected = new Uint8Array(Buffer.from(sign(payload)))
  const actual = new Uint8Array(Buffer.from(signature))
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Invalid OAuth state.")
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  if (typeof decoded.uid !== "string" || typeof decoded.exp !== "number" || decoded.exp < Date.now()) {
    throw new Error("OAuth session expired. Please connect again.")
  }
  return decoded as { uid: string; nonce: string; exp: number }
}

export function sendError(res: VercelResponse, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error."
  const status = /Missing FIREBASE_SERVICE_ACCOUNT_JSON|not configured/.test(message) ? 503
    : /Sign in|token|OAuth session expired/.test(message) ? 401 : 400
  return res.status(status).json({ error: message })
}

export function appUrl() {
  const value = process.env.APP_URL || "https://buildatshaft.vercel.app"
  return value.replace(/\/$/, "")
}
