import {FolderApi} from 'tweakpane'
import {UiConfigMethods, UiObjectConfig} from 'uiconfig.js'
import {createStyles, css, getOrCall} from 'ts-browser-helpers'
import type {UiConfigRendererTweakpane} from './UiConfigRendererTweakpane'

/**
 * The tag of a button for a menu: an action on the object, like duplicate or delete. A folder shows its direct button
 * children with this tag in a menu (the ⋮ button of its header), not in its body, as the blueprint renderer does.
 */
export const CONTEXT_MENU_TAG = 'context-menu'
/** With {@link CONTEXT_MENU_TAG}: the button stays in the folder body (other renderers still list it in their menu) */
export const INLINE_TAG = 'inline'

const hasTag = (config: UiObjectConfig, tag: string) => {
    const tags = config.tags
    return Array.isArray(tags) ? tags.includes(tag) : tags === tag
}

/** A button that a folder shows in its menu: a `button` with the `context-menu` tag, without the `inline` tag */
export function isFolderMenuButton(config: UiObjectConfig) {
    return config.type === 'button' && hasTag(config, CONTEXT_MENU_TAG) && !hasTag(config, INLINE_TAG)
}

/** The colours of the menu: read from the folder, since the menu is in the page body, outside the theme classes; the CSS falls back to the Tweakpane defaults */
const THEME_VARS = ['--tp-base-background-color', '--tp-container-foreground-color', '--tp-container-background-color-hover', '--tp-base-font-family', '--tp-font-family']

let styles: HTMLStyleElement | undefined
/** Adds the stylesheet of the ⋮ buttons and the menus to the document, once */
function addStyles() {
    if (styles?.isConnected) return
    styles = createStyles(css`
      .tpfm-button {
        position: absolute; top: 0; right: 22px; z-index: 1; width: 22px; height: var(--tp-blade-unit-size, 20px);
        padding: 0; border: 0; border-radius: 4px; background: transparent; color: var(--tp-container-foreground-color, inherit);
        font: inherit; font-size: 14px; line-height: 1; cursor: pointer; opacity: .7;
      }
      .tpfm-button:hover, .tpfm-button[aria-expanded="true"] { opacity: 1; background: var(--tp-container-background-color-hover, rgba(187, 188, 196, .15)); }
      .tpfm-button:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
      .tpfm-has-menu > .tp-fldv_b { padding-right: 48px; }
      .tpfm-menu {
        position: fixed; z-index: 10000; display: flex; flex-direction: column; min-width: 140px; max-width: calc(100vw - 16px);
        padding: 4px; border-radius: 8px; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box;
        background: var(--tp-base-background-color, hsl(230, 7%, 17%)); color: var(--tp-container-foreground-color, hsl(230, 7%, 75%));
        box-shadow: 0 0 0 1px rgba(0, 0, 0, .08), 0 6px 20px rgba(0, 0, 0, .16);
        font: 400 12px/1.2 var(--tp-font-family, var(--tp-base-font-family, Roboto Mono, Source Code Pro, Menlo, Courier, monospace));
      }
      .tpfm-menu:focus { outline: none; }
      .tpfm-item {
        border: 0; border-radius: 5px; padding: 7px 10px; background: transparent; color: inherit; font: inherit;
        text-align: left; white-space: nowrap; cursor: pointer;
      }
      .tpfm-item:hover:not(:disabled), .tpfm-item:focus-visible { background: var(--tp-container-background-color-hover, rgba(187, 188, 196, .15)); outline: none; }
      .tpfm-item:disabled { opacity: .45; cursor: default; }
      @media (pointer: coarse) { .tpfm-item { padding: 11px 12px; } }
    `)
    styles.dataset.uiconfigTweakpane = 'folder-menu'
}

/** The open menu: its anchor, the function that closes it, and the one that updates its items */
let open: {menu: HTMLElement, anchor: HTMLElement, close: (focusAnchor?: boolean) => void, update: (buttons: UiObjectConfig[]) => void} | undefined

const isHidden = (b: UiObjectConfig) => !!getOrCall(b.hidden)
const isOff = (b: UiObjectConfig) => !!(getOrCall(b.disabled) || getOrCall(b.readOnly))

/**
 * Opens a menu of buttons at an element: a list of buttons (the labels of the configs) under the element, inside the
 * window. A click on an item runs the button through the renderer (`methods.clickButton`, with undo), when the button
 * is still shown and enabled. The keys: the arrow keys, Home and End move between the items, Enter or Space presses
 * one, Escape or Tab closes the menu, and the keys do not reach the page while the menu has the focus. A press outside
 * the menu closes it, and so does the removal of the element from the page (its folder is removed, or the renderer is
 * unmounted). The menu of a folder (its ⋮ button) follows each render of the folder.
 * @returns false when no button is shown (all hidden), and no menu opens
 */
export function openButtonMenu(renderer: UiConfigRendererTweakpane, buttons: UiObjectConfig[], anchor: HTMLElement): boolean {
    closeButtonMenu()
    if (!buttons.some(b => !isHidden(b))) return false
    addStyles()
    const menu = document.createElement('div')
    menu.className = 'tpfm-menu'
    menu.setAttribute('role', 'menu')
    menu.tabIndex = -1 // takes the focus, for its keys, when no item can (all disabled)
    const computed = getComputedStyle(anchor)
    for (const v of THEME_VARS) {
        const value = computed.getPropertyValue(v)
        if (value) menu.style.setProperty(v, value)
    }
    const itemOf = new Map<UiObjectConfig, HTMLButtonElement>()
    let items: HTMLButtonElement[] = []
    // the items of the shown buttons; an item is kept while its button is shown (a refresh during a click keeps the click)
    const fill = (list: UiObjectConfig[]) => {
        const hadFocus = menu.contains(document.activeElement)
        const shown = list.filter(b => !isHidden(b))
        for (const [b, item] of itemOf) {
            if (shown.includes(b)) continue
            item.remove()
            itemOf.delete(b)
        }
        items = shown.map(b => {
            let item = itemOf.get(b)
            if (!item) {
                item = document.createElement('button')
                item.type = 'button'
                item.className = 'tpfm-item'
                item.setAttribute('role', 'menuitem')
                item.addEventListener('click', (e) => {
                    if (isHidden(b) || isOff(b)) return
                    close()
                    renderer.methods.clickButton(b, {args: [e]})
                })
                itemOf.set(b, item)
            }
            const label = UiConfigMethods.GetLabel(b)
            if (item.textContent !== label) item.textContent = label
            item.disabled = isOff(b)
            return item
        })
        if (items.some((item, i) => menu.children[i] !== item)) menu.replaceChildren(...items)
        // the focused item went or was disabled: the focus stays in the menu, for its keys
        if (hadFocus && !menu.contains(document.activeElement)) focusFirst()
    }
    const enabled = () => items.filter(i => !i.disabled)
    const focusFirst = () => (enabled()[0] ?? menu).focus()
    const onKey = (e: KeyboardEvent) => {
        e.stopPropagation()
        const list = enabled()
        const at = list.indexOf(document.activeElement as HTMLButtonElement)
        const go = (i: number) => list[(i + list.length) % list.length]?.focus()
        if (e.key === 'ArrowDown') go(at + 1)
        else if (e.key === 'ArrowUp') go(at < 0 ? -1 : at - 1)
        else if (e.key === 'Home') go(0)
        else if (e.key === 'End') go(-1)
        else if (e.key === 'Escape') close(true)
        else if (e.key === 'Tab') close()
        else return
        e.preventDefault()
    }
    const onOutside = (e: PointerEvent) => {
        if (!menu.contains(e.target as Node) && !anchor.contains(e.target as Node)) close()
    }
    // closes when the anchor leaves the page: its folder is removed, or the renderer is unmounted
    const observer = new MutationObserver(() => !anchor.isConnected && close())
    const close = (focusAnchor = false) => {
        menu.remove()
        observer.disconnect()
        document.removeEventListener('pointerdown', onOutside, true)
        anchor.setAttribute('aria-expanded', 'false')
        if (open?.menu === menu) open = undefined
        if (focusAnchor) anchor.focus()
    }
    // under the anchor, its right edges aligned; inside the window, and scrolls when taller (a phone in landscape)
    const place = () => {
        const r = anchor.getBoundingClientRect()
        menu.style.maxHeight = `${window.innerHeight - 16}px`
        const w = menu.offsetWidth, h = menu.offsetHeight
        menu.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + 'px'
        menu.style.top = Math.max(8, r.bottom + h + 4 > window.innerHeight - 8 ? r.top - h - 4 : r.bottom + 4) + 'px'
    }
    const update = (list: UiObjectConfig[]) => {
        const count = items.length
        fill(list)
        if (!items.length) close()
        else if (items.length !== count) place()
    }
    menu.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onOutside, true)
    observer.observe(document, {childList: true, subtree: true})
    fill(buttons)
    document.body.appendChild(menu)
    place()
    anchor.setAttribute('aria-expanded', 'true')
    open = {menu, anchor, close, update}
    focusFirst()
    return true
}

/** Closes the open menu, if there is one */
export function closeButtonMenu() {
    open?.close()
}

/** The menu buttons of each folder, for its ⋮ button (updated at each render of the folder) */
const folderButtons = new WeakMap<HTMLElement, UiObjectConfig[]>()

/**
 * Adds, updates or removes the ⋮ button in the header of a folder, for its menu buttons ({@link isFolderMenuButton}).
 * Called by the folder generator at each render, with the menu buttons that it left out of the folder body.
 */
export function updateFolderMenuButton(renderer: UiConfigRendererTweakpane, folder: FolderApi, buttons: UiObjectConfig[]) {
    const element = folder.controller_.view.element as HTMLElement
    let button = element.querySelector<HTMLButtonElement>(':scope > .tpfm-button')
    const shown = buttons.some(b => !getOrCall(b.hidden))
    element.classList.toggle('tpfm-has-menu', shown)
    if (!shown) {
        button?.remove()
        folderButtons.delete(element)
        return
    }
    folderButtons.set(element, buttons)
    if (button) {
        if (open?.anchor === button) open.update(buttons) // the open menu shows the buttons of this render
        return
    }
    addStyles()
    button = document.createElement('button')
    button.type = 'button'
    button.className = 'tpfm-button'
    button.textContent = '⋮'
    button.title = 'More actions'
    button.setAttribute('aria-label', 'More actions')
    button.setAttribute('aria-haspopup', 'menu')
    button.setAttribute('aria-expanded', 'false')
    const b = button
    b.addEventListener('click', (e) => {
        e.stopPropagation() // not a click on the folder
        if (open && b.getAttribute('aria-expanded') === 'true') return closeButtonMenu()
        openButtonMenu(renderer, folderButtons.get(element) ?? [], b)
    })
    element.appendChild(b)
}
