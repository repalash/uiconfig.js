// The three.js demo: a torus knot and a panel bound to its material and position. This module and three.js's
// renderer load when the section comes near the viewport (see three.ts). The scene renders only while it is on
// screen: every frame while the knot spins, once after a change otherwise; with reduced motion it does not spin.
// from three.js's source modules, like src/renderers.ts, so that the page has one copy of each class
import {Color} from 'three/src/math/Color.js'
import {DirectionalLight} from 'three/src/lights/DirectionalLight.js'
import {HemisphereLight} from 'three/src/lights/HemisphereLight.js'
import {Mesh} from 'three/src/objects/Mesh.js'
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial.js'
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera.js'
import {Scene} from 'three/src/scenes/Scene.js'
import {TorusKnotGeometry} from 'three/src/geometries/TorusKnotGeometry.js'
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer.js'
import type {UiObjectConfig} from 'uiconfig.js'
import {createTweakpane} from '../renderers'
import {createThreeConfig} from './three-config.js'

const defaults = {color: '#d4a63a', roughness: 0.42, metalness: 0.15, speed: 6}

export function mountThreeDemo(view: HTMLElement, panelHost: HTMLElement) {
    let renderer: WebGLRenderer | undefined
    try {
        renderer = new WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'})
        view.replaceChildren() // the loading message
    } catch {
        view.classList.add('is-fallback')
        view.textContent = 'This demo needs WebGL, which this browser does not provide. The panel still edits the objects.'
    }

    const scene = new Scene()
    const camera = new PerspectiveCamera(35, 4 / 3, 0.1, 50)
    camera.position.set(0, 0.4, 7.5)
    camera.lookAt(0, 0, 0)
    scene.add(new HemisphereLight(0xdfe6f2, 0x30343c, 1.4))
    const light = new DirectionalLight(0xffffff, 2.6)
    light.position.set(3, 4, 5)
    scene.add(light)

    const material = new MeshStandardMaterial({color: new Color(defaults.color), roughness: defaults.roughness, metalness: defaults.metalness})
    const mesh = new Mesh(new TorusKnotGeometry(0.9, 0.3, 160, 20), material)
    mesh.name = 'Torus knot'
    scene.add(mesh)
    const spin = {speed: defaults.speed}

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let visible = false
    let raf = 0
    let last = 0
    const render = () => renderer?.render(scene, camera)
    const frame = (now: number) => {
        raf = 0
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
        last = now
        if (!reduced && spin.speed > 0) {
            mesh.rotation.y += dt * spin.speed * Math.PI * 2 / 60
            mesh.rotation.x += dt * spin.speed * Math.PI / 60
        }
        render()
        if (visible && !reduced && spin.speed > 0) raf = requestAnimationFrame(frame)
        else last = 0
    }
    /** Renders on the next frame (and keeps rendering while the knot spins and the view is on screen). */
    const requestRender = () => {
        if (visible && !raf) raf = requestAnimationFrame(frame)
    }

    const reset = () => {
        material.color.set(defaults.color)
        material.roughness = defaults.roughness
        material.metalness = defaults.metalness
        material.wireframe = false
        mesh.position.set(0, 0, 0)
        spin.speed = defaults.speed
        requestRender()
    }
    const config = createThreeConfig(mesh, spin, reset) as UiObjectConfig
    config.onChange = requestRender
    createTweakpane(panelHost).appendChild(config)

    if (renderer) {
        const r = renderer
        r.setPixelRatio(Math.min(devicePixelRatio, 1.5))
        view.append(r.domElement)
        new ResizeObserver(() => {
            const w = view.clientWidth, h = view.clientHeight
            if (!w || !h) return
            r.setSize(w, h, false)
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            requestRender()
        }).observe(view)
    }
    new IntersectionObserver(entries => {
        visible = entries.some(e => e.isIntersecting)
        if (visible) requestRender()
        else if (raf) {
            cancelAnimationFrame(raf)
            raf = 0
            last = 0
        }
    }).observe(view)
}
