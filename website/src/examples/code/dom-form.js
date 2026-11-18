// #region
import {UiConfigForm} from 'uiconfig-dom'
// #endregion

export default function example(ui, {log, view}) {
    // #region
    const light = {on: true, intensity: 1.2, color: '#ffbb55', mode: 'Spot'}

    const config = {
        type: 'folder',
        label: 'Light',
        expanded: true,
        children: [
            {type: 'checkbox', label: 'On', icon: 'sun', property: [light, 'on']},
            {
                type: 'slider',
                label: 'Intensity',
                icon: 'sliders-horizontal',
                bounds: [0, 4],
                stepSize: 0.1,
                property: [light, 'intensity'],
            },
            {type: 'color', label: 'Color', icon: 'palette', property: [light, 'color']},
            {
                type: 'dropdown',
                label: 'Mode',
                icon: 'layers',
                property: [light, 'mode'],
                children: ['Spot', 'Point', 'Area'].map((label) => ({label})),
            },
            {
                type: 'button',
                label: 'Random',
                icon: 'sparkles',
                onClick: () => {
                    light.intensity = Math.round(Math.random() * 40) / 10
                    light.color = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
                    // one call refreshes the config in every renderer that draws it: the panel, the form and the bar
                    config.uiRefresh(true)
                },
            },
        ],
        // a change in any of them
        onChange: (ev) => log(`${ev.config.label}:`, light[ev.config.property?.[1]] ?? 'clicked'),
    }

    // the panel of the page
    ui.appendChild(config)

    // the same config, drawn with plain DOM by uiconfig-dom: a form, and a toolbar
    const syncOthers = () => config.uiRefresh(true)
    const form = new UiConfigForm([config], {undoManager: ui.undoManager, onChange: syncOthers})
    const bar = new UiConfigForm([config], {layout: 'bar', undoManager: ui.undoManager, onChange: syncOthers})
    form.element.classList.add('dom-card')
    bar.element.classList.add('dom-bar')
    view.append(form.element, bar.element)
    // #endregion
}
