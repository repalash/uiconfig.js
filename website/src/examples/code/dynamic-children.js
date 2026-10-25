export default function example(ui, {log}) {
    // #region
    const todos = [
        {text: 'Write the config', done: true},
        {text: 'Render the panel', done: false},
    ]

    // one config for each item, made once and kept, so that the
    // renderer finds the same component on each refresh
    const configs = new WeakMap()
    const itemConfig = (todo) => {
        if (!configs.has(todo)) {
            configs.set(todo, {
                type: 'folder',
                label: () => (todo.done ? '✓ ' : '') + todo.text,
                expanded: false,
                children: [
                    {type: 'input', label: 'Text', property: [todo, 'text']},
                    {type: 'checkbox', label: 'Done', property: [todo, 'done']},
                    {
                        type: 'button',
                        label: 'Remove',
                        onClick: () => {
                            todos.splice(todos.indexOf(todo), 1)
                            list.uiRefresh(true)
                        },
                    },
                ],
            })
        }
        return configs.get(todo)
    }

    const list = {
        type: 'folder',
        label: () => `To do (${todos.filter((t) => !t.done).length} open)`,
        expanded: true,
        children: [
            // a function: the renderer calls it on each refresh
            () => todos.map(itemConfig),
            {
                type: 'button',
                label: 'Add an item',
                onClick: () => {
                    todos.push({text: `Item ${todos.length + 1}`, done: false})
                    list.uiRefresh(true)
                },
            },
        ],
        // the labels show the data: refresh them after an edit; the edited item's
        // folder is in ev.configPath, and the list refresh does not reach it
        onChange: (ev) => {
            if (ev.last) {
                for (const c of ev.configPath ?? []) if (c !== list) c.uiRefresh?.()
                list.uiRefresh(true)
            }
            log(JSON.stringify(todos))
        },
    }

    ui.appendChild(list)
    // #endregion
}
