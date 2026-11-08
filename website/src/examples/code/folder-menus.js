export default function example(ui, {log}) {
    // #region
    const box = {name: 'Box', visible: true, copies: 0}
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
            // the tag 'context-menu': the button goes to the ⋮ menu of the folder header
            {
                type: 'button',
                label: 'Duplicate',
                tags: ['context-menu'],
                onClick: () => box.copies++,
            },
            {
                type: 'button',
                label: 'Delete',
                tags: ['context-menu'],
                disabled: () => box.copies === 0, // an item that is off
                onClick: () => box.copies--,
            },
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
