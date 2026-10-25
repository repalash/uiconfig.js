// Config of the three.js demo. The page shows the part between #region and #endregion.

/**
 * @param {import('three').Mesh} mesh - the torus knot; its material is a MeshStandardMaterial
 * @param {{speed: number}} spin - turns per minute of the knot
 * @param {() => void} reset - puts the defaults back
 */
export function createThreeConfig(mesh, spin, reset) {
    const material = mesh.material
    // #region
    // ui.THREE = {Color, Vector2, Vector3, Vector4} lets the color and
    // vector inputs edit three.js objects in place
    const config = {
        type: 'folder',
        label: 'Torus knot',
        expanded: true,
        children: [
            {type: 'color', label: 'Color', property: [material, 'color']},
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
            {
                type: 'vec3',
                label: 'Position',
                bounds: [-1, 1],
                stepSize: 0.01,
                property: [mesh, 'position'],
            },
            {
                type: 'slider',
                label: 'Spin (rpm)',
                bounds: [0, 20],
                stepSize: 0.5,
                property: [spin, 'speed'],
            },
            {
                type: 'checkbox',
                label: 'Wireframe',
                property: [material, 'wireframe'],
            },
            {
                type: 'button',
                label: 'Reset',
                onClick: () => {
                    reset()
                    config.uiRefresh(true) // show the reset values
                },
            },
        ],
    }
    // #endregion
    return config
}
