export default function example(ui) {
    // #region
    class Person {
        name = 'Ada'
        age = 36
        city = 'London'

        // `this` is the object that the components edit
        uiConfig = {
            type: 'folder',
            label: 'Person',
            expanded: true,
            children: [
                {type: 'input', label: 'Name', property: [this, 'name']},
                {
                    type: 'slider',
                    label: 'Age',
                    bounds: [0, 120],
                    stepSize: 1,
                    property: [this, 'age'],
                },
                {
                    type: 'dropdown',
                    label: 'City',
                    property: [this, 'city'],
                    children: ['London', 'Paris', 'New York'].map((label) => ({
                        label,
                    })),
                },
                {type: 'button', label: 'Birthday', onClick: () => this.birthday()},
                {type: 'button', label: 'Reset', onClick: () => this.reset()},
            ],
        }

        birthday() {
            this.age++
            this.uiConfig.uiRefresh(true)
        }

        reset() {
            this.name = 'Ada'
            this.age = 36
            this.city = 'London'
            this.uiConfig.uiRefresh(true)
        }
    }

    const person = new Person()
    ui.appendChild(person.uiConfig)
    // #endregion
}
