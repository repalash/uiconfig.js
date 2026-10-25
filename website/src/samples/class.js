class Person {
    name = 'John'
    age = 30
    city = 'New York'

    uiConfig = {
        type: 'folder',
        label: 'Person',
        expanded: true,
        children: [
            {type: 'input', label: 'Name', property: [this, 'name']},
            {
                type: 'slider',
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
            {type: 'button', label: 'Reset', onClick: () => this.reset()},
        ],
    }

    reset() {
        this.name = 'John'
        this.age = 30
        this.city = 'New York'
        this.uiConfig.uiRefresh(true)
    }
}
const data = new Person()

export {data}
