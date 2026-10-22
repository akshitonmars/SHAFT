export interface ShaftProject {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface ShaftUserData {
  name: string
  role: string
  projects: ShaftProject[]
  onboardingCompleted: boolean
  onboardingStep: number
  completedAt?: string
}

const keyFor = (uid: string) => "shaft:v1:user:" + uid
const emptyData = (): ShaftUserData => ({
  name: "",
  role: "",
  projects: [],
  onboardingCompleted: false,
  onboardingStep: 0,
})

export function readUserData(uid: string): ShaftUserData {
  if (typeof window === "undefined") return emptyData()
  try {
    const raw = window.localStorage.getItem(keyFor(uid))
    if (!raw) return emptyData()
    const value = JSON.parse(raw) as Partial<ShaftUserData>
    return {
      ...emptyData(),
      ...value,
      name: typeof value.name === "string" ? value.name : "",
      role: typeof value.role === "string" ? value.role : "",
      projects: Array.isArray(value.projects) ? value.projects : [],
      onboardingCompleted: value.onboardingCompleted === true,
      onboardingStep: typeof value.onboardingStep === "number"
        ? Math.min(4, Math.max(0, value.onboardingStep))
        : 0,
    }
  } catch {
    return emptyData()
  }
}

export function saveUserData(uid: string, patch: Partial<ShaftUserData>): ShaftUserData {
  const next = { ...readUserData(uid), ...patch }
  try {
    window.localStorage.setItem(keyFor(uid), JSON.stringify(next))
  } catch {
    throw new Error("SHAFT couldn't save this on your device. Check your browser storage settings and try again.")
  }
  return next
}

export function hasCompletedOnboarding(uid: string): boolean {
  return readUserData(uid).onboardingCompleted
}
