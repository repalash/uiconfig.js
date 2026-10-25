import {UiConfigContainer, UiObjectConfig} from 'uiconfig.js'

class SampleDataClass implements UiConfigContainer {
    name = 'John'
    age = 30
    city = 'New York'

    uiConfig: UiObjectConfig = {
        type: 'folder',
        label: 'Person',
        children: [
            {
                type: 'input',
                label: 'Name',
                property: [this, 'name'],
            },
            {
                type: 'number',
                label: 'Age',
                bounds: [0, 150],
                stepSize: 1,
                property: [this, 'age'],
            },
            {
                type: 'dropdown',
                label: 'City',
                property: [this, 'city'],
                children: ['New York', 'Paris', 'London'].map((v) => ({label: v})),
            },
            {
                type: 'button',
                label: 'Reset',
                onClick: () => {
                    this.name = 'John'
                    this.age = 30
                    this.city = 'New York'
                    // Update/Re-render the UI so that the changes are reflected
                    this.uiConfig.uiRefresh?.(true)
                },
            },
        ],
    }
}
export const data = new SampleDataClass()
