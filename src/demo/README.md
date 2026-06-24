# Demo

Example components and stories that exercise the chronokit addon. **None of this
ships as part of the published addon** — the addon itself lives in [`../addon`](../addon).

These examples show the two ways the addon's `date` story parameter is used:

- **Static time** — freeze the clock at an exact moment (`canProgress: false`) so a
  component renders deterministically. See `FlashSale` → `FrozenInFinalMinute`,
  `FrozenEarly`, `FrozenAfterEnd`.
- **Controlled dynamic time** — let the clock advance, optionally sped up
  (`canProgress: true`, `clockSpeed`), to watch time-based transitions without
  waiting. See `FlashSale` → `WatchItExpire`, and the `FastForward` countdown stories.
