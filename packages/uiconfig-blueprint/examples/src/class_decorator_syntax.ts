import {uiButton, UiConfigContainer, uiContainer, uiDropdown, uiInput, uiNumber, UiObjectConfig} from 'uiconfig.js'

@uiContainer('Person')
class SampleDataClass implements UiConfigContainer {
    @uiInput('Name') name = 'John'
    @uiNumber('Age') age = 30
    @uiDropdown('City', ['New York', 'Paris', 'London'].map((v) => ({label: v}))) city = 'New York'
    @uiButton('Reset') reset = ()=>{
        this.name = 'John'
        this.age = 30
        this.city = 'New York'
        // Update/Re-render the UI so that the changes are reflected
        this.uiConfig.uiRefresh?.(true)
    }

    uiConfig: UiObjectConfig
}

export const data = new SampleDataClass()
