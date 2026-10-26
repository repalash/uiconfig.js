export default function example(ui) {
    // #region
    const shadows = {
        enabled: true,
        quality: 'high',
        resolution: 2048,
        softness: 0.5,
        cache: 'shadow-cache-1',
    }

    const config = {
        type: 'folder',
        label: 'Shadows',
        expanded: true,
        children: [
            {type: 'checkbox', label: 'Enabled', property: [shadows, 'enabled']},
            {
                type: 'dropdown',
                label: 'Quality',
                property: [shadows, 'quality'],
                children: [{label: 'low'}, {label: 'high'}, {label: 'custom'}],
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
                // the label can be a function too
                label: () => `Softness ${Math.round(shadows.softness * 100)}%`,
                bounds: [0, 1],
                stepSize: 0.01,
                property: [shadows, 'softness'],
                disabled: () => !shadows.enabled,
            },
            {
                type: 'input',
                label: 'Cache key',
                property: [shadows, 'cache'],
                readOnly: () => shadows.quality !== 'custom',
            },
        ],
        // run the functions again after each change
        onChange: () => config.uiRefresh(true),
    }

    ui.appendChild(config)
    // #endregion
}
