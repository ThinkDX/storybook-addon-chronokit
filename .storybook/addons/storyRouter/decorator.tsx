import type { Decorator } from '@storybook/react-vite'
import { Suspense, useEffect, useRef, useState } from 'react'
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
  Outlet,
} from 'react-router'
import { appRoutes } from './routes'

export type StoryRouterParameters = {
  /**
   * Initial path for the story (e.g., '/tickets', '/')
   * @default '/'
   */
  path?: string

  /**
   * Whether to allow navigation to other routes.
   * - true: Use full app routes, navigation works normally
   * - false: Show fallback screen when navigation is attempted
   * @default false
   */
  allowNavigation?: boolean
}

/**
 * Fallback component shown when navigation is blocked
 */
function NavigationFallback({ attemptedPath }: { attemptedPath: string }) {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#1a1a2e',
        color: '#eee',
      }}
    >
      <div style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧭</div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#fff',
          }}
        >
          Navigation Outside Story
        </h1>
        <p style={{ color: '#aaa', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          This story attempted to navigate to a different route. Navigation is
          disabled to keep the story focused.
        </p>
        <div
          style={{
            backgroundColor: '#2a2a4a',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            wordBreak: 'break-all',
            color: '#fbbf24',
          }}
        >
          {attemptedPath}
        </div>
        <p
          style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.5rem' }}
        >
          To enable navigation, set{' '}
          <code
            style={{
              backgroundColor: '#2a2a4a',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
            }}
          >
            storyRouter.allowNavigation: true
          </code>{' '}
          in story parameters.
        </p>
        <button
          type="button"
          onClick={handleReload}
          style={{
            backgroundColor: '#fbbf24',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reload Story
        </button>
      </div>
    </div>
  )
}

/**
 * Component that renders story and detects navigation
 */
function StoryWithNavigationGuard({
  children,
  initialPath,
  onNavigate,
}: {
  children: React.ReactNode
  initialPath: string
  onNavigate: (path: string) => void
}) {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Navigation detected
    if (location.pathname !== initialPath) {
      onNavigate(location.pathname)
    }
  }, [location.pathname, initialPath, onNavigate])

  return <>{children}</>
}

/**
 * Loading fallback for lazy-loaded routes
 */
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#9ca3af',
      }}
    >
      Loading...
    </div>
  )
}

/**
 * Wrapper that renders story at a specific route with navigation guard
 */
function StoryRouterWrapper({
  children,
  initialPath,
  allowNavigation,
}: {
  children: React.ReactNode
  initialPath: string
  allowNavigation: boolean
}) {
  const [navigatedTo, setNavigatedTo] = useState<string | null>(null)

  // If navigation blocked and user tried to navigate, show fallback
  if (!allowNavigation && navigatedTo) {
    return <NavigationFallback attemptedPath={navigatedTo} />
  }

  if (allowNavigation) {
    // Full navigation mode - use app routes
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {appRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      </MemoryRouter>
    )
  }

  // Blocked navigation mode - render story at path, detect navigation
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="*"
            element={
              <StoryWithNavigationGuard
                initialPath={initialPath}
                onNavigate={setNavigatedTo}
              >
                {children}
              </StoryWithNavigationGuard>
            }
          />
        </Routes>
      </Suspense>
    </MemoryRouter>
  )
}

/**
 * Storybook decorator that provides routing for stories.
 *
 * @example
 * ```tsx
 * // Story with blocked navigation (default)
 * parameters: {
 *   storyRouter: {
 *     path: '/tickets',
 *   },
 * }
 *
 * // Story with full navigation
 * parameters: {
 *   storyRouter: {
 *     path: '/',
 *     allowNavigation: true,
 *   },
 * }
 * ```
 */
export const storyRouterDecorator: Decorator = (Story, context) => {
  const params: StoryRouterParameters | undefined = context.parameters.storyRouter

  // If no storyRouter params, render without router wrapper
  // (allows other router solutions like storybook-addon-remix-react-router to work)
  if (!params) {
    return <Story />
  }

  const { path = '/', allowNavigation = false } = params

  return (
    <StoryRouterWrapper
      initialPath={path}
      allowNavigation={allowNavigation}
    >
      <Story />
    </StoryRouterWrapper>
  )
}
