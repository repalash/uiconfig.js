export default function example(ui, {log}) {
    // #region
    const light = {intensity: 1, color: '#ffffff', castShadow: true}

    ui.appendChild({
        type: 'folder',
        label: 'Light',
        expanded: true,
        children: [
            {
                type: 'slider',
                label: 'Intensity',
                bounds: [0, 10],
                stepSize: 0.1,
                property: [light, 'intensity'],
                // on the component: only its own changes
                onChange: (ev) => {
                    if (ev.last) log('intensity is now', ev.value)
                },
            },
            {type: 'color', label: 'Color', property: [light, 'color']},
            {type: 'checkbox', label: 'Cast shadow', property: [light, 'castShadow']},
        ],
        // on the folder: every change of a child
        onChange: (ev) => {
            const path = ev.configPath.map((c) => c.label).join(' > ')
            log(`${path}: ${ev.lastValue} -> ${ev.value}, last: ${ev.last}`)
        },
    })
    // #endregion
}
