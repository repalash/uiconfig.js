export default function example(ui, {log}) {
    // #region
    const box = {width: 2, color: '#3346d3', count: 0}

    const config = {
        type: 'folder',
        label: 'Box',
        expanded: true,
        children: [
            {
                type: 'slider',
                label: 'Width',
                bounds: [0, 10],
                stepSize: 0.1,
                property: [box, 'width'],
            },
            {type: 'color', label: 'Color', property: [box, 'color']},
            {type: 'monitor', label: 'Count', property: [box, 'count']},
            {
                type: 'button',
                label: 'Add 10',
                // the returned function undoes the click; both refresh the panel,
                // because undo and redo from the keyboard dispatch no onChange
                onClick: () => {
                    box.count += 10
                    config.uiRefresh(true)
                    return () => {
                        box.count -= 10
                        config.uiRefresh(true)
                    }
                },
            },
            // braces: these return nothing (a returned object with an undo
            // method would be recorded as an undoable action)
            {
                type: 'button',
                label: 'Undo',
                onClick: () => {
                    ui.undoManager.undo()
                },
            },
            {
                type: 'button',
                label: 'Redo',
                onClick: () => {
                    ui.undoManager.redo()
                },
            },
        ],
        onChange: (ev) => {
            config.uiRefresh(true)
            if (ev.last) log(JSON.stringify(box))
        },
    }

    ui.appendChild(config)
    // #endregion
}
