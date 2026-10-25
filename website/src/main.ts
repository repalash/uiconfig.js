import './styles/fonts.css'
import './styles/tokens.css'
import './styles/site.css'
import {setupHero} from './sections/hero'
import {setupDual} from './sections/dual'
import {setupSyntax} from './sections/syntax'
import {setupGallery} from './sections/gallery'
import {setupPlayground} from './playground/playground'
import {setupThree} from './sections/three'
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

// the design panel: only with ?design=1 (the parameter switches the panel on and carries nothing else)
if (new URLSearchParams(location.search).get('design') === '1') {
    import('./design/design').then(m => m.setupDesignPanel()).catch(e => console.error(e))
}
