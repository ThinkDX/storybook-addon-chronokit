// tsc emits .d.ts (ESM) declarations. Duplicate them as .d.cts so the package's
// "require" export condition has matching CJS types under node16/nodenext.
import { copyFileSync } from 'node:fs'

for (const name of ['index', 'mockDateDecorator']) {
  copyFileSync(`dist/${name}.d.ts`, `dist/${name}.d.cts`)
}
