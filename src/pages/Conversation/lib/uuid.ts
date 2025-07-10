// src/lib/uuid.ts
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'coconnect_guest_uuid'

let cachedUUID: string | null = null

export function getGuestUUID(): string {
  if (typeof window === 'undefined') return '' // SSR guard

  if (cachedUUID) return cachedUUID

  let uuid = localStorage.getItem(STORAGE_KEY)

  if (!uuid) {
    uuid = uuidv4()
    localStorage.setItem(STORAGE_KEY, uuid)
    console.log('[🆕 Guest UUID created]', uuid)
  } else {
    console.log('[🔁 Guest UUID reused]', uuid)
  }

  cachedUUID = uuid
  return uuid
}
