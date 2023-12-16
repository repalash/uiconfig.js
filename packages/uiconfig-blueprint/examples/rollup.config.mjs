// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import license from 'rollup-plugin-license'
import packageJson from '../package.json' assert {type: 'json'};
import multiInput from 'rollup-plugin-multi-input';
import del from 'rollup-plugin-delete';

const { name, version, author } = packageJson
const isProduction = process.env.NODE_ENV === 'production'

export default {
  input: ['examples/src/**/*'],
  output: {
    format: 'esm',
    dir: 'examples/dist',
    // entryFileNames: '[name].mjs',
    plugins: [
      isProduction && terser()
    ],
    paths: {
      'uiconfig-blueprint': "./../../dist/index.mjs",
    },
    sourcemap: true
  },
  // external: ['uiconfig.js'],
  plugins: [
    del({
      targets: 'examples/dist/*',
      runOnce: true
    }),
    json(),
    multiInput.default({
      relative: 'examples/src',
      // transformOutputPath: (output, input) => {
      //   console.log(output, input)
      //   return output.replace(/\.js$/, '.mjs')
      // },
    }),
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
