import type { Decorator } from '@storybook/react-vite'
import { addons } from 'storybook/preview-api'
import { useEffect, useRef } from 'react'
import { getWorker } from 'msw-storybook-addon'
import { EVENTS, type NetworkRequest } from './constants'

let requestId = 0
let currentChannel: ReturnType<typeof addons.getChannel> | null = null
let listenersInstalled = false

// Track pending requests to calculate duration
const pendingRequests = new Map<
  string,
  { timestamp: number; method: string; url: string }
>()

function generateId() {
  return `req-${++requestId}-${Date.now()}`
}

function getRequestKey(requestId: string) {
  return requestId
}

// Ignore requests to the Storybook server itself
function shouldIgnoreRequest(url: string): boolean {
  try {
    const parsed = new URL(url)
    const currentOrigin = globalThis.location?.origin
    return parsed.origin === currentOrigin
  } catch {
    return false
  }
}

function installMswListeners() {
  if (listenersInstalled) return

  const worker = getWorker()
  if (!worker) {
    console.warn('[NetworkPanel] MSW worker not found')
    return
  }

  // Request started - track it (if not ignored)
  worker.events.on('request:start', ({ request, requestId: mswRequestId }) => {
    if (shouldIgnoreRequest(request.url)) return

    pendingRequests.set(getRequestKey(mswRequestId), {
      timestamp: Date.now(),
      method: request.method,
      url: request.url,
    })
  })

  // Request was handled by MSW (mocked)
  worker.events.on(
    'request:match',
    ({ request, requestId: mswRequestId, response }) => {
      const pending = pendingRequests.get(getRequestKey(mswRequestId))
      if (!pending) return

      const duration = Date.now() - pending.timestamp

      const networkRequest: NetworkRequest = {
        id: generateId(),
        url: request.url,
        method: request.method,
        status: response?.status ?? null,
        statusText: response?.statusText ?? null,
        mocked: true,
        error: null,
        timestamp: pending.timestamp,
        duration,
      }

      currentChannel?.emit(EVENTS.REQUEST, networkRequest)
      pendingRequests.delete(getRequestKey(mswRequestId))
    },
  )

  // Request was not handled by MSW (unmocked/passthrough)
  worker.events.on(
    'request:unhandled',
    ({ request, requestId: mswRequestId }) => {
      const pending = pendingRequests.get(getRequestKey(mswRequestId))
      if (!pending) return

      // For unhandled requests, we emit immediately since we won't get a response event
      const networkRequest: NetworkRequest = {
        id: generateId(),
        url: request.url,
        method: request.method,
        status: null,
        statusText: 'Unmocked',
        mocked: false,
        error: null,
        timestamp: pending.timestamp,
        duration: null,
      }

      currentChannel?.emit(EVENTS.REQUEST, networkRequest)
      pendingRequests.delete(getRequestKey(mswRequestId))
    },
  )

  // Request ended (for passthrough requests that complete)
  worker.events.on(
    'response:bypass',
    ({ request, requestId: mswRequestId, response }) => {
      const pending = pendingRequests.get(getRequestKey(mswRequestId))
      // If still pending, it was a passthrough that completed
      if (pending) {
        const duration = Date.now() - pending.timestamp

        const networkRequest: NetworkRequest = {
          id: generateId(),
          url: request.url,
          method: request.method,
          status: response.status,
          statusText: response.statusText,
          mocked: false,
          error: null,
          timestamp: pending.timestamp,
          duration,
        }

        currentChannel?.emit(EVENTS.REQUEST, networkRequest)
        pendingRequests.delete(getRequestKey(mswRequestId))
      }
    },
  )

  listenersInstalled = true
}

export const networkPanelDecorator: Decorator = (Story, context) => {
  const previousStoryId = useRef<string | null>(null)

  // Update channel reference synchronously
  currentChannel = addons.getChannel()

  // Install MSW listeners (once)
  installMswListeners()

  // Clear on story change (synchronously before render)
  if (previousStoryId.current !== context.id) {
    currentChannel.emit(EVENTS.CLEAR)
    pendingRequests.clear()
    previousStoryId.current = context.id
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previousStoryId.current = null
    }
  }, [])

  return <Story />
}
