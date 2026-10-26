export default function example(ui, {log}) {
    // #region
    const counter = {
        count: 0,
        increment() {
            this.count++
        },
    }

    const config = {
        type: 'folder',
        label: 'Buttons',
        expanded: true,
        children: [
            // onClick
            {
                type: 'button',
                label: 'Say hello',
                onClick: () => log('hello'),
            },
            // the function that property points to; `this` is the object
            {
                type: 'button',
                label: 'Increment',
                property: [counter, 'increment'],
            },
            // the function in value
            {
                type: 'button',
                label: 'Reset',
                value: () => {
                    counter.count = 0
                },
            },
            {
                type: 'button',
                label: 'Only below 5',
                disabled: () => counter.count >= 5,
                onClick: () => log('count is', counter.count),
            },
            {type: 'monitor', label: 'Count', property: [counter, 'count']},
        ],
        // a click is a change too: refresh to show the count
        onChange: () => config.uiRefresh(true),
    }

    ui.appendChild(config)
    // #endregion
}
