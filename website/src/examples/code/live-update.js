export default function example(ui, {log}) {
    // #region
    const search = {onEnter: '', live: ''}

    const config = {
        type: 'folder',
        label: 'Search',
        expanded: true,
        children: [
            {
                type: 'input',
                label: 'On Enter',
                property: [search, 'onEnter'],
                placeholder: 'type, then press Enter',
            },
            {
                type: 'input',
                label: 'Live',
                property: [search, 'live'],
                placeholder: 'each key',
                liveUpdate: true,
            },
            {type: 'monitor', label: 'Live value', property: [search, 'live']},
        ],
        onChange: (ev) => {
            log(`${ev.config.label}: "${ev.value}", last: ${ev.last}`)
            config.uiRefresh(true)
        },
    }

    ui.appendChild(config)
    // #endregion
}
