import './styles/fonts.css'
import './styles/tokens.css'
import './styles/site.css'
import {setupHero} from './sections/hero'
import {setupDual} from './sections/dual'
import {setupSyntax} from './sections/syntax'
import {setupGallery} from './sections/gallery'
import {setupPlayground} from './playground/playground'
import {setupThree} from './sections/three'
import {DESIGN_STORAGE_KEY} from './design/storage'
import {setupBindingFigure} from './figures/binding-motion'
import {setupHeroFigure} from './figures/hero-motion'

// copy buttons: <button data-copy="text">
document.addEventListener('click', ev => {
    const button = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-copy]')
    if (!button) return
    const label = button.textContent
    navigator.clipboard.writeText(button.dataset.copy!).then(
        () => { button.textContent = 'Copied' },
        () => { button.textContent = 'Copy failed' },
    ).finally(() => setTimeout(() => { button.textContent = label }, 1500))
})

// each section works on its own: an error in one does not stop the others
for (const setup of [setupHeroFigure, setupHero, setupBindingFigure, setupDual, setupSyntax, setupGallery, setupPlayground, setupThree]) {
    try {
        setup()
    } catch (e) {
        console.error(e)
    }
}

// "Tweak this page": the design panel loads on first use. ?design=1 opens it (the parameter carries nothing else);
// choices saved on an earlier visit apply without opening it.
const designButton = document.getElementById('design-toggle') as HTMLButtonElement | null
const loadDesign = () => import('./design/design')
designButton?.addEventListener('click', () => {
    loadDesign().then(m => m.toggleDesignPanel(designButton)).catch(e => console.error(e))
})
let storedDesign = false
try {
    storedDesign = !!localStorage.getItem(DESIGN_STORAGE_KEY)
} catch { /* storage disabled */ }
if (new URLSearchParams(location.search).get('design') === '1') {
    loadDesign().then(m => m.openDesignPanel(designButton)).catch(e => console.error(e))
} else if (storedDesign) {
    loadDesign().then(m => m.applyStoredDesign()).catch(e => console.error(e))
}
