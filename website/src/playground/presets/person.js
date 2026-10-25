// Playground preset. The page shows the code between #region and #endregion: the body of a function
// that gets `log` and returns a config.
export default function preset(log) {
    // #region
    // The panel rebuilds as you type.
    // Return a config; log() prints under the panel.
    const data = {
        name: 'Ada',
        age: 36,
        city: 'London',
    }

    const config = {
        type: 'folder',
        label: 'Person',
        expanded: true,
        children: [
            {type: 'input', label: 'Name', property: [data, 'name']},
            {
                type: 'slider',
                label: 'Age',
                bounds: [0, 120],
                stepSize: 1,
                property: [data, 'age'],
            },
            {
                type: 'dropdown',
                label: 'City',
                property: [data, 'city'],
                children: ['London', 'Paris', 'Tokyo'].map((v) => ({label: v})),
            },
            {type: 'button', label: 'Log data', onClick: () => log(data)},
        ],
    }

    return config
    // #endregion
}
