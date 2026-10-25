// The three.js section: loads the demo (three.js's renderer, about 130 KB compressed) when the section comes near
// the viewport, and shows its config.
import {afterLoad, whenNear} from '../renderers'
import threeCode from './three-config.js?highlight'
import {showPanelError} from './panel-error'

export function setupThree() {
    const section = document.getElementById('three')!
    const view = document.getElementById('three-view')!
    const panel = document.getElementById('three-panel')!
    document.getElementById('three-code')!.innerHTML = threeCode
    whenNear(section, () => afterLoad(() => {
        import('./three-demo')
            .then(m => m.mountThreeDemo(view, panel))
            .catch(e => showPanelError(panel, 'The three.js demo did not load', e))
    }))
}
