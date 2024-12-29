// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import license from 'rollup-plugin-license'
import del from 'rollup-plugin-delete';
import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const configPath = join(
    dirname(fileURLToPath(import.meta.url)),
    './package.json'
);
const packageJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { name, version, author } = packageJson
const { main, module } = packageJson
const isProduction = process.env.NODE_ENV === 'production'

const settings = {
    globals: {
    },
  sourcemap: true
}

export default {
  input: './src/index.ts',
  output: [{
    file: module,
    ...settings,
    name: name,
    format: 'es'
  }],
  external: [ ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true
    }),
    json(),
    resolve({
    }),
    typescript({
      compilerOptions: {
        "sourceRoot": "./src",
        "declarationDir": "./dist",
        "declarationMap": true,
      }
    }),
    commonjs({
      include: 'node_modules/**',
      extensions: [ '.js' ],
      ignoreGlobal: false,
      sourceMap: false
    }),
    license({
      banner: `
        @license
        ${name} v${version}
        Copyright 2022<%= moment().format('YYYY') > 2022 ? '-' + moment().format('YYYY') : null %> ${author}
        ${packageJson.license} License
      `,
    })
  ]
}
