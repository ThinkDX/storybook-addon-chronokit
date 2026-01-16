export const ADDON_ID = 'network-panel'
export const PANEL_ID = `${ADDON_ID}/panel`

// Channel events
export const EVENTS = {
  REQUEST: `${ADDON_ID}/request`,
  CLEAR: `${ADDON_ID}/clear`,
} as const

export type NetworkRequest = {
  id: string
  url: string
  method: string
  status: number | null
  statusText: string | null
  mocked: boolean
  error: string | null
  timestamp: number
  duration: number | null
}
