export default function example(ui, {log}) {
    // #region
    const state = {size: 'medium', quality: 2, font: 'Inter', fonts: ['Inter', 'Georgia']}

    const config = {
        type: 'folder',
        label: 'Dropdowns',
        expanded: true,
        children: [
            // options without a value: the label is the value
            {
                type: 'dropdown',
                label: 'Size',
                property: [state, 'size'],
                children: [{label: 'small'}, {label: 'medium'}, {label: 'large'}],
            },
            // `select` is another name for dropdown; values can be numbers
            {
                type: 'select',
                label: 'Quality',
                property: [state, 'quality'],
                children: [
                    {label: 'Low', value: 1},
                    {label: 'Medium', value: 2},
                    {label: 'High', value: 3},
                ],
            },
            // a function in children: the options follow state.fonts
            {
                type: 'dropdown',
                label: 'Font',
                property: [state, 'font'],
                children: [() => state.fonts.map((label) => ({label}))],
            },
            {
                type: 'button',
                label: 'Add a font',
                onClick: () => {
                    const more = ['Menlo', 'Verdana', 'Helvetica', 'Courier']
                    const next = more.find((f) => !state.fonts.includes(f))
                    if (next) state.fonts.push(next)
                    config.uiRefresh(true)
                },
            },
        ],
        onChange: () => log(JSON.stringify(state)),
    }

    ui.appendChild(config)
    // #endregion
}
