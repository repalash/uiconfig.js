import {FolderApi} from 'tweakpane'
import type {ViewProps} from '@tweakpane/core'
import {ChangeEvent, TUiRefreshModes, UiConfigMethods, UiObjectConfig} from 'uiconfig.js'
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

/**
 * The buttons that a folder shows in its header now (set by the folder generator at each render). The renderer refreshes
 * their folder for them, not a body control: a deep refresh can still list a button that just moved from the body.
 */
export const folderHeaderButtons = new WeakSet<UiObjectConfig>()

/**
 * Sets up a header button of a folder as `renderUiObject` does for a body control, since it is not rendered: the binding
 * to its property, its change events to the folder (`onChange` of the folder gets the click) and its refresh (of the
 * folder). By the folder generator at each render, and by {@link mountFolderActions} for the buttons that it reads.
 */
export function setupFolderMenuButton(folder: UiObjectConfig, button: UiObjectConfig) {
    folderHeaderButtons.add(button)
    UiConfigMethods.InitUiConfig(button)
    button.parentOnChange = (ev: ChangeEvent, ...args: any[]) => UiConfigMethods.DispatchOnChangeSync(folder, {...ev}, ...args)
    button.uiRefresh = (_deep = false, mode: TUiRefreshModes | 'immediate' = 'postFrame', delay = 0) => folder.uiRefresh?.(false, mode, delay)
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
      .tpfm-actions { position: absolute; z-index: 1; display: flex; align-items: center; gap: 2px; pointer-events: none; }
      .tpfm-actions > * { pointer-events: auto; }
      .tpfm-actions.tpfm-mounted { position: static; justify-content: flex-end; pointer-events: auto; }
      .tpfm-mounted > .tpfm-action, .tpfm-mounted > .tpfm-button { height: var(--tp-blade-unit-size, 20px); max-height: none; }
      .tpfm-actions > [hidden] { display: none !important; } /* over the display of the icon-only buttons */
      .tpfm-action {
        height: calc(100% - 6px); max-height: var(--tp-blade-unit-size, 20px); padding: 0 8px; border: 0;
        border-radius: var(--tp-element-border-radius, 2px); background: var(--tp-button-background-color, hsl(230, 7%, 70%));
        color: var(--tp-button-foreground-color, hsl(230, 7%, 17%)); font: inherit; font-size: 11px; line-height: 1;
        white-space: nowrap; cursor: pointer;
      }
      .tpfm-action.tpfm-icon-only { width: calc(var(--tp-blade-unit-size, 20px)); padding: 0; display: inline-flex; align-items: center; justify-content: center; }
      .tpfm-icon { display: inline-flex; flex: none; width: 14px; height: 14px; }
      .tpfm-icon > svg, img.tpfm-icon { width: 14px; height: 14px; }
      .tpfm-item { display: flex; align-items: center; gap: 8px; }
      .tpfm-action:hover:not(:disabled) { background: var(--tp-button-background-color-hover, hsl(230, 7%, 75%)); }
      .tpfm-action:disabled { opacity: .5; cursor: default; }
      .tpfm-button {
        width: 22px; height: calc(100% - 4px); max-height: var(--tp-blade-unit-size, 20px); padding: 0; border: 0;
        border-radius: 4px; background: transparent; color: var(--tp-container-foreground-color, inherit);
        font: inherit; font-size: 14px; line-height: 1; cursor: pointer; opacity: .7;
      }
      .tpfm-button:disabled { opacity: .35; cursor: default; }
      .tpfm-button:hover:not(:disabled), .tpfm-button[aria-expanded="true"] { opacity: 1; background: var(--tp-container-background-color-hover, rgba(187, 188, 196, .15)); }
      .tpfm-action:focus-visible, .tpfm-button:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
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
 * The icon of a config (`config.icon`) as an element: SVG markup inline, an image URL as an `<img>`. An icon name gives
 * none (Tweakpane has no icon set), so the label shows instead.
 */
export function iconElement(config: UiObjectConfig): HTMLElement | undefined {
    const icon = getOrCall(config.icon)?.trim()
    if (!icon) return undefined
    if (icon.startsWith('<svg')) {
        const span = document.createElement('span')
        span.className = 'tpfm-icon'
        span.innerHTML = icon // app markup, see UiObjectConfig.icon
        return span
    }
    if (/^(https?:|data:|blob:)/.test(icon) || /[/.]/.test(icon)) {
        const img = document.createElement('img')
        img.className = 'tpfm-icon'
        img.src = icon
        img.alt = ''
        return img
    }
    return undefined
}

/** Sets the content of an item: the icon (with the label, or alone and the label as its name), else the label */
function setItemContent(item: HTMLButtonElement, config: UiObjectConfig, iconOnly: boolean) {
    const label = UiConfigMethods.GetLabel(config)
    const icon = getOrCall(config.icon) ?? ''
    if (item.dataset.label === label && item.dataset.icon === icon) return
    item.dataset.label = label
    item.dataset.icon = icon
    const el = iconElement(config)
    if (el && iconOnly) {
        item.replaceChildren(el)
        item.title = label
        item.setAttribute('aria-label', label)
    } else {
        item.replaceChildren(...el ? [el] : [], label)
        item.removeAttribute('title')
        item.removeAttribute('aria-label')
    }
    item.classList.toggle('tpfm-icon-only', !!el && iconOnly)
}

/**
 * Opens a menu of buttons at an element: a list of buttons (the labels of the configs) under the element, inside the
 * window. A click on an item runs the button through the renderer (`methods.clickButton`, with undo), when the button
 * is still shown and enabled. The keys: the arrow keys, Home and End move between the items, Enter or Space presses
 * one, Escape or Tab closes the menu, and the keys do not reach the page while the menu has the focus. A press outside
 * the menu closes it, and so does the removal or the hiding of the element (its folder, or a parent, is removed or
 * hidden, or the renderer is unmounted). The menu of a folder (its ⋮ button) follows each render of the folder.
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
            setItemContent(item, b, false)
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
    // closes when the anchor leaves the page or is not shown: its folder (or a parent) is removed or hidden, or the
    // renderer is unmounted
    const observer = new MutationObserver(() => {
        if (!anchor.isConnected || !anchor.getClientRects().length) close()
    })
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
        fill(list)
        if (!items.length) close()
        else place() // the items can change the size of the menu (labels, icons)
    }
    menu.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onOutside, true)
    observer.observe(document, {childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden']})
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

/** The actions in the header of a folder */
interface ActionsBar {
    update: (buttons: UiObjectConfig[]) => void
    remove: () => void
}
/** A bar mounted in another element ({@link mountFolderActions}) for a folder config */
interface MountedBar {
    config: UiObjectConfig
    /** `folder`: the folder of this render (its config's `uiRef` is set only after the folder generator returns) */
    update: (buttons: UiObjectConfig[], folder: FolderApi) => void
    layout: () => void
}
/** The header actions of each folder (its element) */
const folderActions = new WeakMap<HTMLElement, ActionsBar>()
/** The bars mounted with each renderer, updated at each render of their folder by that renderer */
const mountedActions = new WeakMap<UiConfigRendererTweakpane, Set<MountedBar>>()

/** Lays out the bars mounted with a renderer again, for a change that is not a render or a resize (its theme) */
export function layoutMountedActions(renderer: UiConfigRendererTweakpane) {
    mountedActions.get(renderer)?.forEach(m => m.layout())
}

/**
 * Adds, updates or removes the actions in the header of a folder, for its menu buttons ({@link isFolderMenuButton}):
 * as many buttons as fit after the title, and a ⋮ button with a menu of the rest. Called by the folder generator at
 * each render, with the menu buttons that it left out of the folder body. It also updates the bars mounted for the
 * folder with {@link mountFolderActions}.
 */
export function updateFolderMenuButton(renderer: UiConfigRendererTweakpane, folder: FolderApi, buttons: UiObjectConfig[], config?: UiObjectConfig) {
    if (config) mountedActions.get(renderer)?.forEach(m => m.config === config && m.update(buttons, folder))
    const element = folder.controller_.view.element as HTMLElement
    let actions = folderActions.get(element)
    if (!buttons.some(b => !isHidden(b))) {
        actions?.remove()
        return
    }
    if (!actions) {
        actions = createFolderActions(renderer, folder)
        folderActions.set(element, actions)
    }
    actions.update(buttons)
}

/** The CSS variables that a mounted bar copies from its folder (its element can be outside the Tweakpane panel) */
const BAR_THEME_VARS = [...THEME_VARS, '--tp-button-background-color', '--tp-button-background-color-hover',
    '--tp-button-foreground-color', '--tp-blade-unit-size', '--tp-element-border-radius']

/**
 * The parts of an actions bar that do not depend on where it is: the bar, a button for each shown menu button, the
 * ⋮ button with a menu of the rest, the disabled state (the folder's, through `viewProps`) and the fit.
 * `layout` places the bar and returns the room for the buttons in px, or undefined when the bar is not shown.
 */
function createActionsBar(renderer: UiConfigRendererTweakpane, opts: {
    className: string
    viewProps: () => ViewProps | undefined
    layout: (bar: HTMLElement) => number | undefined
    afterLayout?: (bar: HTMLElement) => void
}) {
    addStyles()
    const bar = document.createElement('div')
    bar.className = opts.className
    const more = document.createElement('button')
    more.type = 'button'
    more.className = 'tpfm-button'
    more.textContent = '⋮'
    more.title = 'More actions'
    more.setAttribute('aria-label', 'More actions')
    more.setAttribute('aria-haspopup', 'menu')
    more.setAttribute('aria-expanded', 'false')
    bar.appendChild(more)

    const itemOf = new Map<UiObjectConfig, HTMLButtonElement>()
    let shown: UiObjectConfig[] = []
    let overflow: UiObjectConfig[] = []
    // off in a disabled folder, or in a folder in one, like the Tweakpane controls; a disable closes the open menu
    const folderOff = () => !!opts.viewProps()?.globalDisabled.rawValue
    const setDisabled = () => {
        const off = folderOff()
        more.disabled = off
        for (const [b, item] of itemOf) item.disabled = off || isOff(b)
    }
    const onDisabled = () => {
        setDisabled()
        if (folderOff() && open?.anchor === more) closeButtonMenu()
    }
    let watched: ViewProps | undefined
    const watchDisabled = () => {
        const vp = opts.viewProps()
        if (vp === watched) return
        watched?.globalDisabled.emitter.off('change', onDisabled)
        vp?.globalDisabled.emitter.on('change', onDisabled)
        watched = vp
    }

    // removed: a later refresh or render does nothing (no listeners again on a removed bar)
    let disposed = false
    // the buttons that fit in the room, the ⋮ button for the rest
    const layout = () => {
        if (disposed) return
        const items = shown.map(b => itemOf.get(b)).filter((i): i is HTMLButtonElement => !!i)
        for (const item of items) item.hidden = false
        more.hidden = false
        const room = opts.layout(bar)
        if (room === undefined) return
        const gap = 2
        const widths = items.map(i => i.offsetWidth)
        let count = items.length
        if (widths.reduce((sum, w) => sum + w + gap, -gap) > room) {
            let used = more.offsetWidth
            count = 0
            while (count < items.length && used + gap + widths[count] <= room) used += gap + widths[count++]
        }
        items.forEach((item, i) => item.hidden = i >= count)
        more.hidden = count === items.length
        overflow = shown.slice(count)
        opts.afterLayout?.(bar)
        if (open?.anchor === more) {
            if (overflow.length) open.update(overflow)
            else closeButtonMenu()
        }
    }

    const update = (buttons: UiObjectConfig[]) => {
        if (disposed) return
        shown = buttons.filter(b => !isHidden(b))
        for (const [b, item] of itemOf) {
            if (shown.includes(b)) continue
            item.remove()
            itemOf.delete(b)
        }
        const items = shown.map(b => {
            let item = itemOf.get(b)
            if (!item) {
                item = document.createElement('button')
                item.type = 'button'
                item.className = 'tpfm-action'
                item.addEventListener('click', (e) => {
                    if (isHidden(b) || isOff(b) || folderOff()) return
                    renderer.methods.clickButton(b, {args: [e]})
                })
                itemOf.set(b, item)
            }
            setItemContent(item, b, true)
            return item
        })
        if ([...items, more].some((item, i) => bar.children[i] !== item)) bar.replaceChildren(...items, more)
        watchDisabled()
        setDisabled()
        layout()
    }

    more.addEventListener('click', () => {
        if (open?.anchor === more) return closeButtonMenu()
        openButtonMenu(renderer, overflow, more)
    })
    const dispose = () => {
        disposed = true
        watched?.globalDisabled.emitter.off('change', onDisabled)
        watched = undefined
        if (open?.anchor === more) closeButtonMenu()
        bar.remove()
    }
    return {bar, update, layout, dispose}
}

/**
 * The actions in the header of a folder: a bar over the right of the header, with a button for each menu button that
 * fits after the title and a ⋮ button for the rest. It follows the header size (a resize, a theme) and each render.
 */
function createFolderActions(renderer: UiConfigRendererTweakpane, folder: FolderApi): ActionsBar {
    const view = folder.controller_.view
    const element = view.element as HTMLElement, header = view.buttonElement, title = view.titleElement
    const viewProps = folder.controller_.viewProps
    let right = 4
    // over the right of the header, a sibling of it (a button can not hold buttons); its gaps let clicks through to fold
    const actions = createActionsBar(renderer, {
        className: 'tpfm-actions',
        viewProps: () => viewProps,
        layout: (bar) => {
            const h = header.getBoundingClientRect(), box = element.getBoundingClientRect()
            // the header is not shown (an app hides it, or the panel is hidden): no actions there; the resize observer
            // calls this again when it shows. An app that hides the header can mount them elsewhere (mountFolderActions).
            bar.style.display = h.width ? '' : 'none'
            if (!h.width) return undefined
            // the fold mark keeps its room when it is on the right (the Tweakpane default); a theme can put it on the left
            const mark = header.querySelector('.tp-fldv_m')?.getBoundingClientRect()
            right = mark && mark.width && mark.left > h.left + h.width / 2 ? h.right - mark.left + 2 : 4
            // from the padding box of the folder (a theme can give it a border)
            const borderRight = element.offsetWidth - element.clientWidth - element.clientLeft
            bar.style.top = `${h.top - box.top - element.clientTop}px`
            bar.style.height = `${h.height}px`
            bar.style.right = `${box.right - h.right - borderRight + right}px`
            const range = document.createRange()
            range.selectNodeContents(title)
            return h.right - right - Math.max(range.getBoundingClientRect().right, h.left) - 8
        },
        // a long title ends with … before the actions; never wider than the folder, as a padding larger than the header
        // makes the header wider (then the next layout would fit more, and pad more)
        afterLayout: (bar) => {
            const maxPadding = element.clientWidth - parseFloat(getComputedStyle(header).paddingLeft)
            header.style.paddingRight = `${Math.min(right + bar.offsetWidth + 4, maxPadding)}px`
        },
    })
    const observer = new ResizeObserver(() => actions.layout())
    observer.observe(header)
    element.appendChild(actions.bar)

    const remove = () => {
        observer.disconnect()
        actions.dispose()
        header.style.paddingRight = ''
        folderActions.delete(element)
    }
    viewProps.handleDispose(remove)
    return {update: actions.update, remove}
}

/** A bar of a folder's actions mounted in another element, from {@link mountFolderActions} */
export interface MountedFolderActions {
    /** Draws the buttons again from the folder config (a render of the folder does it too) */
    refresh(): void
    /** Removes the bar from the element */
    remove(): void
}

/**
 * Draws the actions of a folder (its menu buttons, {@link isFolderMenuButton}) in another element: as many buttons as
 * fit in the element's width, and a ⋮ button with a menu of the rest, as in a folder header. For an app that hides the
 * header of a folder (and shows its own title row): the actions of a hidden header are not shown there. The bar
 * follows each render of the folder, the element's size and the folder's disabled state, and takes the Tweakpane theme
 * variables of the folder.
 */
export function mountFolderActions(renderer: UiConfigRendererTweakpane, config: UiObjectConfig, element: HTMLElement): MountedFolderActions {
    // the folder of the last render (at first, the rendered folder of the config, if any): kept after it is disposed
    let rendered = config.uiRef as FolderApi | undefined
    const current = () => rendered ?? config.uiRef as FolderApi | undefined
    const folder = () => {
        const f = current()
        return f && !f.controller_.viewProps.get('disposed') ? f : undefined
    }
    const actions = createActionsBar(renderer, {
        className: 'tpfm-actions tpfm-mounted',
        viewProps: () => folder()?.controller_.viewProps,
        layout: (bar) => {
            const f = folder()
            // the colours and sizes of the folder's theme (and none that it does not set, after a change of the theme)
            if (f) {
                const computed = getComputedStyle(f.controller_.view.element)
                for (const v of BAR_THEME_VARS) {
                    const value = computed.getPropertyValue(v)
                    if (value) bar.style.setProperty(v, value)
                    else bar.style.removeProperty(v)
                }
            }
            // as the header: shown only while the folder is rendered (not hidden, also by a folder that holds it, and not
            // removed from the UI); before its first render, shown
            const gone = !!current() && (!f || !f.controller_.view.element.getClientRects().length)
            const shown = !gone && Array.from(bar.children).some(c => c.classList.contains('tpfm-action'))
            bar.style.display = shown ? '' : 'none'
            if (!shown || !element.clientWidth) return undefined
            const style = getComputedStyle(element)
            return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
        },
    })
    const refresh = () => {
        const buttons = renderer.folderMenuButtons(config)
        // set up as the folder render does (a function in children can make new configs; a button added since)
        for (const b of buttons) setupFolderMenuButton(config, b)
        actions.update(buttons)
    }
    // the size of the element, and the folder element: it stops or starts being rendered (a hide, also of a folder that
    // holds it, a fold), which the renderer can do after the folder generator returns; a dispose of the folder too
    const relayout = () => actions.layout()
    const observer = new ResizeObserver(relayout)
    observer.observe(element)
    let watched: FolderApi | undefined
    const watch = (f: FolderApi | undefined) => {
        if (f === watched) return
        if (watched) observer.unobserve(watched.controller_.view.element)
        if (f) {
            observer.observe(f.controller_.view.element)
            f.controller_.viewProps.handleDispose(relayout)
        }
        watched = f
    }
    element.appendChild(actions.bar)
    let set = mountedActions.get(renderer)
    if (!set) mountedActions.set(renderer, set = new Set())
    const handle: MountedBar = {
        config,
        update: (buttons, f) => {
            rendered = f
            watch(f)
            actions.update(buttons)
        },
        layout: relayout,
    }
    set.add(handle)
    const remove = () => {
        observer.disconnect()
        watch(undefined)
        actions.dispose()
        mountedActions.get(renderer)?.delete(handle)
    }
    watch(folder())
    refresh()
    return {refresh, remove}
}
