// #region
import {generateUiFolder} from 'uiconfig.js'
// #endregion

export default function example(ui, {log}) {
    // #region
    const settings = {
        quality: 2,
        shadows: true,
        title: 'My scene',
        offset: {x: 0, y: 0.5},
        camera: {fov: 45, near: 0.1, far: 100},
        save: () => log('saved', JSON.stringify(settings)),
    }

    // number: number input, boolean: checkbox, string: text input,
    // {x, y}: vector, function: button, other objects: folders
    const config = generateUiFolder('Settings', settings, {expanded: true})

    ui.appendChild(config)
    // #endregion
}
