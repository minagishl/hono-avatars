import { build } from 'esbuild';
import { wasmLoader } from 'esbuild-plugin-wasm';

const options = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/_worker.js',
  plugins: [wasmLoader()],
  external: ['wbg'],
};

build(options).catch((err) => {
  process.stderr.write(err.stderr);
  process.exit(1);
});
