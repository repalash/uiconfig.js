export default function example(ui) {
    // #region
    const params = {
        title: 'Hello',
        count: 3,
        visible: true,
        scale: 1.5,
        opacity: 0.8,
        enabled: false,
        rolls: 0,
        lastRoll: 0,
    }

    const config = {
        type: 'folder',
        label: 'Inputs',
        expanded: true,
        children: [
            // input: the kind follows the value
            {type: 'input', label: 'Text', property: [params, 'title']},
            {type: 'input', label: 'Number', property: [params, 'count']},
            {type: 'input', label: 'Boolean', property: [params, 'visible']},
            {
                type: 'number',
                label: 'Scale',
                bounds: [0, 10],
                stepSize: 0.1,
                property: [params, 'scale'],
            },
            {
                type: 'slider',
                label: 'Opacity',
                bounds: [0, 1],
                stepSize: 0.05,
                property: [params, 'opacity'],
            },
            {type: 'checkbox', label: 'Checkbox', property: [params, 'visible']},
            {type: 'toggle', label: 'Toggle', property: [params, 'enabled']},
            {
                type: 'button',
                label: 'Roll a die',
                onClick: () => {
                    params.lastRoll = 1 + Math.floor(Math.random() * 6)
                    params.rolls++
                    config.uiRefresh(true)
                },
            },
            // monitor: shows the value and cannot change it
            {type: 'monitor', label: 'Last roll', property: [params, 'lastRoll']},
            {type: 'monitor', label: 'Rolls', property: [params, 'rolls']},
        ],
        // the checkbox and the boolean input edit the same field
        onChange: () => config.uiRefresh(true),
    }

    ui.appendChild(config)
    // #endregion
}
