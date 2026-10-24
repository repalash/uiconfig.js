import fs from 'node:fs'
import {changelogEntry, isPublished, workspacePackages} from './packages.mjs'

/**
 * Lists the public workspace packages whose version is not on npm yet, in build order.
 * Fails when one of them has no CHANGELOG.md entry for that version, so nothing is published.
 * Private packages ("private": true) are skipped.
 *
 * GitHub output: packages=<JSON [{name, version, dir}]>, has_packages=true|false
 */

const toPublish = []
const errors = []
for (const p of workspacePackages()) {
    if (p.private) continue
    if (isPublished(p.name, p.version)) {
        console.log(`  ${p.name}@${p.version} is on npm`)
        continue
    }
    if (!changelogEntry(p.dir, p.version)) errors.push(`${p.name}@${p.version}: no entry for ${p.version} in ${p.dir}/CHANGELOG.md`)
    toPublish.push({name: p.name, version: p.version, dir: p.dir})
    console.log(`→ ${p.name}@${p.version} is not on npm`)
}

if (errors.length) {
    console.error('\n' + errors.join('\n'))
    process.exit(1)
}

console.log(toPublish.length ? `\n${toPublish.length} package(s) to publish.` : '\nNothing to publish.')

if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `packages=${JSON.stringify(toPublish)}\nhas_packages=${toPublish.length > 0}\n`)
}
