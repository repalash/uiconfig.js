/** What a {@link UiTooltipHook} gets besides the text */
export interface UiTooltipInfo {
    /** The label of the config (or of the element, like "More actions") */
    label: string
    /** Its key, when the renderer shows one (`uiconfig.js/dom`: `shortcutOf`) */
    shortcut?: string
    /**
     * Whether the tooltip adds something now (the label is hidden, or there is a key). A hook that shows its tooltip on
     * hover can check it then (e.g. tippy.js `onShow`). Always true where the label is never shown (an icon-only button).
     */
    needed: () => boolean
}

/**
 * Draws the tooltip of an element of a renderer: an icon-only button (its label), a button with a key, the ⋮ button of
 * a folder header. Renderers call it with the text, and call the function that it returns to remove the tooltip, before
 * they call it again with a new text (the label or the key changed) and when the element goes.
 *
 * Set it for every renderer with `UiConfigRendererBase.Tooltip`, for the renderers of one class (for example
 * `UiConfigRendererTweakpane.Tooltip`), or for one renderer with its `tooltip` property (`false`: none). The default is
 * {@link titleTooltip}, the native `title`. The accessible name of an element stays its `aria-label`.
 * @param element - the element
 * @param text - the label, and the key in parentheses when there is one: `Snapshot (⌘S)`
 * @param info - the label and the key apart, and whether the tooltip is needed now
 * @returns a function that removes the tooltip, if it needs one
 */
export type UiTooltipHook = (element: HTMLElement, text: string, info: UiTooltipInfo) => void | (() => void)

/** The default {@link UiTooltipHook}: the native `title` of the element */
export const titleTooltip: UiTooltipHook = (element, text) => {
    element.title = text
    return () => element.removeAttribute('title')
}

/** A tooltip that {@link setElementTooltip} set: its text, the hook that drew it, and what removes it */
interface AppliedTooltip {
    text: string
    hook: UiTooltipHook
    dispose?: () => void
}

/** The tooltip on each element that {@link setElementTooltip} set */
const applied = new WeakMap<HTMLElement, AppliedTooltip>()

/**
 * Sets, changes or removes the tooltip of an element with a hook: nothing happens when the text and the hook are the
 * same as last time; else the previous tooltip is removed (the function that its hook returned) and the hook is called
 * with the new text. No hook or no text: the tooltip is removed.
 * @param hook - the hook (`renderer.tooltipHook`), or none
 * @param element - the element
 * @param text - the text of the tooltip, or none to remove it
 * @param info - the label (default: the text), the key and `needed` (default: always)
 */
export function setElementTooltip(hook: UiTooltipHook | undefined, element: HTMLElement, text?: string, info?: Partial<UiTooltipInfo>) {
    const old = applied.get(element)
    if (old && old.text === text && old.hook === hook) return
    old?.dispose?.()
    applied.delete(element)
    if (!hook || !text) return
    const dispose = hook(element, text, {label: info?.label ?? text, shortcut: info?.shortcut, needed: info?.needed ?? (() => true)})
    applied.set(element, {text, hook, dispose: dispose || undefined})
}
