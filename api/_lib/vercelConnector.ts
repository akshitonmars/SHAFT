import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, verifyUser } from "./supabaseConnector.js"

export { firestore, verifyUser }

export function vercelClientId() {
  const value = process.env.VERCEL_CLIENT_ID
  if (!value) throw new Error("Vercel connector is not configured. Add VERCEL_CLIENT_ID and VERCEL_CLIENT_SECRET in Vercel.")
  return value
}
export function vercelClientSecret() {
  const value = process.env.VERCEL_CLIENT_SECRET
  if (!value) throw new Error("Vercel connector is not configured. Add VERCEL_CLIENT_ID and VERCEL_CLIENT_SECRET in Vercel.")
  return value
}
function sign(value: string) {
  return createHmac("sha256", vercelClientSecret()).update(value).digest("base64url")
}
export function createVercelPkce() {
  const verifier = randomBytes(32).toString("base64url")
  const challenge = createHash("sha256").update(verifier).digest("base64url")
  return { verifier, challenge }
}
export function createVercelState(uid: string) {
  const nonce = randomBytes(18).toString("base64url")
  const payload = Buffer.from(JSON.stringify({ uid, nonce, exp: Date.now() + 10 * 60 * 1000 })).toString("base64url")
  return { state: payload + "." + sign(payload), nonce }
}
export function verifyVercelState(state: string) {
  const [payload, signature, extra] = state.split(".")
  if (!payload || !signature || extra) throw new Error("Invalid Vercel OAuth state.")
  const expected = new Uint8Array(Buffer.from(sign(payload)))
  const actual = new Uint8Array(Buffer.from(signature))
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Invalid Vercel OAuth state.")
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  if (typeof decoded.uid !== "string" || typeof decoded.nonce !== "string" || typeof decoded.exp !== "number" || decoded.exp < Date.now()) throw new Error("Vercel OAuth session expired. Please connect again.")
  return decoded as { uid: string; nonce: string; exp: number }
}
export function vercelCallbackUrl() {
  return (process.env.APP_URL || "https://buildatshaft.vercel.app").replace(/\/$/, "") + "/api/connectors/vercel/callback"
}
export function sendVercelError(res: VercelResponse, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error."
  const status = /not configured|Missing FIREBASE_SERVICE_ACCOUNT_JSON/.test(message) ? 503 : /Sign in|token|OAuth session expired/.test(message) ? 401 : 400
  return res.status(status).json({ error: message })
}
export async function readVercelConnection(uid: string) {
  const doc = await firestore().collection("shaftConnectorSecrets").doc(uid + "_vercel").get()
  return doc.exists ? { doc, data: doc.data() as { accessToken?: string; refreshToken?: string; expiresAt?: number; accountName?: string; email?: string; avatarUrl?: string; connectedAt?: number } } : null
}
export function vercelApiHeaders(token: string) {
  return { Authorization: "Bearer " + token, Accept: "application/json" }
}
