export default function example(ui) {
    // #region
    // import 'uiconfig-tweakpane/theme.css' once (see the setup code)
    const state = {mode: 'dark', speed: 0.5, color: '#f2c14e', grid: true}

    ui.setTheme(state.mode)
    ui.appendChild({
        type: 'folder',
        label: 'Theme',
        expanded: true,
        children: [
            {
                type: 'dropdown',
                label: 'Mode',
                property: [state, 'mode'],
                children: ['light', 'dark', 'blue', 'white', 'black', 'none'].map(
                    (label) => ({label}),
                ),
                // null: the default Tweakpane look
                onChange: () => ui.setTheme(state.mode === 'none' ? null : state.mode),
            },
            {
                type: 'slider',
                label: 'Speed',
                bounds: [0, 1],
                stepSize: 0.01,
                property: [state, 'speed'],
            },
            {type: 'color', label: 'Color', property: [state, 'color']},
            {type: 'checkbox', label: 'Grid', property: [state, 'grid']},
        ],
    })
    // #endregion
}
