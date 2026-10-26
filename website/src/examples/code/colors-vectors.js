export default function example(ui, {log}) {
    // #region
    // ui.THREE holds three.js's Color, Vector2, Vector3 and Vector4
    // (see the setup code); the components create their values with them
    const style = {
        background: '#1d2433', // hex string
        accent: 0x3346d3, // number
        tint: new ui.THREE.Color(1, 0.6, 0.2), // three.js Color, edited in place
        offset: {x: 0, y: 0.5},
        position: new ui.THREE.Vector3(1, 2, 3),
        rect: {x: 0, y: 0, z: 100, w: 50},
    }

    const config = {
        type: 'folder',
        label: 'Colors and vectors',
        expanded: true,
        children: [
            {type: 'color', label: 'Background', property: [style, 'background']},
            {type: 'color', label: 'Accent', property: [style, 'accent']},
            {type: 'color', label: 'Tint', property: [style, 'tint']},
            {type: 'vec2', label: 'Offset', property: [style, 'offset']},
            {type: 'vec3', label: 'Position', property: [style, 'position']},
            {type: 'vec4', label: 'Rect', property: [style, 'rect']},
        ],
        onChange: (ev) => {
            const v = ev.value
            log(ev.config.label, v?.isColor ? '#' + v.getHexString() : JSON.stringify(v))
        },
    }

    ui.appendChild(config)
    // #endregion
}
