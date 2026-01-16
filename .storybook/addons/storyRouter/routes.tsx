/**
 * Storybook route configuration that mirrors the app routes.
 * Import actual page components to ensure consistency.
 */
import { lazy } from 'react'

// Lazy load route components to match app behavior
const MoviesPage = lazy(() => import('../../../src/app/routes/movies'))
const TicketsPage = lazy(() => import('../../../src/app/routes/tickets'))
const NotFoundPage = lazy(() => import('../../../src/app/routes/not-found'))

export const appRoutes = [
  {
    path: '/',
    element: <MoviesPage />,
  },
  {
    path: '/tickets',
    element: <TicketsPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]

// Export individual routes for stories that need specific ones
export { MoviesPage, TicketsPage, NotFoundPage }
