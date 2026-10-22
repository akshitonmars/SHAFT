import type { VercelRequest, VercelResponse } from "@vercel/node"
import { firestore, sendError, verifyUser } from "../../_lib/supabaseConnector.js"

type StoredConnection = {
  accessToken: string
  refreshToken?: string | null
  expiresAt?: number
}

async function connectionFor(uid: string): Promise<{ token: string; connection: StoredConnection }> {
  const doc = await firestore().collection("shaftConnectorSecrets").doc(uid + "_supabase").get()
  if (!doc.exists) throw new Error("Connect Supabase in Settings first.")
  const connection = doc.data() as StoredConnection
  let token = connection.accessToken
  if (typeof connection.expiresAt === "number" && connection.expiresAt < Date.now() + 60_000 && connection.refreshToken) {
    const clientId = process.env.SUPABASE_CLIENT_ID
    const clientSecret = process.env.SUPABASE_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error("Supabase connector is not configured on the server.")
    const response = await fetch("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: String(connection.refreshToken) }),
    })
    const refreshed = await response.json()
    if (!response.ok || typeof refreshed.access_token !== "string") throw new Error("Your Supabase session expired. Reconnect Supabase in Settings.")
    token = refreshed.access_token
    await doc.ref.set({
      ...connection,
      accessToken: token,
      refreshToken: typeof refreshed.refresh_token === "string" ? refreshed.refresh_token : connection.refreshToken,
      expiresAt: Date.now() + Math.max(60, Number(refreshed.expires_in) || 3600) * 1000,
    })
  }
  return { token, connection }
}

function quoteIdentifier(value: string) {
  return '"' + value.replace(/"/g, '""') + '"'
}

function sqlLiteral(value: unknown): string {
  if (value === null) return "NULL"
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (typeof value === "string") return "'" + value.replace(/'/g, "''") + "'"
  throw new Error("For this first version, row values must be text, numbers, booleans, or null.")
}

async function runQuery(token: string, ref: string, query: string, readOnly: boolean) {
  const endpoint = readOnly ? "query/read-only" : "query"
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/${endpoint}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
  const text = await response.text()
  let result: unknown = null
  try { result = text ? JSON.parse(text) : null } catch { result = { message: text.slice(0, 500) } }
  if (!response.ok) {
    if (response.status === 403) throw new Error(readOnly
      ? "Supabase denied database read access. Reconfigure your Supabase OAuth app to grant the database:read scope, then reconnect."
      : "Supabase denied database write access. Reconfigure your Supabase OAuth app to grant the database:write scope, then reconnect.")
    throw new Error(`Supabase database request failed (${response.status}). ${typeof result === "object" && result && "message" in result ? String((result as { message: unknown }).message) : "Check that the project is active and your OAuth permissions include database access."}`)
  }
  return result
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  try {
    const user = await verifyUser(req)
    const ref = typeof req.query.ref === "string" ? req.query.ref : ""
    if (!/^[a-z0-9]{20}$/.test(ref)) return res.status(400).json({ error: "Choose a valid Supabase project." })
    const { token } = await connectionFor(user.uid)

    // Confirm this project is visible to the connected Supabase account before querying it.
    const projectResponse = await fetch("https://api.supabase.com/v1/projects", {
      headers: { Authorization: "Bearer " + token },
    })
    const projects = await projectResponse.json()
    if (!projectResponse.ok || !Array.isArray(projects)) throw new Error("Could not verify your Supabase project. Reconnect Supabase and try again.")
    if (!projects.some((project: { ref?: string }) => project.ref === ref)) {
      return res.status(403).json({ error: "This project is not available through your connected Supabase account." })
    }

    if (req.method === "GET") {
      const table = typeof req.query.table === "string" ? req.query.table : ""
      if (!table) {
        const result = await runQuery(token, ref,
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name LIMIT 200",
          true)
        return res.status(200).json({ tables: Array.isArray(result) ? result : [] })
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(table)) return res.status(400).json({ error: "Invalid table name." })
      const exists = await runQuery(token, ref,
        "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = " + sqlLiteral(table) + " ORDER BY ordinal_position",
        true)
      if (!Array.isArray(exists) || exists.length === 0) return res.status(404).json({ error: "Table not found in the public schema." })
      const rows = await runQuery(token, ref, "SELECT * FROM public." + quoteIdentifier(table) + " LIMIT 100", true)
      return res.status(200).json({ columns: exists, rows: Array.isArray(rows) ? rows : [] })
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
      const table = typeof body?.table === "string" ? body.table : ""
      const record = body?.record
      if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/.test(table)) return res.status(400).json({ error: "Invalid table name." })
      if (!record || typeof record !== "object" || Array.isArray(record)) return res.status(400).json({ error: "Provide a row object to insert." })
      const columnResult = await runQuery(token, ref,
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = " + sqlLiteral(table) + " ORDER BY ordinal_position",
        true)
      if (!Array.isArray(columnResult) || columnResult.length === 0) return res.status(404).json({ error: "Table not found in the public schema." })
      const allowed = new Set(columnResult.map((column: { column_name: string }) => column.column_name))
      const entries = Object.entries(record as Record<string, unknown>)
      if (entries.length === 0 || entries.length > 40 || entries.some(([key]) => !allowed.has(key))) {
        return res.status(400).json({ error: "Provide 1–40 fields that exist in the selected table." })
      }
      const names = entries.map(([key]) => quoteIdentifier(key)).join(", ")
      const values = entries.map(([, value]) => sqlLiteral(value)).join(", ")
      const result = await runQuery(token, ref, "INSERT INTO public." + quoteIdentifier(table) + " (" + names + ") VALUES (" + values + ") RETURNING *", false)
      return res.status(201).json({ rows: Array.isArray(result) ? result : [], saved: true })
    }

    return res.status(405).json({ error: "Method not allowed." })
  } catch (error) {
    return sendError(res, error)
  }
}
