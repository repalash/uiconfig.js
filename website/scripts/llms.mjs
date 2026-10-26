// Markdown for AI agents and other readers of plain text (https://llmstxt.org): llms.txt, llms-full.txt, the guide,
// the renderer READMEs, the API reference (typedoc-plugin-markdown, website/dist-docs-md) and each example as
// examples/<slug>.md. scripts/assemble-pages.mjs writes them into the site; everything comes from the sources, so it
// changes with them.
import {readFileSync} from 'node:fs'
import path from 'node:path'
import {examples, topics} from '../src/examples/registry.js'
import {exampleFile, rendererNames, setupCode} from './examples-pages.mjs'
import {sampleSource} from './highlight.mjs'
import {absoluteUrl} from './site.mjs'

const summary = 'uiconfig.js describes a user interface as plain config objects (or TypeScript decorators) bound to ' +
    'your data. A renderer turns a config into a live panel: uiconfig-tweakpane (Tweakpane) or uiconfig-blueprint ' +
    '(Blueprint, React). The config code has no dependency; only the page that shows the panel imports a renderer.'

// facts that an agent writing uiconfig code needs first
const notes = `- JavaScript code needs only a renderer: \`npm install uiconfig-tweakpane\` (or \`uiconfig-blueprint\`), then \`new UI().appendChild(config)\`. TypeScript code also installs \`uiconfig.js\` for the types (\`UiObjectConfig\`) and the decorators (\`experimentalDecorators: true\` in tsconfig.json).
- \`type\` picks the component: folder, panel, input, number, slider, checkbox/toggle, dropdown/select, button, color, vec2/vec3/vec4, monitor; Tweakpane adds textarea, tabs and separator.
- A component reads and writes its value through \`property: [object, key]\`, \`value\` (kept in the config), \`getValue\`/\`setValue\`, or a \`path\` into the \`value\` of its folder.
- After code changes the data, call \`config.uiRefresh(true)\` to show it. \`hidden\`, \`disabled\`, \`readOnly\`, \`label\` and \`children\` entries can be functions; they run on each refresh.
- A renderer keeps its state in the config objects: one config object cannot be shown by two renderers at once. Build one config per renderer from a function.
- Color and vector components create their values with the classes in \`ui.THREE\`: set it to three.js \`{Color, Vector2, Vector3, Vector4}\`.`

/** The Markdown page of an example: what it shows, the renderers, the setup code and the code that runs. */
export function exampleMarkdown(example) {
    const file = exampleFile(example.slug)
    const lang = file.endsWith('.ts') ? 'ts' : 'js'
    const topic = topics.find(t => t.id === example.topic)
    const renderers = example.renderers.map(r => rendererNames[r]).join(' and ')
    return [
        `# ${example.title}`,
        '',
        example.summary,
        '',
        `- Topic: ${topic.title}`,
        `- Renderers: ${renderers}${example.renderers.length === 1 ? ' only' : ''}`,
        `- Live page: ${absoluteUrl(`examples/${example.slug}.html`)}`,
        `- Source: https://github.com/repalash/uiconfig.js/blob/master/website/src/examples/code/${path.basename(file)}`,
        ...(example.note ? ['', `Note: ${example.note}`] : []),
        '',
        `## Setup (${rendererNames[example.renderers[0]]})`,
        '',
        '```js',
        setupCode(example, example.renderers[0]),
        '```',
        '',
        '## Code',
        '',
        '```' + lang,
        sampleSource(readFileSync(file, 'utf8')),
        '```',
        '',
    ].join('\n')
}

/**
 * The agent docs, as {path in the site: content}.
 * @param {{guide: string, readmes: Record<string, string>, api: Record<string, string>}} sources - Markdown texts:
 *   the uiconfig.js README, the renderer READMEs and the API reference of each package
 */
export function agentDocs({guide, readmes, api}) {
    const files = {}
    files['md/uiconfig.js.md'] = guide
    for (const [pkg, text] of Object.entries(readmes)) files[`md/${pkg}.md`] = text
    for (const [pkg, text] of Object.entries(api)) files[`md/api/${pkg}.md`] = text
    for (const e of examples) files[`examples/${e.slug}.md`] = exampleMarkdown(e)

    const link = (title, rel, about) => `- [${title}](${absoluteUrl(rel)})${about ? `: ${about}` : ''}`
    files['llms.txt'] = [
        '# uiconfig.js',
        '',
        `> ${summary}`,
        '',
        notes,
        '',
        '## Docs',
        '',
        link('Guide', 'md/uiconfig.js.md', 'defining configs as objects, classes and decorators, the full config reference, binding, three.js'),
        link('uiconfig-tweakpane', 'md/uiconfig-tweakpane.md', 'install, components, themes, three.js'),
        link('uiconfig-blueprint', 'md/uiconfig-blueprint.md', 'install, components, use as a React library'),
        link('Everything in one file', 'llms-full.txt', 'the guide, the renderer READMEs, every example and the API reference'),
        '',
        '## API reference',
        '',
        ...Object.keys(api).map(pkg => link(pkg, `md/api/${pkg}.md`)),
        '',
        '## Examples',
        '',
        ...topics.flatMap(t => examples.filter(e => e.topic === t.id)
            .map(e => link(`${t.title}: ${e.title}`, `examples/${e.slug}.md`, `${e.renderers.map(r => rendererNames[r]).join(', ')}`))),
        '',
        '## Optional',
        '',
        link('Website', '', 'live panels, a playground, the component list'),
        link('HTML API docs', 'docs/'),
        '- [Changelog of uiconfig.js](https://github.com/repalash/uiconfig.js/blob/master/packages/uiconfig.js/CHANGELOG.md)',
        '',
    ].join('\n')

    const part = (title, url, text) => `\n\n---\n\n<!-- ${title}: ${url} -->\n\n${text.trim()}\n`
    files['llms-full.txt'] = `# uiconfig.js\n\n> ${summary}\n\n${notes}\n` +
        part('Guide (uiconfig.js README)', absoluteUrl('md/uiconfig.js.md'), guide) +
        Object.entries(readmes).map(([pkg, text]) => part(`${pkg} README`, absoluteUrl(`md/${pkg}.md`), text)).join('') +
        part('Examples', absoluteUrl('examples/'), '# Examples\n\nEach example runs at its live page; the code is the file that the page runs.') +
        examples.map(e => part(`Example: ${e.title}`, absoluteUrl(`examples/${e.slug}.md`), exampleMarkdown(e).replace(/^# /, '## '))).join('') +
        Object.entries(api).map(([pkg, text]) => part(`API reference: ${pkg}`, absoluteUrl(`md/api/${pkg}.md`), text)).join('')
    return files
}
