// #region
import * as THREE from 'three'
// #endregion

export default function example(ui, {view}) {
    // #region
    // the classes for the color and vector components
    ui.THREE = THREE

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 4 / 3, 0.1, 50)
    camera.position.set(0, 1.5, 6)
    camera.lookAt(0, 0, 0)
    scene.add(new THREE.HemisphereLight(0xdfe6f2, 0x30343c, 1.5))
    const sun = new THREE.DirectionalLight(0xffffff, 2.5)
    sun.position.set(3, 4, 5)
    scene.add(sun)

    const material = new THREE.MeshStandardMaterial({color: '#d4a63a', roughness: 0.4})
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), material)
    mesh.rotation.set(0.5, 0.6, 0)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    view.append(renderer.domElement)
    const render = () => {
        const {clientWidth: w, clientHeight: h} = view
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.render(scene, camera)
    }
    new ResizeObserver(render).observe(view)

    ui.appendChild({
        type: 'folder',
        label: 'Box',
        expanded: true,
        children: [
            {type: 'color', label: 'Color', property: [material, 'color']},
            {type: 'color', label: 'Light color', property: [sun, 'color']},
            {
                type: 'vec3',
                label: 'Position',
                bounds: [-2, 2],
                stepSize: 0.01,
                property: [mesh, 'position'],
            },
            {type: 'vec3', label: 'Scale', property: [mesh, 'scale']},
            {
                type: 'slider',
                label: 'Roughness',
                bounds: [0, 1],
                stepSize: 0.01,
                property: [material, 'roughness'],
            },
        ],
        // the objects changed in place: draw the scene again
        onChange: render,
    })
    // #endregion
}
