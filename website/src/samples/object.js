const data = {
    name: 'John',
    age: 30,
    city: 'New York',
}
data.uiConfig = {
    type: 'folder',
    label: 'Person',
    expanded: true,
    children: [
        {type: 'input', label: 'Name', property: [data, 'name']},
        {
            type: 'slider',
            label: 'Age',
            bounds: [0, 150],
            stepSize: 1,
            property: [data, 'age'],
        },
        {
            type: 'dropdown',
            label: 'City',
            property: [data, 'city'],
            children: ['New York', 'Paris', 'London'].map((v) => ({label: v})),
        },
        {
            type: 'button',
            label: 'Reset',
            onClick: () => {
                data.name = 'John'
                data.age = 30
                data.city = 'New York'
                // re-render the UI so that it shows the new values
                data.uiConfig.uiRefresh(true)
            },
        },
    ],
}

export {data}
