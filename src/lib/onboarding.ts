import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface ShaftProject { id: string; name: string; description: string; createdAt: string }
export interface ShaftUserData {
  name: string
  role: string
  projects: ShaftProject[]
  onboardingCompleted: boolean
  onboardingStep: number
  completedAt?: string
}
const keyFor = (uid: string) => "shaft:v1:user:" + uid
const emptyData = (): ShaftUserData => ({ name: "", role: "", projects: [], onboardingCompleted: false, onboardingStep: 0 })
function normalize(value: Partial<ShaftUserData> = {}): ShaftUserData {
  return { ...emptyData(), ...value,
    name: typeof value.name === "string" ? value.name : "",
    role: typeof value.role === "string" ? value.role : "",
    projects: Array.isArray(value.projects) ? value.projects : [],
    onboardingCompleted: value.onboardingCompleted === true,
    onboardingStep: typeof value.onboardingStep === "number" ? Math.min(4, Math.max(0, value.onboardingStep)) : 0,
  }
}
function cached(uid: string): ShaftUserData {
  try {
    const raw = window.localStorage.getItem(keyFor(uid))
    return raw ? normalize(JSON.parse(raw) as Partial<ShaftUserData>) : emptyData()
  } catch { return emptyData() }
}
function cache(uid: string, data: ShaftUserData) {
  try { window.localStorage.setItem(keyFor(uid), JSON.stringify(data)) } catch { /* Optional cache only. */ }
}
export async function loadUserData(uid: string): Promise<ShaftUserData> {
  const ref = doc(db, "users", uid)
  const snapshot = await getDoc(ref)
  if (snapshot.exists()) {
    const data = normalize(snapshot.data() as Partial<ShaftUserData>)
    cache(uid, data)
    return data
  }
  const oldData = cached(uid)
  await setDoc(ref, { ...oldData, updatedAt: new Date().toISOString() })
  cache(uid, oldData)
  return oldData
}
export function readUserData(uid: string): ShaftUserData { return cached(uid) }
export function saveUserData(uid: string, patch: Partial<ShaftUserData>): ShaftUserData {
  const next = normalize({ ...cached(uid), ...patch })
  cache(uid, next)
  void setDoc(doc(db, "users", uid), { ...next, updatedAt: new Date().toISOString() })
  return next
}
export async function hasCompletedOnboarding(uid: string): Promise<boolean> {
  return (await loadUserData(uid)).onboardingCompleted
}
