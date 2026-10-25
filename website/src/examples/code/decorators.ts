import type {UiConfigRenderer} from 'uiconfig.js'
// #region
import {
    IUiConfigContainer,
    UiObjectConfig,
    uiButton,
    uiColor,
    uiConfig,
    uiContainer,
    uiDropdown,
    uiFolderContainer,
    uiInput,
    uiSlider,
    uiToggle,
} from 'uiconfig.js'

@uiFolderContainer('Material')
class Material implements IUiConfigContainer {
    declare uiConfig: UiObjectConfig

    @uiColor('Color')
    color = '#d4a63a'

    @uiSlider('Roughness', [0, 1], 0.01)
    roughness = 0.4

    @uiToggle('Wireframe')
    wireframe = false
}

@uiContainer('Object', {expanded: true})
class SceneObject implements IUiConfigContainer {
    declare uiConfig: UiObjectConfig

    @uiInput('Name')
    name = 'Torus knot'

    @uiDropdown('Layer', ['Default', 'Background', 'Overlay'])
    layer = 'Default'

    @uiSlider('Opacity', [0, 1], 0.01)
    opacity = 1

    // no type: the value picks the component, here the folder of Material
    @uiConfig()
    material = new Material()

    @uiButton('Reset')
    reset = () => {
        this.name = 'Torus knot'
        this.opacity = 1
        this.material.roughness = 0.4
        this.uiConfig.uiRefresh?.(true)
    }
}
// #endregion

export default function example(ui: UiConfigRenderer) {
    // #region
    const object = new SceneObject()
    ui.appendChild(object.uiConfig)
    // #endregion
}
