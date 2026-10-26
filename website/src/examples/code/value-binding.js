export default function example(ui, {log}) {
    // #region
    // no data object: each config keeps its own value in config.value
    const name = {type: 'input', label: 'Name', value: 'Untitled'}
    const size = {type: 'slider', label: 'Size', value: 12, bounds: [8, 32], stepSize: 1}
    const bold = {type: 'checkbox', label: 'Bold', value: false}

    ui.appendChild({
        type: 'folder',
        label: 'Label',
        expanded: true,
        children: [
            name,
            size,
            bold,
            {
                type: 'button',
                label: 'Log values',
                onClick: () => log(name.value, size.value, bold.value),
            },
        ],
    })
    // #endregion
}
