# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + Vite + React Router v7 (Framework mode) + Storybook 10 demo project.

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** as build tool
- **React Router v7** in Framework mode (file-based routing)
- **Storybook 10** with interactions and Vitest addon (no docs/MDX)
- **Vitest** for unit testing
- **Biome** for linting and formatting

## Project Structure

- `src/` - All source code
  - `app/` - React Router routes and layouts
    - `root.tsx` - Root layout
    - `routes/` - File-based routes
    - `routes.ts` - Route configuration
  - `components/` - UI components with stories and tests
- `.storybook/` - Storybook configuration
- `tests/` - Test setup files

## Import Alias

Use `@/` to reference the `src/` directory:

```ts
import { Counter } from '@/components'
import { CountdownSimple } from '@/components/CountdownSimple'
```

## Code Style

- **Prefer `type` over `interface`** for type definitions
- **Place local utility functions after the main component function**, not before

```tsx
// Good
export function MyComponent() {
  return <div>{formatValue(value)}</div>
}

function formatValue(val: string) {
  return val.toUpperCase()
}

// Bad - utility function before component
function formatValue(val: string) {
  return val.toUpperCase()
}

export function MyComponent() {
  return <div>{formatValue(value)}</div>
}
```

## Commands

- `npm run dev` - Start React Router dev server (port 5173)
- `npm run build` - Build for production
- `npm run storybook` - Start Storybook (port 6006)
- `npm run build-storybook` - Build Storybook
- `npm run test` - Run Vitest in watch mode
- `npm run test:run` - Run Vitest once
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome
- `npm run check` - Run Biome lint and format (with auto-fix)
- `npm run typecheck` - Run TypeScript type checking

## After Making Changes

Always ensure the following pass before finishing:

```bash
npm run check      # Linting and formatting
npm run typecheck  # TypeScript errors
npm run test:run   # Unit tests
```

## Notes

- Storybook uses a separate Vite config (`.storybook/vite.config.ts`) to avoid conflicts with React Router's Vite plugin
- Route mocking in stories uses `storybook-addon-remix-react-router`
- Docs/autodocs are disabled globally via `tags: ['!autodocs']` in preview.ts
