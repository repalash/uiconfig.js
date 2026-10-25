// Config of the "One config, any renderer" section. The page shows the part between #region and #endregion.

/** @param {{name: string, enabled: boolean, kind: string, intensity: number, color: string, position: {x: number, y: number, z: number}}} light */
export function createLightConfig(light) {
    // #region
    return {
        type: 'folder',
        label: 'Light',
        expanded: true,
        children: [
            {
                type: 'input',
                label: 'Name',
                property: [light, 'name'],
                liveUpdate: true,
            },
            {type: 'checkbox', label: 'Enabled', property: [light, 'enabled']},
            {
                type: 'dropdown',
                label: 'Kind',
                property: [light, 'kind'],
                children: [
                    {label: 'point'},
                    {label: 'spot'},
                    {label: 'directional'},
                ],
            },
            {
                type: 'slider',
                label: 'Intensity',
                bounds: [0, 10],
                stepSize: 0.1,
                property: [light, 'intensity'],
            },
            {type: 'color', label: 'Color', property: [light, 'color']},
            {type: 'vec3', label: 'Position', property: [light, 'position']},
        ],
    }
    // #endregion
}

export const createLight = () => ({
    name: 'Key light',
    enabled: true,
    kind: 'spot',
    intensity: 2.5,
    color: '#ffc87a',
    position: {x: 2, y: 4, z: 1},
})
