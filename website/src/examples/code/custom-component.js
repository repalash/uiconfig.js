export default function example(ui) {
    // #region
    // a generator gets the Tweakpane folder, the config and the renderer, and
    // returns the blade; it runs again on each refresh, so it keeps the first one
    ui.typeGenerators.graph = (parent, config, renderer) => {
        if (config.uiRef) return config.uiRef
        const [target, key] = renderer.methods.getBinding(config)
        const [min, max] = config.bounds ?? [0, 1]
        return parent.addMonitor(target, key, {
            label: renderer.methods.getLabel(config),
            view: 'graph',
            min,
            max,
            interval: 50,
        })
    }

    const wave = {value: 0, frequency: 1, running: true}
    let t = 0
    setInterval(() => {
        if (!wave.running) return
        t += 0.05
        wave.value = Math.sin(t * Math.PI * wave.frequency)
    }, 50)

    ui.appendChild({
        type: 'folder',
        label: 'Signal',
        expanded: true,
        children: [
            {type: 'graph', label: 'Wave', bounds: [-1, 1], property: [wave, 'value']},
            {
                type: 'slider',
                label: 'Frequency',
                bounds: [0.1, 4],
                stepSize: 0.1,
                property: [wave, 'frequency'],
            },
            {type: 'checkbox', label: 'Running', property: [wave, 'running']},
        ],
    })
    // #endregion
}
