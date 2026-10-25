// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import license from 'rollup-plugin-license'
import del from 'rollup-plugin-delete';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {globSync} from 'glob';

const configPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../package.json'
);
const packageJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { name, version, author } = packageJson
const isProduction = process.env.NODE_ENV === 'production'

export default {
  input: globSync('examples/src/**/*.ts'),
  output: {
    format: 'esm',
    dir: 'examples/dist',
    // preserveModules: true,
    // preserveModulesRoot: 'examples/src',
    // entryFileNames: '[name].mjs',
    plugins: [
      isProduction && terser()
    ],
    paths: {
      uiconfig: "./../../dist/index.mjs",
    },
    sourcemap: true,
  },
  external: ['uiconfig'],
  plugins: [
    del({
      targets: 'examples/dist/*',
      runOnce: true
    }),
    json(),
    // multiInput({
    //   relative: 'examples/src',
    //   // transformOutputPath: (output, input) => {
    //   //   console.log(output, input)
    //   //   return output.replace(/\.js$/, '.mjs')
    //   // },
    // }),
    resolve({
    }),
    typescript({
      tsconfig: 'examples/tsconfig.json',
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
