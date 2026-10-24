// Discord notice for the publish workflow: which packages wait for approval (with their commits since
// the last <name>-<version> tag), or that the check failed. No notice when DISCORD_WEBHOOK_URL is unset.
// Env: DISCORD_WEBHOOK_URL (repo secret), PACKAGES (JSON [{name, version, dir}]), CHECK_OK.
import {execSync} from 'node:child_process'

const {DISCORD_WEBHOOK_URL: url, PACKAGES, CHECK_OK, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID} = process.env
if (!url) {
    console.log('DISCORD_WEBHOOK_URL is not set; no notice.')
    process.exit(0)
}
const run = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
const packages = JSON.parse(PACKAGES || '[]')
const sh = (cmd) => { try { return execSync(cmd, {encoding: 'utf8'}).trim() } catch { return '' } }

const lines = []
if (CHECK_OK !== 'true') {
    lines.push('❌ **uiconfig**: the publish check failed (for example a missing CHANGELOG entry); nothing is published.', `Log: ${run}`)
} else {
    lines.push(`📦 Waiting for approval to publish to npm: ${packages.map(p => `**${p.name}@${p.version}**`).join(', ')}`, `Approve: ${run}`)
    for (const p of packages) {
        const prev = sh(`git describe --tags --abbrev=0 --match '${p.name}-[0-9]*' 2> /dev/null`)
        const log = sh(`git log --oneline --no-merges ${prev ? prev + '..' : ''}HEAD -10 -- ${p.dir}`)
        if (!log) continue
        lines.push('', `${p.name}:`, ...log.split('\n').map(l => `- \`${l.slice(0, l.indexOf(' '))}\` ${l.slice(l.indexOf(' ') + 1)}`))
    }
}
const res = await fetch(url, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({content: lines.join('\n').slice(0, 1990)}),
})
if (!res.ok) {
    console.error(`Discord webhook: HTTP ${res.status}`)
    process.exit(1)
}
