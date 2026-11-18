export default function example(ui, {log}) {
    // #region
    const box = {visible: true, copies: 0}

    const svg = (paths) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
    const config = {
        type: 'folder',
        label: 'Box',
        expanded: true,
        children: [
            {type: 'checkbox', label: 'Visible', property: [box, 'visible']},
            {type: 'monitor', label: 'Copies', property: [box, 'copies']},
            // the actions of the folder (the tag 'context-menu'): in its header, or in the title row below
            {
                type: 'button',
                label: 'Duplicate',
                icon: svg('<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5"/>'),
                tags: ['context-menu'],
                onClick: () => box.copies++,
            },
            {
                type: 'button',
                label: 'Delete',
                icon: svg('<path d="M2.5 4.5h11M6 4.5v-2h4v2M4 4.5l.7 9h6.6l.7-9M6.8 7v4M9.2 7v4"/>'),
                tags: ['context-menu'],
                disabled: () => box.copies === 0,
                onClick: () => box.copies--,
            },
            ...['Auto Center', 'Scale to Radius', 'Pivot to Node Center'].map(label => ({
                type: 'button',
                label,
                tags: ['context-menu'],
                onClick: () => {}, // the folder onChange logs the click
            })),
        ],
        onChange: (ev) => {
            if (ev.config?.type === 'button') log('clicked', ev.config.label)
            config.uiRefresh(true)
        },
    }

    // the app's title row: one card with the panel (same corners), in the colours of the Tweakpane theme
    document.head.append(Object.assign(document.createElement('style'), {
        textContent: `
            .title-row { display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 12px;
                background: var(--tp-base-background-color, hsl(230, 7%, 17%)); color: var(--tp-container-foreground-color, hsl(230, 7%, 75%));
                border-radius: var(--tp-base-border-radius, 6px) var(--tp-base-border-radius, 6px) 0 0; }
            .title-row[hidden] { display: none; }
            .title-row b { white-space: nowrap; }
            .title-row-actions { flex: 1; min-width: 0; }
            .title-row:not([hidden]) + .tp-rotv { border-top-left-radius: 0; border-top-right-radius: 0; }
            .no-header > .tp-fldv_b { display: none; }
            .no-header > .tp-fldv_i { top: 0; }
        `,
    }))
    const row = document.createElement('div')
    row.className = 'title-row'
    row.innerHTML = '<b>Box</b><div class="title-row-actions"></div>'
    // in the panel of `ui` (the theme colours are set there); in an app, also the element given to `new UI(element)`
    document.querySelector('#ex-panel-tweakpane #tweakpaneUiContainer').prepend(row)

    ui.appendChild(config)

    let actions
    const showTitleRow = (show) => {
        row.hidden = !show
        // no "Configuration" header while the title row names the panel
        ui.title = show ? '' : 'Configuration'
        // the folder's own header is hidden: its name and actions are in the title row
        config.uiRef.element.classList.toggle('no-header', show)
        actions?.remove()
        actions = show ? ui.mountFolderActions(config, row.querySelector('.title-row-actions')) : undefined
    }
    showTitleRow(true)

    // compare with the folder header and the "Configuration" header
    ui.appendChild({
        type: 'checkbox',
        label: 'Own title row',
        value: true,
        onChange: (ev) => showTitleRow(ev.value),
    })
    // #endregion
}
