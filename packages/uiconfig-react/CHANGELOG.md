# Changelog for uiconfig-react

Not published to npm yet (`"private": true`).

## [Unreleased]
- Depends on uiconfig.js `^0.5.0`. A component adds the refresh of the renderer to its config with `addRefreshListener` when it mounts, and removes it when it unmounts, instead of assigning `config.uiRefresh`: a config that another renderer also draws refreshes in both.
- `[Dev]` Moved into the uiconfig monorepo: https://github.com/repalash/uiconfig.js, folder `packages/uiconfig-react`. Depends on the workspace `uiconfig.js` (`^0.4.0`).
- Select component, UI updates.
- Rename components.
- Initial working library: `UiConfigRendererReact`, `ConfigObject` and base components.
