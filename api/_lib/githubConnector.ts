import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import type { VercelResponse } from "@vercel/node"
import { firestore, verifyUser } from "./supabaseConnector.js"

export { firestore, verifyUser }

export function githubClientId() {
  const value = process.env.GITHUB_CLIENT_ID
  if (!value) throw new Error("GitHub connector is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel.")
  return value
}

function githubClientSecret() {
  const value = process.env.GITHUB_CLIENT_SECRET
  if (!value) throw new Error("GitHub connector is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Vercel.")
  return value
}

function sign(value: string) {
  return createHmac("sha256", githubClientSecret()).update(value).digest("base64url")
}

export function createGithubState(uid: string) {
  const payload = Buffer.from(JSON.stringify({
    uid,
    nonce: randomBytes(18).toString("base64url"),
    exp: Date.now() + 10 * 60 * 1000,
  })).toString("base64url")
  return payload + "." + sign(payload)
}

export function verifyGithubState(state: string) {
  const [payload, signature, extra] = state.split(".")
  if (!payload || !signature || extra) throw new Error("Invalid GitHub OAuth state.")
  const expected = Uint8Array.from(Buffer.from(sign(payload)))
  const actual = Uint8Array.from(Buffer.from(signature))
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Invalid GitHub OAuth state.")
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  if (typeof decoded.uid !== "string" || typeof decoded.exp !== "number" || decoded.exp < Date.now()) {
    throw new Error("GitHub OAuth session expired. Please connect again.")
  }
  return decoded as { uid: string; nonce: string; exp: number }
}

export function githubCallbackUrl() {
  const base = (process.env.APP_URL || "https://buildatshaft.vercel.app").replace(/\/$/, "")
  return base + "/api/connectors/github/callback"
}

export function sendGithubError(res: VercelResponse, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error."
  const status = /not configured/.test(message) ? 503
    : /Sign in|token|OAuth session expired/.test(message) ? 401 : 400
  return res.status(status).json({ error: message })
}

export async function readGithubConnection(uid: string) {
  const doc = await firestore().collection("shaftConnectorSecrets").doc(uid + "_github").get()
  return doc.exists ? { doc, data: doc.data() as { accessToken?: string; username?: string; avatarUrl?: string; connectedAt?: number } } : null
}

export function githubApiHeaders(token: string) {
  return {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
}
