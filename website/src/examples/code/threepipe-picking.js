// #region
import {
    Color,
    PickingPlugin,
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
    ui.fileLoader = viewer

    viewer.setEnvironmentMap(
        'https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr',
    )
    viewer.load(
        'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
        {autoCenter: true, autoScale: true},
    )

    const picking = viewer.addPluginSync(PickingPlugin)
    const selection = {
        type: 'folder',
        label: 'Selected object',
        expanded: true,
        children: [
            // runs on each refresh: the configs of the picked object
            () => {
                const object = picking.getSelectedObject()
                if (!object) return [{type: 'button', label: 'Click the model', disabled: true}]
                return [object.uiConfig, object.material?.uiConfig]
            },
        ],
    }
    picking.addEventListener('selectedObjectChanged', () => selection.uiRefresh(true))

    ui.appendChild(selection)
    // #endregion
}
