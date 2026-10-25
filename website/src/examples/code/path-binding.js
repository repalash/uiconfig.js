export default function example(ui, {log}) {
    // #region
    const person = {
        name: {first: 'Ada', last: 'Lovelace'},
        born: {year: 1815, month: 12, day: 10},
        languages: ['English', 'French'],
    }

    // the folder holds the data in `value`; the children pick fields with `path`
    const config = {
        type: 'folder',
        label: 'Person',
        value: person,
        expanded: true,
        children: [
            {type: 'input', label: 'First name', path: 'name.first'},
            {type: 'input', label: 'Last name', path: 'name.last'},
            {
                type: 'folder',
                label: 'Born',
                expanded: true,
                children: [
                    {type: 'number', label: 'Year', path: 'born.year', stepSize: 1},
                    {
                        type: 'number',
                        label: 'Month',
                        path: 'born.month',
                        bounds: [1, 12],
                        stepSize: 1,
                    },
                    {
                        type: 'number',
                        label: 'Day',
                        path: 'born.day',
                        bounds: [1, 31],
                        stepSize: 1,
                    },
                ],
            },
            {type: 'input', label: 'Language 1', path: 'languages.0'},
            {type: 'input', label: 'Language 2', path: 'languages.1'},
            {
                type: 'button',
                label: 'Log JSON',
                onClick: () => log(JSON.stringify(person)),
            },
        ],
    }

    ui.appendChild(config)
    // #endregion
}
