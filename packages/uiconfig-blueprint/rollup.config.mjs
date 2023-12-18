// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import license from 'rollup-plugin-license'
import packageJson from './package.json' assert {type: 'json'};
import del from 'rollup-plugin-delete';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import path from 'path'

const { name, version, author } = packageJson
const { main, module } = packageJson["clean-package"].replace
const isProduction = process.env.NODE_ENV === 'production'

const settings = {
  globals: {
  },
  sourcemap: true
}

export default {
  input: './src/index.ts',
  output: [
  //     {
  //   file: main,
  //   name: packageJson['name:umd'],
  //   ...settings,
  //   format: 'umd',
  //   plugins: [
  //     isProduction && terser()
  //   ]
  // },
    {
    dir: 'dist',
    ...settings,
    name: name,
    format: 'es',
  }],
  external: [ ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( isProduction ? 'production' : 'development' ),
      preventAssignment: true
    }),
    json(),
    postcss({
      extensions: ['.sass', '.scss', '.css'],
      sourceMap: true,
      plugins: [
        {
          postcssPlugin: 'modify-css-content',
          Once(root) {
            // Modify to fix :root.bpx-carbon :root twice when imported in renderer.scss
            root.walkRules(rule => {
              rule.selector = rule.selector.replace(/:root.bpx-(.*) :root/g, ':root.bpx-$1');
            });
          },
        },
        autoprefixer,
      ],
      use: [
        [
          'sass', {
          includePaths: [path.resolve('node_modules')]
        }
        ]
      ]
    }),
    resolve({
    }),
    typescript({
      compilerOptions: {
        "sourceRoot": "../src",
        "declarationDir": "dist",
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
      `
    })
  ]
}
