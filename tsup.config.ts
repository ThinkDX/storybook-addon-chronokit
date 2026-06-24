import { defineConfig } from 'tsup'

// Builds the publishable addon surface (src/addon) to dist as ESM + CJS.
// Type declarations are emitted separately by `tsc -p tsconfig.build.json`
// (tsup's dts step doesn't resolve the Storybook package types reliably).
// react and the Storybook packages are peer dependencies and stay external.
export default defineConfig({
  entry: { index: 'src/addon/index.ts' },
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: ['react', 'react-dom', /^@storybook\//, 'storybook'],
})
