export default function example(ui, {log}) {
    // #region
    const render = {exposure: 1, bloom: true, bloomStrength: 0.4, samples: 4}

    const config = {
        type: 'folder',
        label: 'Render',
        expanded: true,
        children: [
            {
                type: 'slider',
                label: 'Exposure',
                bounds: [0, 4],
                stepSize: 0.05,
                property: [render, 'exposure'],
            },
            {
                type: 'folder',
                label: 'Bloom',
                expanded: true,
                children: [
                    {type: 'checkbox', label: 'Enabled', property: [render, 'bloom']},
                    {
                        type: 'slider',
                        label: 'Strength',
                        bounds: [0, 2],
                        stepSize: 0.01,
                        property: [render, 'bloomStrength'],
                    },
                ],
            },
            {
                type: 'folder',
                label: 'Closed folder',
                expanded: false,
                onExpand: () => log('the folder opened'),
                children: [
                    {
                        type: 'slider',
                        label: 'Samples',
                        bounds: [1, 16],
                        stepSize: 1,
                        property: [render, 'samples'],
                    },
                ],
            },
            // Blueprint: a row that opens a page; Tweakpane: a folder
            {
                type: 'panel',
                label: 'Advanced',
                children: [
                    {
                        type: 'slider',
                        label: 'Samples',
                        bounds: [1, 16],
                        stepSize: 1,
                        property: [render, 'samples'],
                    },
                ],
            },
        ],
    }

    ui.appendChild(config)
    // #endregion
}
