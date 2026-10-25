import '@fontsource-variable/recursive/mono.css'
import './styles.css'
import {setupHero} from './sections/hero'
import {setupDual} from './sections/dual'
import {setupSyntax} from './sections/syntax'
import {setupGallery} from './sections/gallery'
import {setupPlayground} from './playground/playground'
import {setupBindingFigure} from './figures/binding-motion'

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
for (const setup of [setupHero, setupBindingFigure, setupDual, setupSyntax, setupGallery, setupPlayground]) {
    try {
        setup()
    } catch (e) {
        console.error(e)
    }
}
