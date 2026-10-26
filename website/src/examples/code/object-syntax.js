export default function example(ui) {
    // #region
    const person = {
        name: 'Ada',
        age: 36,
        city: 'London',
    }

    // the config sits next to the data; property binds a component to a field
    person.uiConfig = {
        type: 'folder',
        label: 'Person',
        expanded: true,
        children: [
            {type: 'input', label: 'Name', property: [person, 'name']},
            {
                type: 'slider',
                label: 'Age',
                bounds: [0, 120],
                stepSize: 1,
                property: [person, 'age'],
            },
            {
                type: 'dropdown',
                label: 'City',
                property: [person, 'city'],
                children: ['London', 'Paris', 'New York'].map((label) => ({label})),
            },
            {
                type: 'button',
                label: 'Reset',
                onClick: () => {
                    Object.assign(person, {name: 'Ada', age: 36, city: 'London'})
                    // the code changed the data: render the panel again
                    person.uiConfig.uiRefresh(true)
                },
            },
        ],
    }

    ui.appendChild(person.uiConfig)
    // #endregion
}
