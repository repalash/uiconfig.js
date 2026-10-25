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
```

After a change in one of the packages, build it again.

## The Pages site

`npm run pages` (repository root) builds everything the site needs and assembles it in `website/_site`, as the
workflow [docs-pages.yml](../.github/workflows/docs-pages.yml) does:

| Path | Content |
|---|---|
| `/` | this page (`website/dist`) |
| `/docs/` | TypeDoc of uiconfig.js |
| `/docs/uiconfig-tweakpane/`, `/docs/uiconfig-blueprint/` | TypeDoc of the renderers |
| `/examples/` | example pages of uiconfig.js |
| `/examples/uiconfig-tweakpane/`, `/examples/uiconfig-blueprint/` | example pages of the renderers |
| `/dist/` | the built uiconfig.js package |
| `/README.md`, `/LICENSE` | of uiconfig.js |

The uiconfig.js TypeDoc was at the root of the site before. [scripts/assemble-pages.mjs](scripts/assemble-pages.mjs)
writes a redirect page at each old TypeDoc page path (`/classes/UiConfigMethods.html` to
`/docs/classes/UiConfigMethods.html`, and so on).

All URLs are relative (`base: './'` in [vite.config.js](vite.config.js)), so the site works under
`/uiconfig.js/` and at the root of a domain.

To check the result locally, serve `website/_site` with any static server, for example
`python3 -m http.server -d website/_site`.

## Notes

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
