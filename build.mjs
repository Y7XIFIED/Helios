import { build } from 'esbuild';
await build({
  entryPoints: ['src/ink/entry.ts'],
  outdir: 'dist/ink',
  bundle: true,
  splitting: true,
  format: 'esm',
  target: ['es2020'],
  minify: true,
  legalComments: 'linked',
  define: { 'import.meta.env.DEV': 'false' },
});
console.log('Ink transition bundled into dist/ink.');
