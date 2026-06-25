# storybook-addon-chronokit

Mock time in your Storybook stories. Chronokit replaces the global clock so a
story can render at any moment you choose — **frozen** for a deterministic
screenshot, or **fast-forwarded** so a minutes-long flow plays out in seconds.

**▶︎ Live demo & docs: https://thinkdx.github.io/storybook-addon-chronokit/**

![A flash-sale banner counting down through its warning and critical states and expiring in seconds, driven by a mocked clock running 30× real time](assets/flash-sale.gif)

It's a single preview decorator driven by one story parameter:

```ts
parameters: {
  date: {
    now: new Date('2025-06-01T12:00:00').getTime(),
    canProgress: true, // false = frozen
    clockSpeed: 30,     // optional real-time multiplier
  },
}
```

## Why?

Anything that renders differently depending on "what time is it now?" is painful
to build and review against the real clock:

- **Countdowns and timers** — you'd have to wait for them to reach interesting states.
- **Relative timestamps** ("2 minutes ago") — never look the same twice.
- **Expiry / scheduling UI** — sales, sessions, holds, tokens.

Chronokit makes those states **deterministic** (freeze the clock) or **fast**
(speed it up) without touching your component code — it mocks `Date` *and* the
scheduling APIs (`setTimeout`, `setInterval`, `requestAnimationFrame`).

## Requirements

- Storybook **9 or later**

## Installation

> **Status:** chronokit isn't published to npm yet — see [Status](#status). The
> setup below shows the intended API.

```sh
npm install --save-dev @thinkdx/storybook-addon-chronokit
```

## Setup

Register the decorator globally in `.storybook/preview`:

```ts
// .storybook/preview.ts
import type { Preview } from '@storybook/react-vite'
import { mockDateDecorator } from '@thinkdx/storybook-addon-chronokit'

const preview: Preview = {
  decorators: [mockDateDecorator],
}

export default preview
```

## Usage

Control the clock with the `date` parameter on any story, a component's `meta`,
or globally in `preview`.

### Freeze the clock (static time)

```ts
export const Frozen = {
  // Shorthand — a string, number (ms), or Date freezes the clock at that instant.
  parameters: { date: '2025-06-01T12:00:00' },
}
```

### Let it run, optionally fast (dynamic time)

```ts
export const FastForward = {
  parameters: {
    date: {
      now: '2025-06-01T12:00:00',
      canProgress: true,
      clockSpeed: 20, // 20× faster than wall time
    },
  },
}
```

### The `date` parameter

| Field         | Type                                       | Default | Description                                                                                |
| ------------- | ------------------------------------------ | ------- | ------------------------------------------------------------------------------------------ |
| `now`         | `string \| number \| Date`                 | —       | The mocked "current" time. Required (in object form).                                      |
| `canProgress` | `boolean \| ((context) => boolean)`        | `false` | `false` freezes the clock at `now`; `true` lets it advance. May be a predicate (see below). |
| `clockSpeed`  | `number`                                   | `1`     | Real-time multiplier while progressing — `30` runs time 30× faster.                        |

### Deciding `canProgress` per story

`canProgress` can be a function that receives the story context and returns a
boolean, so you can set the rule **once** instead of per story. A common case:
stories with a play function usually rely on waits and timers, so you want the
clock running for those — set this globally in `preview`:

```ts
const preview: Preview = {
  decorators: [mockDateDecorator],
  parameters: {
    date: {
      now: '2025-06-01T12:00:00',
      canProgress: (ctx) => !!ctx.playFunction, // run the clock for play stories
    },
  },
}
```

Individual stories can still override with an explicit `canProgress: true | false`.

## Using it in docs (MDX) pages

The decorator replaces **global** browser APIs, so two stories with different
mocked clocks can't share one document. When you embed multiple examples on a
single docs page, render each in its own iframe so each gets an isolated clock:

```ts
// .storybook/preview.ts
const preview: Preview = {
  decorators: [mockDateDecorator],
  parameters: {
    docs: { story: { inline: false } },
  },
}
```

## How it works

On each story, the decorator swaps the global `Date`, `setTimeout`,
`setInterval`, `requestAnimationFrame`, and `cancelAnimationFrame` for mocked
versions tied to the `date` parameter, then restores the originals when the story
unmounts — so a mocked clock in one story never leaks into the next.

Because the swap is global, your components don't need to know chronokit exists:
they call `Date.now()` / `requestAnimationFrame` as usual and transparently see
the mocked clock.

## Status

This is the first edition. The addon and a full set of examples and documentation
live in this Storybook (see the demo link above). Packaging for npm
(`exports`, build, published artifact) is in progress.

## License

MIT
