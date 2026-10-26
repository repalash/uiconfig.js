export default function example(ui, {log}) {
    // #region
    const scene = {
        lights: [
            {name: 'Key', intensity: 2.5},
            {name: 'Fill', intensity: 0.8},
        ],
        selected: 0,
        camera: {lens: {focalLength: 50}},
        tags: ['studio', 'product'],
    }

    const config = {
        type: 'folder',
        label: 'Scene',
        expanded: true,
        children: [
            {
                type: 'dropdown',
                label: 'Edit light',
                property: [scene, 'selected'],
                children: scene.lights.map((light, i) => ({label: light.name, value: i})),
            },
            {
                type: 'slider',
                label: 'Intensity',
                bounds: [0, 5],
                stepSize: 0.1,
                // a function: the binding follows the selected light
                property: () => [scene.lights[scene.selected], 'intensity'],
            },
            // a dot path in the key
            {
                type: 'number',
                label: 'Focal length',
                property: [scene, 'camera.lens.focalLength'],
            },
            // an array index as the key
            {type: 'input', label: 'First tag', property: [scene.tags, 0]},
        ],
        // the slider must read the other light after a change of the dropdown
        onChange: () => {
            config.uiRefresh(true)
            log(JSON.stringify(scene))
        },
    }

    ui.appendChild(config)
    // #endregion
}
