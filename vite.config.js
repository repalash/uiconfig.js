import {defineConfig} from 'vite'
import json from '@rollup/plugin-json';
import dts from 'vite-plugin-dts'
import packageJson from './package.json';
import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace';
import path from 'node:path';

const isProd = process.env.NODE_ENV === 'production'
const { name, version, author } = packageJson
const {module, browser} = packageJson

const globals = {
    'ts-browser-helpers': 'ts-browser-helpers',
}

export default defineConfig({
    optimizeDeps: {
        exclude: [],
    },
    // define: {
    //     'process.env': process.env
    // },
    build: {
        sourcemap: true,
        minify: isProd,
        cssMinify: isProd,
        cssCodeSplit: false,
        watch: !isProd ? {
            buildDelay: 1000,
        } : null,
        lib: {
            entry: 'src/index.ts',
            formats: isProd && browser ? ['es', 'umd'] : ['es'],
            name: name,
            fileName: (format) => (format === 'umd' ? browser : module).replace('dist/', ''),
        },
        outDir: 'dist',
        emptyOutDir: isProd,
        commonjsOptions: {
            exclude: [],
        },
        rollupOptions: {
            output: {
                // inlineDynamicImports: false,
                globals
            },
            external: Object.keys(globals),
        },
    },
    plugins: [
        isProd ? dts({tsconfigPath: './tsconfig.json'}) : null,
        replace({
            'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
            preventAssignment: true,
        }),
        json(),
        license({
            banner: `
        @license
        ${name} v${version}
        Copyright 2022<%= moment().format('YYYY') > 2022 ? '-' + moment().format('YYYY') : null %> ${author}
        ${packageJson.license} License
        See ./dependencies.txt for bundled third-party dependencies and licenses.
      `,
            thirdParty: {
                output: path.join(__dirname, 'dist', 'dependencies.txt'),
                includePrivate: true, // Default is false.
            },
        }),
    ],
})
