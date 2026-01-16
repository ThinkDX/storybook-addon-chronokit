import { index, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('routes/movies.tsx'),
  route('tickets', 'routes/tickets.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
