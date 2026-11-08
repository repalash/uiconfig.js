export default function example(ui, {log}) {
    // #region
    const box = {name: 'Box', visible: true, copies: 0}

    // icons: SVG markup (it takes the text color), an image URL, or a Blueprint icon name
    const svg = (paths) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
    const duplicateIcon = svg('<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5"/>')
    const deleteIcon = svg('<path d="M2.5 4.5h11M6 4.5v-2h4v2M4 4.5l.7 9h6.6l.7-9M6.8 7v4M9.2 7v4"/>')
    const constraints = ['Look At', 'Follow']

    // one config for each constraint, made once and kept (see Dynamic children)
    const configs = new Map()
    const constraintConfig = (name) => {
        if (!configs.has(name)) {
            configs.set(name, {
                type: 'folder',
                label: name,
                expanded: true,
                children: [
                    {type: 'slider', label: 'Influence', bounds: [0, 1], value: 1},
                    // the menu of this folder
                    {
                        type: 'button',
                        label: 'Remove constraint',
                        tags: ['context-menu'],
                        onClick: () => {
                            constraints.splice(constraints.indexOf(name), 1)
                            config.uiRefresh(true)
                        },
                    },
                ],
            })
        }
        return configs.get(name)
    }

    const config = {
        type: 'folder',
        label: () => box.name,
        expanded: true,
        children: [
            {type: 'input', label: 'Name', property: [box, 'name']},
            {type: 'checkbox', label: 'Visible', property: [box, 'visible']},
            {type: 'monitor', label: 'Copies', property: [box, 'copies']},
            // the tag 'context-menu': the button goes to the folder header (a button while it fits, else the ⋮ menu);
            // with an icon, the header shows the icon only and the label on hover
            {
                type: 'button',
                label: 'Duplicate',
                icon: duplicateIcon,
                tags: ['context-menu'],
                onClick: () => box.copies++,
            },
            {
                type: 'button',
                label: 'Delete',
                icon: deleteIcon,
                tags: ['context-menu'],
                disabled: () => box.copies === 0, // an item that is off
                onClick: () => box.copies--,
            },
            // more actions than fit: the rest go to the ⋮ menu (make the window narrow to see more of them move)
            ...['Copy settings', 'Paste settings', 'Center pivot', 'Export as GLB'].map(label => ({
                type: 'button',
                label,
                tags: ['context-menu'],
                onClick: () => {}, // the folder onChange logs the click
            })),
            {
                type: 'button',
                label: 'Only when hidden',
                tags: ['context-menu'],
                hidden: () => box.visible, // not in the menu while the box is visible
                onClick: () => log('the box is hidden'),
            },
            // 'inline' too: the button stays in the folder
            {
                type: 'button',
                label: 'Reset',
                tags: ['context-menu', 'inline'],
                onClick: () => {
                    Object.assign(box, {name: 'Box', visible: true, copies: 0})
                },
            },
            {
                type: 'folder',
                label: 'Constraints',
                expanded: true,
                children: [
                    () => constraints.map(constraintConfig),
                    {
                        type: 'button',
                        label: 'Add constraint',
                        tags: ['context-menu'],
                        onClick: () => {
                            constraints.push(`Constraint ${configs.size + 1}`)
                            config.uiRefresh(true)
                        },
                    },
                ],
            },
        ],
        // a click in a menu is a change of the folder too, also from a nested folder
        onChange: (ev) => {
            if (ev.config?.type === 'button') log('clicked', ev.config.label)
            config.uiRefresh(true)
        },
    }

    ui.appendChild(config)
    // #endregion
}
