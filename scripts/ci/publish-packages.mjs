import path from 'node:path'
import fs from 'node:fs'
import {execFileSync} from 'node:child_process'
import {isPublished, repoRoot, workspacePackages} from './packages.mjs'

/**
 * Builds, checks and publishes the packages that publish-check.mjs listed (PUBLISH_PACKAGES, a
 * JSON array of {name, version, dir}), in that order (dependencies first), then pushes the
 * release tag <name>-<version> for each. Stops at the first failure: a dependent is never
 * published without the package it depends on.
 *
 * Per package:
 * 1. build: `npm run build` of each workspace package it depends on, then its own `prepack`
 *    (build, examples and docs; the published files include docs/).
 * 2. check: dist/ has an index file, and every relative import in the .d.ts files of dist/ and
 *    lib/ ends in .js (consumers on moduleResolution node16/nodenext need it).
 * 3. publish: clean-package (drops scripts and devDependencies), npm pack, npm publish
 *    --provenance. Authentication is npm trusted publishing (OIDC). A prerelease version goes to
 *    the dist-tag `next` unless package.json sets publishConfig.tag.
 *
 * PUBLISH_DRY_RUN=1 runs everything with `npm publish --dry-run`, without provenance and tags
 * (for a local test).
 */

const requested = JSON.parse(process.env.PUBLISH_PACKAGES || '[]')
const dryRun = process.env.PUBLISH_DRY_RUN === '1'
if (!requested.length) {
    console.log('No packages to publish.')
    process.exit(0)
}

const all = workspacePackages()
const byName = new Map(all.map(p => [p.name, p]))
const run = (cmd, args, cwd = repoRoot) => execFileSync(cmd, args, {cwd, stdio: 'inherit'})
const capture = (cmd, args, cwd) => execFileSync(cmd, args, {cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']}).trim()

const built = new Set()
function buildDeps (p) {
    for (const d of p.internalDeps) {
        const dep = byName.get(d)
        buildDeps(dep)
        if (built.has(d)) continue
        console.log(`\nBuilding dependency ${d}`)
        run('npm', ['run', 'build', '-w', d])
        built.add(d)
    }
}

const relSpecRE = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+(?=['"])|\bdeclare\s+module\s+)(['"])(\.{1,2}(?:\/[^'"\n]*)?)\2/g
function checkDeclarations (pkgDir) {
    const bad = []
    const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])
    for (const sub of ['dist', 'lib']) {
        const dir = path.join(pkgDir, sub)
        if (!fs.existsSync(dir)) continue
        for (const file of walk(dir).filter(f => f.endsWith('.d.ts'))) {
            for (const m of fs.readFileSync(file, 'utf8').matchAll(relSpecRE)) {
                if (!m[3].endsWith('.js')) bad.push(`${path.relative(repoRoot, file)}: '${m[3]}'`)
            }
        }
    }
    if (bad.length) throw new Error('Relative imports without .js in the declarations:\n' + bad.join('\n'))
}

for (const {name, version} of requested) {
    const p = byName.get(name)
    if (!p || p.version !== version || p.private) throw new Error(`${name}@${version} is not a public workspace package at that version`)
    const cwd = path.join(repoRoot, p.dir)
    if (isPublished(name, version)) {
        console.log(`\n${name}@${version} is already on npm, skipped`)
        continue
    }

    console.log(`\nBuilding ${name}@${version}`)
    buildDeps(p)
    run('npm', ['run', p.pkg.scripts?.prepack ? 'prepack' : 'build', '-w', name])
    built.add(name)

    const dist = path.join(cwd, 'dist')
    if (!fs.existsSync(dist) || !fs.readdirSync(dist).some(f => f.startsWith('index'))) throw new Error(`${p.dir}/dist has no index file`)
    checkDeclarations(cwd)

    const prerelease = /^[^+]*-/.test(version)
    const tagArgs = prerelease && !p.pkg.publishConfig?.tag ? ['--tag', 'next'] : []
    run('npx', ['--no-install', 'clean-package'], cwd)
    let tarball
    try {
        tarball = capture('npm', ['pack', '--silent'], cwd).split('\n').pop()
        console.log(`Packed ${tarball}`)
        run('npm', ['publish', ...(dryRun ? ['--dry-run'] : ['--provenance']), ...tagArgs, tarball], cwd)
    } finally {
        run('npx', ['--no-install', 'clean-package', 'restore'], cwd)
        if (tarball) fs.rmSync(path.join(cwd, tarball), {force: true})
    }
    console.log(`✓ Published ${name}@${version}${tagArgs.length ? ' (dist-tag next)' : ''}${dryRun ? ' (dry run)' : ''}`)
    if (dryRun) continue

    const tag = `${name}-${version}`
    try {
        run('git', ['tag', tag])
        run('git', ['push', 'origin', `refs/tags/${tag}`])
        console.log(`✓ Tagged ${tag}`)
    } catch (e) {
        console.warn(`! Published, but the tag ${tag} was not pushed: ${e.message}`)
    }
}
