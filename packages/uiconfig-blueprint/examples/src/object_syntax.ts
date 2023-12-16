import {UiConfigContainer} from 'uiconfig.js'

export const data: UiConfigContainer = {
    name: 'John',
    age: 30,
    city: 'New York',
}
data.uiConfig = {
    type: 'folder',
    label: 'Person',
    children: [
        {
            type: 'input',
            label: 'Name',
            property: [data, 'name'],
        },
        {
            type: 'number',
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
                // Update/Re-render the UI so that the changes are reflected
                data.uiConfig?.uiRefresh?.(true)
            },
        },
    ],
}
