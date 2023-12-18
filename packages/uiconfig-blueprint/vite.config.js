import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import json from "@rollup/plugin-json";
import dts from 'vite-plugin-dts'
import packageJson from "./package.json";
import license from 'rollup-plugin-license'

const { name, version, author } = packageJson

export default defineConfig({
    build: {
        sourcemap: true,
        outDir: 'dist',
        lib: {
            entry: 'src/index.ts',
            formats: ['es', 'umd'],
            name: packageJson["name:umd"],
            fileName: (format) => (format === 'umd' ? packageJson["clean-package"].replace.main : packageJson["clean-package"].replace.module).replace('dist/', ''),
        },
        emptyOutDir: true,
        // rollupOptions: {
        //     external: ['react', 'react-dom'],
        //     output: {
        //         globals: {
        //             react: 'React',
        //         },
        //     },
        // }
    },
    resolve: {
        alias: [
            {
                // this is required for the SCSS modules
                find: /^~(.*)$/,
                replacement: '$1',
            },
        ],
    },
    css: {
        postcss: {
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
                // autoprefixer,
            ],
        }
    },
    plugins: [
        dts(),
        react(),
        // del({
        //     targets: 'dist/*',
        //     runOnce: true
        // }),
        // replace({
        //     'process.env.NODE_ENV': JSON.stringify( isProduction ? 'production' : 'development' ),
        //     preventAssignment: true
        // }),
        json(),
        // postcss({
        //     extensions: ['.sass', '.scss', '.css'],
        //     sourceMap: true,
        //     plugins: [
        //         autoprefixer
        //     ],
        //     use: [
        //         [
        //             'sass', {
        //             includePaths: [path.resolve('node_modules')]
        //         }
        //         ]
        //     ]
        // }),
        // resolve({
        // }),
        // typescript({
        //     compilerOptions: {
        //         "sourceRoot": "../src",
        //         "declarationDir": "dist",
        //         "declarationMap": true,
        //     }
        // }),
        // commonjs({
        //     include: 'node_modules/**',
        //     extensions: [ '.js' ],
        //     ignoreGlobal: false,
        //     sourceMap: false
        // }),
        license({
            banner: `
        @license
        ${name} v${version}
        Copyright 2022<%= moment().format('YYYY') > 2022 ? '-' + moment().format('YYYY') : null %> ${author}
        ${packageJson.license} License
      `
        })
    ]
})
