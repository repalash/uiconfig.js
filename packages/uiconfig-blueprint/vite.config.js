import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import json from "@rollup/plugin-json";
import dts from 'vite-plugin-dts'
import packageJson from "./package.json";
import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace';

const { name, version, author } = packageJson

export default defineConfig({
    optimizeDeps: {
        exclude: ['uiconfig.js'],
    },
    // define: {
    //     'process.env': process.env
    // },
    build: {
        sourcemap: true,
        lib: {
            entry: 'src/index.ts',
            formats: ['es', 'umd'],
            name: packageJson["name:umd"],
            fileName: (format) => (format === 'umd' ? packageJson["clean-package"].replace.main : packageJson["clean-package"].replace.module).replace('dist/', ''),
        },
        outDir: 'dist',
        emptyOutDir: true,
        commonjsOptions: {
            exclude: [/uiconfig.js/],
        },
        rollupOptions: {
            // external: ['react', 'react-dom'],
            output: {
                // globals: {
                //     react: 'React',
                // },
                // inlineDynamicImports: false,
            },
            // input: {
            //     main: 'index.html',
            //     ...Object.fromEntries(readdirSync('examples')
            //         .filter(f=>f.endsWith('.html'))
            //         .map((file) => [file.replace('.html', ''), `examples/${file}`])),
            // },
        }
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
                    postcssPlugin: 'modify-css-content', // todo: this should run when doing compile:css also
                    Once(root) {
                        // Modify to fix :root.bpx-flat :root twice when imported in renderer.scss
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
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            preventAssignment: true
        }),
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
