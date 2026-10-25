// Config of the component gallery: one entry for each component type. Entries with `only` are left out
// for the renderers that do not have that component (see the table on the page).

export function createGalleryState() {
    return {
        text: 'Hello',
        count: 4,
        ratio: 0.35,
        enabled: true,
        mode: 'medium',
        color: '#4f6bff',
        offset: {x: 0.2, y: -0.4},
        position: {x: 1, y: 2, z: 3},
        rotation: {x: 0, y: 0, z: 0, w: 1},
        notes: 'Two lines\nof text',
        clicks: 0,
        first: 'on the first tab',
        second: 'on the second tab',
        inner: 0.5,
    }
}

/**
 * @param {ReturnType<typeof createGalleryState>} s
 * @param {'tweakpane' | 'blueprint'} renderer
 */
export function createGalleryConfig(s, renderer) {
    const children = [
        {type: 'input', label: 'input', property: [s, 'text']},
        {type: 'number', label: 'number', property: [s, 'count']},
        {
            type: 'slider',
            label: 'slider',
            bounds: [0, 1],
            stepSize: 0.01,
            property: [s, 'ratio'],
        },
        {type: 'checkbox', label: 'checkbox', property: [s, 'enabled']},
        {
            type: 'dropdown',
            label: 'dropdown',
            property: [s, 'mode'],
            children: ['small', 'medium', 'large'].map((v) => ({
                label: v,
                value: v,
            })),
        },
        {type: 'color', label: 'color', property: [s, 'color']},
        {type: 'vec2', label: 'vec2', property: [s, 'offset']},
        {type: 'vec3', label: 'vec3', property: [s, 'position']},
        {type: 'vec4', label: 'vec4', property: [s, 'rotation']},
        {
            type: 'button',
            label: 'button',
            onClick: () => {
                s.clicks++
                config.uiRefresh?.(true)
            },
        },
        {type: 'monitor', label: 'monitor', property: [s, 'clicks']},
        {type: 'separator', only: 'tweakpane'},
        {
            type: 'textarea',
            label: 'textarea',
            property: [s, 'notes'],
            only: 'tweakpane',
        },
        {
            type: 'tabs',
            only: 'tweakpane',
            children: [
                {
                    type: 'folder',
                    label: 'tab 1',
                    children: [
                        {type: 'input', label: 'input', property: [s, 'first']},
                    ],
                },
                {
                    type: 'folder',
                    label: 'tab 2',
                    children: [
                        {
                            type: 'input',
                            label: 'input',
                            property: [s, 'second'],
                        },
                    ],
                },
            ],
        },
        {
            type: 'folder',
            label: 'folder',
            expanded: true,
            children: [
                {
                    type: 'slider',
                    label: 'slider',
                    bounds: [0, 1],
                    stepSize: 0.01,
                    property: [s, 'inner'],
                },
            ],
        },
        {
            type: 'panel',
            label: 'panel',
            children: [
                {
                    type: 'slider',
                    label: 'slider',
                    bounds: [0, 1],
                    stepSize: 0.01,
                    property: [s, 'inner'],
                },
            ],
        },
    ]
    const config = {
        type: 'folder',
        label: 'Components',
        expanded: true,
        children: children.filter((c) => !c.only || c.only === renderer),
    }
    return config
}
