// Playground preset. The page shows the code between #region and #endregion: the body of a function
// that gets `log` and returns a config.
export default function preset(log) {
    // #region
    // Colors can be '#rrggbb' strings or numbers, vectors are {x, y, z, w} objects.
    // three.js Color and Vector objects work as well.
    const material = {
        color: '#d4af37',
        emissive: 0x1a0d00,
        roughness: 0.3,
        metalness: 1,
        offset: {x: 0, y: 0},
        scale: {x: 1, y: 1, z: 1},
    }

    return {
        type: 'folder',
        label: 'Material',
        expanded: true,
        children: [
            {type: 'color', label: 'Color', property: [material, 'color']},
            {
                type: 'color',
                label: 'Emissive',
                property: [material, 'emissive'],
            },
            {
                type: 'slider',
                label: 'Roughness',
                bounds: [0, 1],
                stepSize: 0.01,
                property: [material, 'roughness'],
            },
            {
                type: 'slider',
                label: 'Metalness',
                bounds: [0, 1],
                stepSize: 0.01,
                property: [material, 'metalness'],
            },
            {type: 'vec2', label: 'UV offset', property: [material, 'offset']},
            {type: 'vec3', label: 'Scale', property: [material, 'scale']},
            {
                type: 'button',
                label: 'Log material',
                onClick: () => log(material),
            },
        ],
    }
    // #endregion
}
