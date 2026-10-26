// #region
import {
    Color,
    Texture,
    ThreeViewer,
    Vector2,
    Vector3,
    Vector4,
} from 'https://threepipe.org/dist/index.mjs'
// #endregion

export default function example(ui, {view}) {
    // #region
    const canvas = document.createElement('canvas')
    view.append(canvas)
    const viewer = new ThreeViewer({canvas})

    ui.THREE = {Color, Vector2, Vector3, Vector4, Texture}
    ui.fileLoader = viewer // for the file and image inputs of threepipe

    // the viewer's own settings: renderer, scene, camera, plugins
    viewer.uiConfig.children.forEach((child) => ui.appendChild(child))

    const env = viewer.setEnvironmentMap(
        'https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr',
    )
    const model = viewer.load(
        'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
        {autoCenter: true, autoScale: true},
    )
    Promise.all([env, model]).then(([, helmet]) => {
        // every object and material has a uiConfig too
        const mesh = helmet.getObjectByName('node_damagedHelmet_-6514')
        ui.appendChild(mesh.uiConfig)
    })
    // #endregion
}
