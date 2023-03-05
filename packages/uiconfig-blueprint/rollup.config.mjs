// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import license from 'rollup-plugin-license'
import packageJson from './package.json' assert {type: 'json'};
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import path from 'path'

const { name, version, main, module, browser, author } = packageJson
const isProduction = process.env.NODE_ENV === 'production'

const settings = {
  globals: {
  },
  sourcemap: true
}

export default {
  input: './src/index.ts',
  output: [{
    file: main,
    name: main,
    ...settings,
    format: 'umd',
    plugins: [
      isProduction && terser()
    ]
  }, {
    file: module,
    ...settings,
    name: name,
    format: 'es'
  }],
  external: [ "uiconfig" ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify( isProduction ? 'production' : 'development' )
    }),
    json(),
    postcss({
      extensions: ['.sass', '.scss', '.css'],
      sourceMap: true,
      plugins: [
        autoprefixer
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
    }),
    commonjs({
      include: 'node_modules/**',
      extensions: [ '.js' ],
      ignoreGlobal: false,
      sourceMap: false
    }),
    license({
      banner: `
        ${name} v${version}
        Copyright 2022<%= moment().format('YYYY') > 2022 ? '-' + moment().format('YYYY') : null %> ${author}
      `
    })
  ]
}
