// Playground preset. The page shows the code between #region and #endregion: the body of a function
// that gets `log` and returns a config.
export default function preset() {
    // #region
    // hidden, disabled and label can be functions: the renderer calls them on each refresh
    const shadows = {
        enabled: true,
        quality: 'high',
        resolution: 2048,
        softness: 0.5,
    }

    const config = {
        type: 'folder',
        label: 'Shadows',
        expanded: true,
        children: [
            {
                type: 'checkbox',
                label: 'Enabled',
                property: [shadows, 'enabled'],
            },
            {
                type: 'dropdown',
                label: 'Quality',
                property: [shadows, 'quality'],
                children: ['low', 'high', 'custom'].map((v) => ({label: v})),
                disabled: () => !shadows.enabled,
            },
            {
                type: 'slider',
                label: 'Resolution',
                bounds: [256, 4096],
                stepSize: 256,
                property: [shadows, 'resolution'],
                hidden: () => shadows.quality !== 'custom',
            },
            {
                type: 'slider',
                label: () =>
                    'Softness ' + Math.round(shadows.softness * 100) + '%',
                bounds: [0, 1],
                stepSize: 0.01,
                property: [shadows, 'softness'],
                disabled: () => !shadows.enabled,
            },
        ],
        // after any change, refresh the panel so that the functions run again
        onChange: () => config.uiRefresh(true),
    }

    return config
    // #endregion
}
