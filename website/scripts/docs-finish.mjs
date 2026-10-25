// Finishes the API docs that `typedoc` (typedoc.json) writes to dist-docs: dist-docs/assets/custom.css becomes the
// site's font faces (Inter and JetBrains Mono from src/styles/fonts.css, with their files copied to assets/fonts),
// src/styles/tokens.css and src/docs/docs.css, so that the docs use the site's tokens. TypeDoc links custom.css
// from every page (the customCss option) but copies only that one file, so the fonts and tokens are added here.
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assets = path.join(website, 'dist-docs/assets')
if (!existsSync(path.join(assets, 'custom.css'))) {
    console.error('dist-docs/assets/custom.css is missing: run typedoc first (npm run docs -w uiconfig-website)')
    process.exit(1)
}
const require = createRequire(path.join(website, 'package.json'))
const read = rel => readFileSync(path.join(website, rel), 'utf8')

mkdirSync(path.join(assets, 'fonts'), {recursive: true})
const faces = read('src/styles/fonts.css').match(/@font-face \{[\s\S]*?\n\}/g)
    .filter(face => /font-family: '(Inter Variable|JetBrains Mono)'/.test(face))
    .map(face => face.replace(/url\('([^']+)'\)/g, (_, spec) => {
        const name = path.basename(spec)
        copyFileSync(require.resolve(spec), path.join(assets, 'fonts', name))
        return `url('fonts/${name}')`
    }))

writeFileSync(path.join(assets, 'custom.css'), [
    '/* uiconfig site theme for TypeDoc: written by website/scripts/docs-theme.mjs */',
    ...faces, read('src/styles/tokens.css'), read('src/docs/docs.css'),
].join('\n\n'))
console.log(`dist-docs/assets/custom.css: ${faces.length} font faces, tokens.css, docs.css`)
