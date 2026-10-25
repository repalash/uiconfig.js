# uiconfig website

The landing page of uiconfig.js, published with the API docs and the example pages on GitHub Pages
(https://repalash.com/uiconfig.js/). Vite and plain TypeScript; a private workspace package.

The page imports `uiconfig.js`, `uiconfig-tweakpane` and `uiconfig-blueprint` from this repository (their built
`dist/`), so build them first. From the repository root:

```bash
npm install
npm run build -w uiconfig.js
npm run build -w uiconfig-tweakpane -w uiconfig-blueprint
npm run dev -w uiconfig-website       # dev server
npm run build -w uiconfig-website     # type check and static build in website/dist
npm run preview -w uiconfig-website   # serves website/dist
npm run docs -w uiconfig-website      # API docs in website/dist-docs
```

The dev server serves the example pages too: `/examples/`.

After a change in one of the packages, build it again.

## The Pages site

`npm run pages` (repository root) builds everything the site needs and assembles it in `website/_site`, as the
workflow [docs-pages.yml](../.github/workflows/docs-pages.yml) does:

| Path | Content |
|---|---|
| `/` | this page (`website/dist`) |
| `/examples/` | the example pages (`website/dist/examples`) |
| `/docs/` | API docs of uiconfig.js, uiconfig-tweakpane and uiconfig-blueprint, one TypeDoc site (`website/dist-docs`) |
| `/dist/` | the built uiconfig.js package |
| `/README.md`, `/LICENSE` | of uiconfig.js |

Older URLs keep working: [scripts/assemble-pages.mjs](scripts/assemble-pages.mjs) writes a redirect page at each
old path, to the page that replaced it.

| Old path | Now |
|---|---|
| `/classes/X.html` (the uiconfig.js TypeDoc at the root), `/docs/classes/X.html` | `/docs/classes/uiconfig.js.X.html` |
| `/docs/uiconfig-tweakpane/classes/X.html`, `/docs/uiconfig-blueprint/…` | `/docs/classes/uiconfig-tweakpane.X.html`, … |
| `/docs/uiconfig-tweakpane/index.html`, `modules.html` | `/docs/modules/uiconfig-tweakpane.html` |
| `/examples/html/*.html`, `/examples/examples/*.html` | the example that covers the page, in the renderer that the page used |
| `/examples/uiconfig-tweakpane/…`, `/examples/uiconfig-blueprint/…` | the same, with `?renderer=` of that package |

All URLs are relative (`base: './'` in [vite.config.js](vite.config.js)), so the site works under
`/uiconfig.js/` and at the root of a domain.

To check the result locally, serve `website/_site` with any static server, for example
`python3 -m http.server -d website/_site`.

## Example pages

[src/examples/registry.js](src/examples/registry.js) lists the examples by topic: slug, title, summary, the renderers
that support each one, and the component types for the drawing on its card. An example is one file,
`src/examples/code/<slug>.js` (or `.ts`): a default export that gets the renderer (`ui`) and `{log, view}`. The page
runs that file and shows its source, the part between `// #region` and `// #endregion` (a file can have several
regions, for example its imports and the body of the function), so the code on the page is the code that runs.

The pages have no HTML files: [scripts/examples-pages.mjs](scripts/examples-pages.mjs) makes `examples/index.html` and
`examples/<slug>.html` from the registry, and [vite.config.js](vite.config.js) serves them in the dev server and builds
them with the landing page. [src/examples/main.ts](src/examples/main.ts) is their script: it creates the renderer that
the visitor picks (`?renderer=tweakpane|blueprint` in the URL, else the last choice, else the first of the example) and
runs the example in it; each renderer gets its own run, because a renderer keeps its state in the config objects.
The panels on these pages have the renderers' default undo manager (Ctrl+Z), as the setup code on the page shows.
The styles are in `src/styles/examples.css`.

To add an example: write `src/examples/code/<slug>.js`, add its entry to the registry, and, if it replaces an old page,
a redirect in `scripts/assemble-pages.mjs`.

## API docs

[typedoc.json](typedoc.json) builds one TypeDoc site for the three packages (`entryPointStrategy: "packages"`, each
package from its `src/index.ts`), with [src/docs/index.md](src/docs/index.md) as its home page. The look comes from the
site: [scripts/docs-theme.mjs](scripts/docs-theme.mjs) writes `dist-docs/assets/custom.css` from the font faces, the
tokens and [src/docs/docs.css](src/docs/docs.css), and copies the two font files. [src/docs/docs.js](src/docs/docs.js)
sets the color scheme from TypeDoc's theme setting, puts the site's brand and a package switcher in the top bar, and
keeps the links to the site on the host that serves the docs. Each package also has its own `npm run docs` (TypeDoc in
the package's `docs` folder, published with the package); the website does not use those.

## Notes

- Styles: `src/styles/tokens.css` holds the design tokens (colors for light and dark, fonts, sizes, radius, the figure
  palette) as CSS custom properties, `src/styles/fonts.css` the bundled font faces (latin subset; a browser downloads
  a face only when an element uses it), `src/styles/site.css` the page. Another page in the same style imports
  `fonts.css` and `tokens.css`, sets `data-scheme="light"` or `"dark"` on `<html>` (see the inline script in
  index.html) and uses the variables.
- "Tweak this page" (the button at the bottom right) opens a design panel built with uiconfig-tweakpane, to try fonts,
  sizes, accent, radius, panel density, the Tweakpane theme, the color scheme and the hero figure. `?design=1` in the
  URL opens it directly; the parameter carries nothing else. The panel loads on first use. A visitor's choices are
  saved in localStorage once they change something and apply on later visits; Reset removes them; "Copy CSS" copies
  them as custom properties.
- The Tweakpane panels use the theme of `uiconfig-tweakpane/theme.css` (switcher under the hero panel); the component
  list shows the plain Tweakpane look.
- The panels stop their update loops while they are off screen, and the figures redraw only the parts that change.
- Code samples are highlighted at build time ([scripts/highlight.mjs](scripts/highlight.mjs), called from
  [vite.config.js](vite.config.js)) with the Lezer JavaScript grammar and the highlighter in
  [src/code-style.js](src/code-style.js); the playground editor (CodeMirror) uses the same grammar and highlighter.
  The samples on the page are files in `src/` (imported with `?highlight` for the HTML, `?sample` for the text), so
  the page shows the code that runs.
- The figures are inline SVG generated at build time from [src/figures](src/figures) (`<svg data-figure="…">` in
  index.html); `binding-motion.ts` moves the parts of the binding figure and stops with reduced motion.
- Tweakpane loads with the page. Blueprint (with React and its styles) and the playground editor (CodeMirror)
  load after the page, when their sections come near the viewport.
- The playground runs the visitor's code in the page. The code comes only from the presets and from what the
  visitor types, which is kept in localStorage. Do not add a way to load it from the URL or from another site.
- `public/screenshots/` holds screenshots of the page for the READMEs; they are published with the site.
