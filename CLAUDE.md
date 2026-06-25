# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`storybook-addon-chronokit` — a Storybook addon (supports Storybook 9+) for mocking time in stories. The
core is a preview decorator (`mockDateDecorator`) that replaces the global `Date` (and
`setTimeout`/`setInterval`/`requestAnimationFrame`) so stories can freeze time, let it
progress, or run a sped-up clock. The `Countdown` and `FlashSale` components are demo
fixtures that exercise the addon.

## Tech Stack

- **React 19** with TypeScript
- **Storybook 10** (`@storybook/react-vite`) with the a11y and Vitest addons
- **Vitest** for unit tests and Storybook component tests (Playwright browser mode)
- **Biome** for linting and formatting

## Project Structure

The addon and the demo are kept in separate spaces so it's clear what ships:

- `src/addon/` - **the chronokit addon** (the publishable surface)
  - `mockDateDecorator.ts` - the date/time mocking decorator + `date` parameter type
  - `index.ts` - public entry point
- `src/demo/` - **example code, NOT part of the addon**
  - `FlashSale.tsx` - real-world showcase (static + dynamic time)
  - `Countdown.tsx` - countdown demo component (requestAnimationFrame-based), stories, tests
  - `TimerMechanisms.tsx` - one stopwatch per scheduling API, proving the addon controls all three
  - `datetime.ts` - time-remaining calculation helper
- `src/docs/` - **MDX tutorial pages** (Introduction + Guide/\*); Storybook is the docs site
- `.storybook/` - Storybook config; `preview.tsx` registers the decorator globally
- `tests/` - test setup files

## The `date` parameter

Stories control mocked time via the `date` story parameter (typed in `mockDateDecorator.ts`):

```ts
parameters: {
  date: {
    now: new Date('2025-01-15T12:00:00').getTime(),
    canProgress: true, // false = frozen clock
    clockSpeed: 20,     // optional real-time multiplier
  },
}
```

`canProgress` may also be a predicate `(context) => boolean` (resolved in `applyMock` against the story context), e.g. `(ctx) => !!ctx.playFunction` to run the clock only for stories with a play function. Read at apply-time via a ref so the re-apply effect doesn't depend on context identity.

## Import Alias

Use `@/` to reference the `src/` directory:

```ts
import { mockDateDecorator } from '@/addon'
import { Countdown } from '@/demo/Countdown'
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
npm run test:run   # Unit + Storybook tests
```

## Notes

- Autodocs are disabled via `tags: ['!autodocs']`; documentation is authored as explicit `.mdx` pages in `src/docs/`.
- The mock replaces **global** `Date`/timers, so multiple examples on one docs page would share (and clobber) a single clock. `preview.tsx` sets `docs.story.inline: false` so each embedded example renders in its own iframe with an isolated clock.
- Storybook deploys to GitHub Pages on push to `main` via `.github/workflows/deploy-storybook.yml` (https://thinkdx.github.io/storybook-addon-chronokit/).
- The published addon is just `src/addon`. npm packaging (build/`exports`/published artifact) is still in progress.
