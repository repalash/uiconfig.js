import {IUiConfigContainer, UiObjectConfig, uiButton, uiContainer, uiDropdown, uiInput, uiSlider} from 'uiconfig.js'

@uiContainer('Person', {expanded: true})
class Person implements IUiConfigContainer {
    declare uiConfig: UiObjectConfig

    @uiInput('Name')
    name = 'John'

    @uiSlider('Age', [0, 150], 1)
    age = 30

    @uiDropdown('City', ['New York', 'Paris', 'London'])
    city = 'New York'

    @uiButton('Reset')
    reset = () => {
        this.name = 'John'
        this.age = 30
        this.city = 'New York'
        this.uiConfig.uiRefresh?.(true)
    }
}
const data = new Person()

export {data}
