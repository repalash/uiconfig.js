import {
    ChangeEvent,
    clonePrimitive,
    copyPrimitive,
    equalsPrimitive,
    TUiRefreshModes,
    UiConfigMethods,
    UiConfigRendererBase,
    UiObjectConfig,
    UiRefreshListener,
    UiTooltipHook,
    UiTooltipInfo,
} from '../index'
export {titleTooltip} from '../index'
import {AnyFunction, createStyles, getOrCall, IEvent, JSUndoManager} from 'ts-browser-helpers'
import {uiConfigFormStyles} from './styles'
import {iconMarkup} from './icons'

/**
 * How {@link UiConfigForm} draws its configs:
 * - `form`: a row for each field, with its name (the default)
 * - `bar`: a toolbar, one row of buttons: buttons, checkboxes as toggle buttons, dropdowns as selects, and the other
 *   fields as buttons that open the field in a small popover. A folder is a group, with a line between groups.
 * - `stack`: the same buttons in a column
 *
 * A config with an `icon` shows it in front of its label. In a bar on a narrow screen (640 px), a button with an icon
 * shows the icon only, with the label in its tooltip.
 */
export type UiConfigFormLayout = 'form' | 'bar' | 'stack'

/** What a {@link UiConfigFormTooltip} gets besides the text: {@link UiTooltipInfo} of uiconfig.js */
export type UiConfigFormTooltipInfo = UiTooltipInfo

/**
 * The tooltip hook of the buttons of a `bar`: {@link UiTooltipHook} of uiconfig.js, shared by the renderers. A button
 * with an icon (a narrow screen hides its label) gets its label, and a button with a key gets the label and the key
 * (`Snapshot (⌘S)`); `info.needed()` says whether the tooltip adds something now. The form calls the hook again when
 * the label or the key changes, after it calls the function that the hook returned. A stack shows the label and the key
 * in the row: no tooltips. Default: the native `title` ({@link titleTooltip}).
 */
export type UiConfigFormTooltip = UiTooltipHook

export interface UiConfigFormOptions {
    /** One undo step per edit; quick edits of the same field (scrub, typing, the slider) merge into one */
    undoManager?: JSUndoManager
    /** Called after every change, e.g. to redraw */
    onChange?: (config: UiObjectConfig) => void
    /**
     * Called after a dropdown change (also after its undo and redo) or a button click: these can change which fields
     * there are (e.g. the type of a curve). Make the form again then. A form made in this call (synchronously) takes
     * the place of this one: the undo and redo of the older edits refresh it.
     */
    onStructureChange?: () => void
    /**
     * Whether a number field takes whole numbers only. The default: a `stepSize` of 1 or more that is a whole number,
     * or a name of a count ({@link isIntegerName}).
     */
    isInteger?: (config: UiObjectConfig, label: string) => boolean
    /** How the form draws the configs, see {@link UiConfigFormLayout}. Default: `form`. Changes with {@link UiConfigForm.layout}. */
    layout?: UiConfigFormLayout
    /**
     * Called when the function of a button throws or rejects. The button is enabled again. Default: `console.error`.
     */
    onError?: (error: unknown, config: UiObjectConfig) => void
    /** The key of a config, like `⌘S` or `Shift+R`, shown in its tooltip (`bar`) or at the end of its row (`stack`) */
    shortcutOf?: (config: UiObjectConfig) => string | undefined
    /**
     * The tooltips of the buttons of a `bar` (see {@link UiConfigFormTooltip}), e.g. to draw them with a tooltip
     * library. `false`: no tooltips. Default: {@link UiConfigForm.Tooltip} (the native `title`).
     */
    tooltip?: UiConfigFormTooltip | false
}

const isHidden = (c: UiObjectConfig) => !!getOrCall(c.hidden)

/** A part of the form that a refresh updates: the fields of a config, and the folders of the form that hold it */
interface FormRow {
    config: UiObjectConfig
    parents: UiObjectConfig[]
    update: (force?: boolean) => void
    /** Shows or hides its config: runs also while the config is hidden */
    visibility?: boolean
}

/** A tooltip of an element, see {@link UiConfigForm._updateTooltip} */
interface FormTooltip {
    text: string
    hook: UiConfigFormTooltip
    dispose?: () => void
}

/** A colour object, like a three.js `Color` */
interface ColorLike {
    isColor: true
    clone(): ColorLike
    set(css: string): ColorLike
    getHexString(): string
}
const isColorLike = (v: any): v is ColorLike => !!v?.isColor

/** A vector object, like a three.js `Vector3` (x, y, z), or any object with `clone` */
interface VectorLike {
    clone(): VectorLike
    [axis: string]: any
}

type FrameEvent = 'preFrame' | 'preRender' | 'postRender' | 'postFrame'
const FRAME_EVENTS: FrameEvent[] = ['preFrame', 'preRender', 'postRender', 'postFrame']

/**
 * A small plain-DOM form for a list of uiconfig.js configs, the same configs that the Tweakpane and Blueprint panels
 * use. For a popup or a card next to an object, where a panel is too large, or a toolbar over a canvas.
 *
 * - Fields: number (drag the name to scrub, Shift for 10x), slider, checkbox, dropdown (`select`), vector (`vector`),
 *   color, text, button, monitor, and folders (always open). An `input` (or another type) bound to a boolean or a
 *   number gets a checkbox or a number field.
 * - A button's function can return an undo function or `{action, undo, redo}`, as in uiconfig.js (it runs through
 *   `methods.performAction`): the action runs, and with an `undoManager` it is one undo step.
 * - The values are read and written through the bindings of the configs. A change calls `onChange` of the config and
 *   of each parent folder, as the Tweakpane renderer does.
 * - With an `undoManager`, each edit is one undo step. Quick edits of the same field merge into one step.
 * - A config whose `hidden` changes (a function) is shown or hidden on refresh, as in the other renderers. One hidden
 *   when the form is made is drawn the first time it shows. Make the form again when the configs themselves change
 *   ({@link UiConfigFormOptions.onStructureChange}).
 * - An error in the refresh of a field goes to {@link UiConfigFormOptions.onError}; the other fields still update.
 *
 * - A button whose function returns a promise is disabled, and shows a spinner, until the promise settles. An error is
 *   given to {@link UiConfigFormOptions.onError}.
 * - An `icon` of a config (uiconfig.js `icon`): SVG markup, an image URL, or the name of one of the Lucide icons in
 *   {@link lucideIcons} (like `'camera'` or `'download'`), or of an icon that the app added with {@link addIcons}.
 * - The `bar` and `stack` layouts ({@link UiConfigFormLayout}) draw the configs as a toolbar, e.g. the buttons over a
 *   canvas. The colours follow the Tweakpane theme of the page, or the `--ucf-*` variables ({@link uiConfigFormStyles}).
 *
 * Refresh: `config.uiRefresh()` refreshes the fields of the config (and of the configs in it) in the form, next to the
 * other renderers that draw it: the next animation frame, or at once with the mode `immediate`. The form does not
 * watch the values otherwise: call {@link refresh} after a change from elsewhere (code, another panel), e.g. after each
 * frame. Its own undo and redo steps refresh it. A refresh is cheap (the DOM changes only when a value does), so it can
 * run each frame.
 *
 * ```ts
 * const form = new UiConfigForm(UiConfigMethods.GetChildren(object.uiConfig), {undoManager})
 * popup.appendChild(form.element)
 *
 * // a toolbar
 * const bar = new UiConfigForm([
 *     {type: 'button', label: 'Snapshot', icon: 'camera', value: async() => snapshot.downloadSnapshot()},
 *     {type: 'checkbox', label: 'Auto rotate', icon: 'rotate-3d', property: [controls, 'autoRotate']},
 * ], {layout: 'bar'})
 * ```
 */
export class UiConfigForm extends UiConfigRendererBase {
    /**
     * Adds the stylesheet of the form ({@link uiConfigFormStyles}) to the page when the first form is made. Off: the
     * page styles the `ucf-` classes.
     */
    static InjectStyles = true
    /** The buttons of a `bar` have tooltips ({@link UiConfigFormOptions.tooltip}). Off: no tooltips in any form. */
    static Tooltips = true
    private static _styles?: HTMLStyleElement
    /** The form whose `onStructureChange` runs: a form made in it is its {@link _next} */
    private static _replacing?: UiConfigForm

    readonly element: HTMLDivElement
    private _rows: FormRow[] = []
    /** A config that is in the list twice is drawn once */
    private _drawn = new Set<UiObjectConfig>()
    private _undo?: {config: UiObjectConfig, obj: any, key: string | number, cmd: {undo: () => void, redo: () => void}, time: number, before: any}
    /** The config of a continuous edit (scrub, slider, colour picker) that has no final (`last`) change yet */
    private _unfinished?: UiObjectConfig
    /** The form that the page made in `onStructureChange` of this one, to take its place */
    private _next?: UiConfigForm
    private _layout: UiConfigFormLayout
    /** The elements of a bar or a stack that can have a tooltip, and their config */
    private _tooltipTargets: {element: HTMLElement, config: UiObjectConfig}[] = []
    /** The tooltips now, by element */
    private _tooltips = new Map<HTMLElement, FormTooltip>()
    /** Closes the open popover of a field (`bar` and `stack`) */
    private _closePopover?: () => void
    /** The button of the open popover */
    private _popoverAnchor?: HTMLElement
    /** The configs whose `uiRefresh` asked for a refresh in the next frame */
    private _pending = new Set<UiObjectConfig>()
    private _frameRequested = false
    private _disposed = false

    /**
     * @param _configs - the configs to draw, e.g. the children of an object's `uiConfig`
     * @param _options - layout, undo, change callbacks
     */
    constructor(private _configs: UiObjectConfig[], private _options: UiConfigFormOptions = {}) {
        // no frame loop of its own (see _requestFrame), and no undo manager unless one is given
        super(false, undefined, _options.undoManager ?? false)
        const replaced = UiConfigForm._replacing
        if (replaced && !replaced._next) replaced._next = this
        if (UiConfigForm.InjectStyles && !UiConfigForm._styles?.isConnected) UiConfigForm._styles = createStyles(uiConfigFormStyles)
        this._layout = _options.layout ?? 'form'
        // the tooltip hook of this form (renderer.tooltip), else the static Tooltip
        if (_options.tooltip !== undefined) this.tooltip = _options.tooltip
        this.element = document.createElement('div')
        this._build()
    }

    /** How the form draws the configs. A change between `bar` and `stack` keeps the elements; `form` draws them again. */
    get layout(): UiConfigFormLayout {
        return this._layout
    }
    set layout(layout: UiConfigFormLayout) {
        if (layout === this._layout) return
        const redraw = layout === 'form' || this._layout === 'form'
        this._layout = layout
        if (redraw) this._build()
        else {
            this._layoutClasses()
            for (const t of this._tooltipTargets) this._updateTooltip(t.element, t.config)
        }
    }

    /** The classes of the layout on the element; classes that the page added stay (e.g. one that places a toolbar) */
    private _layoutClasses() {
        this.element.classList.remove('ucf-bar', 'ucf-stack')
        this.element.classList.add('ucf')
        if (this._layout !== 'form') this.element.classList.add('ucf-' + this._layout)
    }

    /** Draws the configs (again) */
    private _build() {
        this._clear()
        this._layoutClasses()
        if (this._layout !== 'form') this.element.setAttribute('role', 'toolbar')
        else this.element.removeAttribute('role')
        for (const c of this._configs) this._render(c, this.element, [])
    }

    private _clear() {
        this._closePopover?.()
        for (const t of this._tooltips.values()) t.dispose?.()
        this._tooltips.clear()
        this._tooltipTargets = []
        this._rows = []
        for (const c of this._drawn) this.removeRefreshListener(c)
        this._drawn.clear()
        this._pending.clear()
        while (this.element.lastChild) this.element.lastChild.remove()
    }

    /**
     * Reads the values again, after a change from elsewhere. A field that has the focus keeps what is typed in it.
     * @param force - also the field that has the focus (an undo or redo replaces what it shows)
     */
    refresh(force = false) {
        for (const r of this._rows) this._update(r, force)
    }

    /**
     * Removes the form from the page, and its refresh from the configs (the other renderers that draw them keep
     * theirs). It does not change `uiRef` of the configs, which belongs to another renderer.
     */
    dispose() {
        this._clear()
        this.element.remove()
        this._undo = undefined
        this._disposed = true
        // what waits for a frame of this form (a dispatchMode of a config) runs now
        this._dispatchFrame()
    }

    /** Closes the popover of a field, if one is open (`bar` and `stack`); a value typed in it is set */
    closePopover() {
        this._closePopover?.()
    }

    /** The form on the page now: this one, or the last one made in place of it (an undo of an older edit refreshes it) */
    private get _live(): UiConfigForm {
        return this._next ? this._next._live : this
    }

    /** Calls `onStructureChange`; a form that the page makes in it takes the place of the live form */
    private _structureChange() {
        const prev = UiConfigForm._replacing
        UiConfigForm._replacing = this._live
        try {
            this._options.onStructureChange?.()
        } finally {
            UiConfigForm._replacing = prev
        }
    }

    // region refresh

    /**
     * The refresh of a config in this form (`config.uiRefresh(deep, mode, delay)`): its fields, and those of the
     * configs in it, after `delay` ms, in the next animation frame, or at once with the mode `immediate`.
     */
    protected _createRefreshListener(config: UiObjectConfig): UiRefreshListener {
        return (_deep?: boolean, mode: TUiRefreshModes | 'immediate' = 'postFrame', delay = 0) => this._queueRefresh(config, mode, delay)
    }

    private _queueRefresh(config: UiObjectConfig, mode: TUiRefreshModes | 'immediate', delay: number) {
        if (this._disposed) return
        if (delay > 0) {
            setTimeout(() => this._queueRefresh(config, mode, 0), delay)
            return
        }
        if (mode === 'immediate') {
            this._refreshUiConfigObject(config)
            return
        }
        this._pending.add(config)
        this._requestFrame()
    }

    /** The fields of a config, and of the configs in it (a folder), read their values again */
    protected _refreshUiConfigObject(config: UiObjectConfig) {
        for (const r of this._rows) if (r.config === config || r.parents.includes(config)) this._update(r, false)
    }

    /**
     * The form has no frame loop: it asks for one animation frame when it needs one (a refresh in a frame mode, or
     * something that waits for a frame event of this renderer, like a `dispatchMode` of a config in uiconfig.js).
     */
    private _requestFrame() {
        if (this._frameRequested || this._disposed) return
        this._frameRequested = true
        const frame = () => {
            this._frameRequested = false
            if (this._disposed) return
            this._dispatchFrame()
            const configs = [...this._pending]
            this._pending.clear()
            for (const c of configs) this._refreshUiConfigObject(c)
        }
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(frame)
        else setTimeout(frame, 0)
    }

    /** The frame events of a renderer, once */
    private _dispatchFrame() {
        for (const type of FRAME_EVENTS) this.dispatchEvent({type})
    }

    /** A listener of a frame event (uiconfig.js waits for one for a `dispatchMode`): the form asks for a frame */
    addEventListener(type: 'preFrame' | 'preRender' | 'postRender' | 'postFrame', listener: (event: IEvent<'preFrame' | 'preRender' | 'postRender' | 'postFrame'>) => void) {
        super.addEventListener(type, listener)
        if (FRAME_EVENTS.includes(type)) this._requestFrame()
    }

    // endregion

    private _children(c: UiObjectConfig) {
        return UiConfigMethods.GetChildren(c)
    }

    /**
     * Sets the value of a config through its binding, as one undo step. The form keeps its own setter (not
     * `methods.setValue`): it merges quick edits of a field into one step, calls `onChange` of the folders of the form
     * that hold the config (without setting their `parentOnChange`), calls `onStructureChange` after the undo and redo
     * of a dropdown, and refreshes at once after an undo or redo. See the README.
     * @param last - false while the value still changes (scrub, slider, colour picker), like the `last` of a change event
     * @param structural - the value can change which fields there are (a dropdown): `onStructureChange` is called after
     * the change, and after its undo and redo
     */
    private _set(c: UiObjectConfig, parents: UiObjectConfig[], value: any, last = true, structural = false) {
        // the whole edit (the compare with the value, the change, the undo step) at the event of the dispatchMode of the
        // config, so that edits made before that event run in order, each against the value that the one before left
        this._atDispatch(c, () => this._setNow(c, parents, value, last, structural))
    }

    /** {@link _set}, now */
    private _setNow(c: UiObjectConfig, parents: UiObjectConfig[], value: any, last = true, structural = false) {
        const [obj, key] = UiConfigMethods.GetBinding(c)
        if (!obj) return
        // as SetValue of uiconfig.js: a plain object is kept as it is (a dropdown option keeps its identity); the form
        // never changes one in place, it assigns a new one (a vector edit), so the snapshots can share it
        const before = clonePrimitive(obj[key])
        if (equalsPrimitive(before, value)) {
            if (last) this._endNow(c, parents)
            return
        }
        const apply = (v: any, isLast: boolean, replay = false) => {
            const cur = obj[key]
            const lastValue = clonePrimitive(cur)
            // as SetValue of uiconfig.js: an object with copy() is changed in place; any other value (a plain object
            // like {x, y} too) is assigned through the binding, so a setter (getValue / setValue) runs
            if (cur && typeof cur === 'object' && typeof cur.copy === 'function') copyPrimitive(cur, v)
            else obj[key] = clonePrimitive(v)
            // the events carry the new and the previous value, as the change events of the other renderers
            this._dispatch(c, parents, isLast, replay, {value: obj[key], lastValue})
            if (structural) this._structureChange()
        }
        apply(value, last)
        // a continuous edit of this field (scrub, slider, colour picker) that has not ended yet
        const continuing = this._unfinished === c
        this._unfinished = last ? undefined : c
        const um = this.undoManager
        if (!um) return
        const now = performance.now()
        const u = this._undo
        // the same field (and the same target: a property can be a function) again, in the same gesture or within a
        // second, with no other step between: one step from the first value
        const merge = !!u && u.config === c && u.obj === obj && u.key === key && um.peek() === u.cmd && (continuing || now - u.time < 1000)
        const first = merge && u ? u.before : before
        const after = clonePrimitive(value)
        const cmd = {undo: () => this._atDispatch(c, () => apply(first, true, true)), redo: () => this._atDispatch(c, () => apply(after, true, true))}
        if (merge) um.replaceLast(cmd)
        else um.record(cmd)
        this._undo = {config: c, obj, key, cmd, time: now, before: first}
    }

    /**
     * Runs a change of a config at the event of its `dispatchMode` (`immediate` by default: at once), as `SetValue` of
     * uiconfig.js applies a value (`runAtEvent`)
     */
    private _atDispatch(c: UiObjectConfig, run: () => void) {
        const mode = getOrCall(c.dispatchMode, c) ?? UiConfigMethods.DefaultDispatchMode
        if (mode === 'immediate') return run()
        // a disposed form has no frames: the form made in its place (onStructureChange) schedules it (the undo of an older
        // edit), else it runs now
        const host = this._live
        if (host._disposed) return run()
        // later, in a frame listener: an error goes to onError, not to an unhandled rejection
        void host.methods.runAtEvent(c, () => {
            try {
                run()
            } catch (e) {
                this._error(e, c)
            }
        })
    }

    /**
     * The end of a continuous edit: the final change (`last`), which some configs wait for (e.g. to rebuild a geometry).
     * At the dispatchMode event, after the changes of the edit, which set {@link _unfinished} when they run.
     */
    private _end(c: UiObjectConfig, parents: UiObjectConfig[]) {
        this._atDispatch(c, () => this._endNow(c, parents))
    }

    /** {@link _end}, now */
    private _endNow(c: UiObjectConfig, parents: UiObjectConfig[]) {
        if (this._unfinished !== c) return
        this._unfinished = undefined
        const [obj, key] = UiConfigMethods.GetBinding(c)
        const value = obj ? obj[key] : undefined
        this._dispatch(c, parents, true, false, {value, lastValue: clonePrimitive(value)})
    }

    /**
     * `onChange` of the config, then of each parent folder in the form, then `parentOnChange` of the top one: the same
     * handlers, once each and with the same events, as an edit in a Tweakpane panel (which sets `parentOnChange` on the
     * children that it draws)
     * @param replay - an undo or redo: the fields show the values also when they have the focus
     * @param values - the new value of a field and its value before the change (`value`, `lastValue` of the events)
     */
    private _dispatch(c: UiObjectConfig, parents: UiObjectConfig[], last: boolean, replay = false, values: {value?: any, lastValue?: any} = {}) {
        const path = [...parents, c]
        const {value, lastValue} = values
        for (let i = path.length - 1; i > 0; i--) callOnChange(path[i], {type: 'change', last, config: c, configPath: path.slice(i), target: path[i], value, lastValue})
        UiConfigMethods.DispatchOnChangeSync(path[0], {last, config: c, configPath: path.slice(1), value, lastValue})
        this._options.onChange?.(c)
        // after a rebuild (onStructureChange), the replay of an older edit shows in the form made in place of this one
        this._live.refresh(replay)
    }

    private _render(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[]) {
        if (!c || this._drawn.has(c)) return
        if (UiConfigMethods.GetBaseProps(c).hidden) this._renderWhenShown(c, host, parents)
        else this._renderShown(c, host, parents)
    }

    /**
     * A config that is hidden when the form is made is drawn the first time it shows, in its place: until then its
     * value can be missing (a field hidden while there is no object to edit)
     */
    private _renderWhenShown(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[]) {
        this._drawn.add(c)
        this.addRefreshListener(c)
        const slot = document.createElement('div')
        slot.style.display = 'none'
        host.appendChild(slot)
        let drawn = false
        this._addRow(c, parents, () => {
            if (drawn || UiConfigMethods.GetBaseProps(c).hidden) return
            drawn = true
            // drawn off the page, then put in its place: a draw that throws (goes to onError) leaves nothing half drawn
            const el = this._renderShown(c, document.createElement('div'), parents)
            if (el) host.insertBefore(el, slot)
            slot.remove()
        }, false, true)
    }

    /** Draws a config, and shows or hides it on refresh as its `hidden` changes. Returns its element */
    private _renderShown(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[]) {
        const before = host.lastChild
        this._renderConfig(c, host, parents)
        const el = host.lastChild as HTMLElement | null
        if (!el || el === before) return
        // `hidden` can change (a function): a refresh shows or hides the config, as in the other renderers. A field that
        // hides (or is in a group that hides) closes its open popover, which is outside the toolbar
        let hidden: boolean | undefined
        this._addRow(c, parents, () => {
            const h = !!UiConfigMethods.GetBaseProps(c).hidden
            if (h === hidden) return
            hidden = h
            el.style.display = h ? 'none' : ''
            if (h && this._popoverAnchor && el.contains(this._popoverAnchor)) this._closePopover?.()
        }, true, true)
        return el
    }

    private _renderConfig(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[]) {
        this._drawn.add(c)
        // a config with getValue / setValue gets its property binding here, as in the other renderers
        UiConfigMethods.InitUiConfig(c)
        // config.uiRefresh() refreshes it here, and in the other renderers that draw it
        this.addRefreshListener(c)
        const type = String(getOrCall(c.type))
        const label = labelOf(c)
        // disabled and readOnly can change (a callback): refresh() applies them again. A disabled folder (or a folder in
        // one) disables everything in it, as in the other renderers
        const isDisabled = () => {
            const p = UiConfigMethods.GetBaseProps(c)
            return !!(p.disabled || p.readOnly) || parents.some(f => !!UiConfigMethods.GetBaseProps(f).disabled)
        }
        if (type === 'folder' || type === 'panel') {
            const f = document.createElement('div')
            const path = [...parents, c]
            if (this._layout === 'form') {
                f.className = 'ucf-folder'
                const h = document.createElement('div')
                h.className = 'ucf-folder-head'
                h.textContent = label
                f.appendChild(h)
            } else {
                // a group of buttons in a bar, with a line between groups; a stack also shows its name
                f.className = 'ucf-group'
                f.setAttribute('role', 'group')
                f.setAttribute('aria-label', label)
                if (label) {
                    const h = document.createElement('div')
                    h.className = 'ucf-group-head'
                    h.setAttribute('aria-hidden', 'true')
                    h.textContent = label
                    f.appendChild(h)
                }
            }
            host.appendChild(f)
            for (const ch of this._children(c)) {
                // a child with only a `path`: the binding of the folder, as in the other renderers
                UiConfigMethods.SetupPropertyForwarding(ch, c)
                this._render(ch, f, path)
            }
            return
        }
        if (type === 'button') return this._button(c, host, parents, label, isDisabled)
        if (this._layout === 'form') return this._row(c, host, parents, type, label, isDisabled)
        const kind = this._kind(c, type)
        if (kind === 'checkbox' || kind === 'toggle') return this._toggle(c, host, parents, label, isDisabled)
        if (kind === 'dropdown') return this._selectChip(c, host, parents, label, isDisabled)
        if (kind === 'monitor') return this._readout(c, host, parents, label)
        return this._popoverChip(c, host, parents, type, label, isDisabled)
    }

    /**
     * The kind of field of a config: its type (`select` is a dropdown, `vector` a vec), or for an input (or a type the
     * form does not know) the type of its value
     */
    private _kind(c: UiObjectConfig, type: string) {
        const t = TYPE_ALIASES[type] ?? type
        if (FIELD_TYPES.has(t)) return t
        const v = UiConfigMethods.GetRawValue(c)
        return typeof v === 'boolean' ? 'checkbox' : typeof v === 'number' ? 'number' : 'text'
    }

    private _error(e: unknown, c: UiObjectConfig) {
        if (this._options.onError) this._options.onError(e, c)
        else console.error(e)
    }

    /** Adds a part of the form that a refresh updates, and updates it the first time when `now` */
    private _addRow(config: UiObjectConfig, parents: UiObjectConfig[], update: (force?: boolean) => void, now = false, visibility = false) {
        const r = {config, parents, update, visibility}
        this._rows.push(r)
        if (now) this._update(r)
    }

    /**
     * Updates a row; an error goes to onError, and the other rows still update. The fields of a hidden config (or of a
     * hidden folder) are not read, as their value can be missing then; only the rows that show and hide run.
     */
    private _update(r: FormRow, force?: boolean) {
        try {
            if (!r.visibility && (isHidden(r.config) || r.parents.some(isHidden))) return
            r.update(force)
        } catch (e) {
            this._error(e, r.config)
        }
    }

    /**
     * The icon and the label of a button. Without an icon, the label is the text of the button (as before the icons).
     * @returns a function that draws the icon again when it changes (an `icon` can be a function, e.g. play or pause)
     */
    private _content(el: HTMLElement, c: UiObjectConfig, label: string, labelSpan = false): () => void {
        // an icon that the form cannot draw (an unknown name) is no icon: the label stays
        const icon = () => {
            const v = getOrCall(c.icon) || ''
            return v && canDrawIcon(v) ? v : ''
        }
        let shown = icon()
        // a label can be a function too (Play or Pause): drawn again when it changes
        let text = label
        const isButton = el.tagName.toLowerCase() === 'button'
        // an icon that is a function can come and go: such a config always gets the icon and the label elements
        if (!shown && !labelSpan && typeof c.icon !== 'function') {
            el.textContent = label
            return () => {
                const now = labelOf(c)
                if (now !== text) el.textContent = text = now
            }
        }
        // the name stays the label also when the label is hidden (a bar on a narrow screen shows the icon only)
        if (isButton) el.setAttribute('aria-label', label)
        const i = document.createElement('span')
        i.className = 'ucf-icon'
        const l = document.createElement('span')
        l.className = 'ucf-label'
        l.textContent = label
        el.appendChild(l)
        let iconIn = false
        const showIcon = () => {
            setIcon(i, shown)
            if (shown && !iconIn) el.insertBefore(i, l)
            else if (!shown && iconIn) i.remove()
            iconIn = !!shown
            if (shown) el.classList.add('ucf-has-icon')
            else el.classList.remove('ucf-has-icon')
        }
        showIcon()
        return () => {
            const now = icon()
            if (now !== shown) {
                shown = now
                showIcon()
            }
            const t = labelOf(c)
            if (t === text) return
            l.textContent = text = t
            if (isButton) el.setAttribute('aria-label', t)
        }
    }

    /** The tooltip hook of this form, or none (tooltips off) */
    private _tooltipHook(): UiConfigFormTooltip | undefined {
        // the option `tooltip`, else the static `Tooltip` of the forms (UiConfigForm.Tooltip), else of every renderer
        // (UiConfigRendererBase.Tooltip): the native title by default
        return UiConfigForm.Tooltips ? this.tooltipHook : undefined
    }

    /** An element of a bar or a stack that can have a tooltip ({@link _updateTooltip}) */
    private _tooltip(el: HTMLElement, c: UiObjectConfig) {
        this._tooltipTargets.push({element: el, config: c})
        this._updateTooltip(el, c)
    }

    /**
     * The tooltip of an element in a bar: its label when the label can be hidden (an element with an icon, on a narrow
     * screen), and its key ({@link UiConfigFormOptions.shortcutOf}). A stack shows the label and the key in the row:
     * no tooltip. The hook is called again when the text changes.
     */
    private _updateTooltip(el: HTMLElement, c: UiObjectConfig) {
        const hook = this._layout === 'bar' ? this._tooltipHook() : undefined
        let text: string | undefined
        let label = ''
        let shortcut: string | undefined
        if (hook) {
            label = labelOf(c)
            shortcut = this._options.shortcutOf?.(c) || undefined
            if (shortcut) text = `${label} (${shortcut})`
            else if (el.classList.contains('ucf-has-icon')) text = label
        }
        const old = this._tooltips.get(el)
        if (old && old.text === text && old.hook === hook) return
        old?.dispose?.()
        this._tooltips.delete(el)
        if (!hook || !text) return
        const key = shortcut
        const needed = () => {
            const labelEl = el.querySelector<HTMLElement>('.ucf-label')
            const labelHidden = !!labelEl && labelEl.offsetParent === null
            return labelHidden || !!key && this._layout === 'bar'
        }
        this._tooltips.set(el, {text, hook, dispose: hook(el, text, {label, shortcut, needed}) || undefined})
    }

    private _button(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[], label: string, isDisabled: () => boolean) {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'ucf-button'
        // with keys, the label is in its own element: the key is next to it
        const updateIcon = this._content(b, c, label, !!this._options.shortcutOf)
        b.disabled = isDisabled()
        // while the function of the button runs (a promise): disabled, with a spinner
        let busy = false
        // a click that has not finished (also while it waits for the dispatchMode event): another click does nothing
        let running = false
        const pending = () => {
            if (busy) return
            busy = true
            b.disabled = true
            b.classList.add('ucf-busy')
        }
        // a button can change which fields there are: the page makes the form again after its undo and redo too
        const replayed = () => {
            this._dispatch(c, parents, true, true)
            this._structureChange()
        }
        b.addEventListener('click', async(event: MouseEvent) => {
            if (busy || running) return
            running = true
            // at the event of its `dispatchMode` (immediate by default), as `clickButton` of uiconfig.js runs a button
            const ran = await this.methods.runAtEvent(c, async() => {
                try {
                    const [obj, key] = UiConfigMethods.GetBinding(c, false)
                    const fn = obj ? obj[key] ?? obj.value : undefined
                    // the click event, as `clickButton` of uiconfig.js passes it (unless `sendArgs` is false); undo and
                    // redo run with the same arguments
                    const args = getOrCall(c.sendArgs, c) === false ? [] : [event]
                    // as in uiconfig.js: the result can be an undo function or {action, undo, redo}, one undo step
                    if (typeof fn === 'function') await this.methods.performAction(obj, fn as AnyFunction, args, c, replayed, pending)
                    // called on the config, as `clickButton` of uiconfig.js does (a method-style onClick that uses `this`)
                    if (typeof c.onClick === 'function') await this.methods.performAction(c, c.onClick as AnyFunction, args, c, replayed, pending)
                    return true
                } catch (e) {
                    // a failed run changed nothing to report: no change events, no structure change
                    this._error(e, c)
                    return false
                } finally {
                    running = false
                    if (busy) {
                        busy = false
                        b.classList.remove('ucf-busy')
                        b.disabled = isDisabled()
                    }
                }
            })
            if (!ran) return
            this._dispatch(c, parents, true)
            this._structureChange()
        })
        // the key, at the end of the row in a stack (in a bar it is in the tooltip only)
        let key: HTMLElement | undefined
        let keyText: string | undefined
        const updateKey = () => {
            const k = this._options.shortcutOf?.(c) || ''
            if (k === keyText) return
            keyText = k
            if (!k) {
                key?.remove()
                key = undefined
                return
            }
            if (!key) {
                key = document.createElement('kbd')
                key.className = 'ucf-key'
                key.setAttribute('aria-hidden', 'true')
                b.appendChild(key)
            }
            key.textContent = k
        }
        updateKey()
        host.appendChild(b)
        this._tooltip(b, c)
        this._addRow(c, parents, () => {
            const d = busy || isDisabled()
            if (b.disabled !== d) b.disabled = d
            updateIcon()
            updateKey()
            this._updateTooltip(b, c)
        })
    }

    /** A checkbox in a bar or a stack: a toggle button, pressed while the value is true */
    private _toggle(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[], label: string, isDisabled: () => boolean) {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'ucf-button ucf-toggle'
        const updateIcon = this._content(b, c, label)
        // the value is read when the edit runs (at the dispatchMode event), so two clicks before it toggle twice
        b.addEventListener('click', () => this._atDispatch(c, () => this._setNow(c, parents, !UiConfigMethods.GetRawValue(c))))
        host.appendChild(b)
        this._tooltip(b, c)
        let pressed: string | undefined
        this._addRow(c, parents, () => {
            const p = String(!!UiConfigMethods.GetRawValue(c))
            if (p !== pressed) b.setAttribute('aria-pressed', pressed = p)
            const d = isDisabled()
            if (b.disabled !== d) b.disabled = d
            updateIcon()
            this._updateTooltip(b, c)
        }, true)
    }

    /** A dropdown in a bar or a stack: its label (or icon) and a select */
    private _selectChip(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[], label: string, isDisabled: () => boolean) {
        const wrap = document.createElement('label')
        wrap.className = 'ucf-chip'
        // the label in its own element: the select is next to it
        const updateIcon = this._content(wrap, c, label, true)
        const {sel, update} = this._select(c, parents)
        sel.setAttribute('aria-label', label)
        wrap.appendChild(sel)
        host.appendChild(wrap)
        this._tooltip(wrap, c)
        this._addRow(c, parents, () => {
            update()
            const d = isDisabled()
            if (sel.disabled !== d) sel.disabled = d
            updateIcon()
            this._updateTooltip(wrap, c)
        }, true)
    }

    /** A monitor in a bar or a stack: its label (or icon) and the value, read only */
    private _readout(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[], label: string) {
        const el = document.createElement('div')
        el.className = 'ucf-chip ucf-readout'
        const updateIcon = this._content(el, c, label, true)
        const val = document.createElement('span')
        val.className = 'ucf-value'
        el.appendChild(val)
        host.appendChild(el)
        this._tooltip(el, c)
        let shown: string | undefined
        this._addRow(c, parents, () => {
            const v = valueText(UiConfigMethods.GetRawValue(c))
            if (v !== shown) val.textContent = shown = v
            updateIcon()
            this._updateTooltip(el, c)
        }, true)
    }

    /**
     * Any other field in a bar or a stack (a slider, a number, a colour...): a button with the label and the value, that
     * opens the field (the row of the `form` layout) in a popover
     */
    private _popoverChip(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[], type: string, label: string, isDisabled: () => boolean) {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'ucf-button ucf-more'
        // the name is the label: the value on the button changes
        b.setAttribute('aria-label', label)
        b.setAttribute('aria-haspopup', 'dialog')
        b.setAttribute('aria-expanded', 'false')
        // the label in its own element: the value is next to it
        const updateIcon = this._content(b, c, label, true)
        const val = document.createElement('span')
        val.className = 'ucf-value'
        b.appendChild(val)
        host.appendChild(b)
        this._tooltip(b, c)
        // the field, drawn once; it is on the page while the popover is open
        const pop = document.createElement('div')
        pop.className = 'ucf ucf-popover'
        pop.setAttribute('role', 'dialog')
        pop.setAttribute('aria-label', label)
        this._row(c, pop, parents, type, label, isDisabled)
        /** @param commit - the focused field takes what is typed in it (its change on blur) first; Escape cancels */
        const close = (commit = true) => {
            const focused = document.activeElement as HTMLElement | null
            if (focused && pop.contains(focused)) {
                if (commit) focused.blur()
                // cancel: the field shows the value of the binding again, so the blur below changes nothing
                else this._live.refresh(true)
                b.focus()
            }
            pop.remove()
            b.setAttribute('aria-expanded', 'false')
            document.removeEventListener('pointerdown', onDown, true)
            document.removeEventListener('keydown', onKey, true)
            if (this._closePopover === close) {
                this._closePopover = undefined
                this._popoverAnchor = undefined
            }
        }
        const onDown = (e: Event) => {
            const t = e.target as Node
            if (!pop.contains(t) && !b.contains(t)) close()
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return
            // the key closes the popover only: not also a key of the page (Escape that clears a selection)
            e.preventDefault()
            close(false)
        }
        b.addEventListener('click', () => {
            if (pop.isConnected) return close()
            this._closePopover?.()
            this._closePopover = close
            this._popoverAnchor = b
            popoverParent().appendChild(pop)
            b.setAttribute('aria-expanded', 'true')
            placePopover(pop, b, this._layout === 'stack' ? 'left' : 'top')
            document.addEventListener('pointerdown', onDown, true)
            document.addEventListener('keydown', onKey, true)
            pop.querySelector<HTMLElement>('input, select')?.focus()
        })
        const isColor = this._kind(c, type) === 'color'
        let shown: string | undefined
        this._addRow(c, parents, () => {
            // the button is no longer shown (hidden from elsewhere, the card around it collapsed): the popover closes
            if (pop.isConnected && b.offsetParent === null) close()
            const raw = UiConfigMethods.GetRawValue(c)
            // a colour: its hex code, with a swatch in front
            const color = isColor || isColorLike(raw) ? colorHex(raw) : undefined
            const v = color ?? valueText(raw)
            if (v !== shown) {
                val.textContent = shown = v
                if (color) {
                    val.classList.add('ucf-swatch')
                    val.style.setProperty('--ucf-swatch', color)
                }
            }
            const d = isDisabled()
            if (b.disabled !== d) b.disabled = d
            updateIcon()
            this._updateTooltip(b, c)
        }, true)
    }

    /** A select of the options of a dropdown config */
    private _select(c: UiObjectConfig, parents: UiObjectConfig[]) {
        const value = () => UiConfigMethods.GetRawValue(c)
        const sel = document.createElement('select')
        const opts = this._children(c).map(o => ({label: UiConfigMethods.GetLabel(o), value: o.value ?? UiConfigMethods.GetLabel(o)}))
        opts.forEach((o, i) => sel.appendChild(Object.assign(document.createElement('option'), {value: String(i), textContent: o.label})))
        sel.addEventListener('change', () => this._set(c, parents, opts[+sel.value].value, true, true))
        return {sel, update: () => {
            const v = value()
            const i = opts.findIndex(o => o.value === v || equalsPrimitive(o.value, v))
            if (i >= 0) writeValue(sel, String(i))
        }}
    }

    /** A field of the `form` layout: a row with the name and the input(s) */
    private _row(c: UiObjectConfig, host: HTMLElement, parents: UiObjectConfig[], type: string, label: string, isDisabled: () => boolean) {
        const row = document.createElement('label')
        row.className = 'ucf-row'
        const name = document.createElement('span')
        name.className = 'ucf-name'
        name.textContent = label
        row.appendChild(name)
        host.appendChild(row)
        const value = () => UiConfigMethods.GetRawValue(c)
        const firstRow = this._rows.length
        // an input (or a type the form does not know) bound to a boolean or a number gets a checkbox or a number field
        const kind = this._kind(c, type)

        if (kind === 'checkbox' || kind === 'toggle') {
            const input = document.createElement('input')
            input.type = 'checkbox'
            input.addEventListener('change', () => this._set(c, parents, input.checked))
            row.appendChild(input)
            this._addRow(c, parents, () => {
                const v = !!value()
                if (input.checked !== v) input.checked = v
            })
        } else if (kind === 'dropdown') {
            const {sel, update} = this._select(c, parents)
            row.appendChild(sel)
            this._addRow(c, parents, update)
        } else if (kind === 'color') {
            const input = document.createElement('input')
            input.type = 'color'
            input.addEventListener('input', () => {
                const cur = value()
                if (isColorLike(cur)) this._set(c, parents, cur.clone().set(input.value), false)
                else this._set(c, parents, typeof cur === 'number' ? parseInt(input.value.slice(1), 16) : input.value, false)
            })
            // the picker closes
            input.addEventListener('change', () => this._end(c, parents))
            row.appendChild(input)
            this._addRow(c, parents, (force) => {
                const v = value()
                if (force || document.activeElement !== input) writeValue(input, isColorLike(v) || typeof v === 'number' ? colorHex(v) : String(v ?? '#000000'))
            })
        } else if (kind === 'vec' || kind === 'vec2' || kind === 'vec3' || kind === 'vec4') {
            const v0 = value() as any
            // a three.js vector (x, y, z, w) or a tuple of numbers ([0, 1, 2, 3])
            const isArray = Array.isArray(v0)
            const axes: (string | number)[] = isArray ? v0.map((_: any, i: number) => i) : ['x', 'y', 'z', 'w'].filter(a => typeof v0?.[a] === 'number')
            // the bounds of the config apply to each component
            const {min, max} = UiConfigMethods.GetBounds(c, true)
            const wrap = document.createElement('span')
            wrap.className = 'ucf-vec'
            const inputs = axes.map(a => {
                // the vector is read when the edit runs (at the dispatchMode event), after the edits of the other components
                const input = this._number(c, n => this._atDispatch(c, () => {
                    const cur = value() as number[] | VectorLike
                    const next = Math.min(max, Math.max(min, n))
                    if ((cur as any)?.[a] === next) return // no change: no undo step
                    // a new value: a tuple, an object with clone() (a three.js vector), or a plain object ({x, y})
                    const v: any = Array.isArray(cur) ? [...cur] : typeof cur.clone === 'function' ? cur.clone() : {...cur}
                    v[a] = next
                    this._setNow(c, parents, v)
                }), () => (value() as any)?.[a], getOrCall(c.stepSize))
                input.title = String(a)
                wrap.appendChild(input)
                return input
            })
            row.classList.add('ucf-row-wide')
            row.appendChild(wrap)
            this._addRow(c, parents, (force) => {
                const v = value() as any
                axes.forEach((a, i) => {
                    if (force || document.activeElement !== inputs[i]) writeValue(inputs[i], fmt(v?.[a]))
                })
            })
        } else if (kind === 'number' || kind === 'slider') {
            const {min, max, step} = UiConfigMethods.GetBounds(c, kind === 'number')
            const isInt = (this._options.isInteger ?? defaultIsInteger)(c, label)
            const clamp = (n: number) => Math.min(max, Math.max(min, isInt ? Math.round(n) : n))
            const input = this._number(c, n => this._set(c, parents, clamp(n)), value, getOrCall(c.stepSize))
            if (kind === 'slider') {
                const range = document.createElement('input')
                range.type = 'range'
                range.min = String(min)
                range.max = String(max)
                range.step = String(step)
                range.addEventListener('input', () => this._set(c, parents, clamp(+range.value), false))
                // the slider is released
                range.addEventListener('change', () => this._end(c, parents))
                row.appendChild(range)
                this._addRow(c, parents, () => {
                    writeValue(range, String(value()))
                })
            }
            row.appendChild(input)
            this._addRow(c, parents, (force) => {
                if (force || document.activeElement !== input) writeValue(input, fmt(value()))
            })
            // per pixel: the stepSize of the config (as in Tweakpane), else 1% of the value, and at most 1% of the bounds
            const scrubStep = isInt ? 0.25 : getOrCall(c.stepSize) || ((v: number) => Math.min(Math.max(0.001, Math.abs(v) * 0.01 || 0.01), (max - min) / 100))
            // a scrub edits this field: it shows the value also when it has the focus, which the scrub keeps
            const scrubSet = (n: number) => {
                this._set(c, parents, clamp(n), false)
                // after the edit, which can wait for the dispatchMode event
                this._atDispatch(c, () => writeValue(input, fmt(value())))
            }
            // the end of a drag: the final change, and the next edit is a new undo step (also in the first second), after
            // the moves of the drag, which can wait for the dispatchMode event
            const scrubEnd = () => {
                this._end(c, parents)
                this._atDispatch(c, () => {
                    if (this._undo) this._undo.time = -Infinity
                })
            }
            this._scrub(name, isDisabled, () => +(value() as any), scrubStep, scrubSet, scrubEnd)
        } else if (kind === 'monitor') {
            const out = document.createElement('span')
            out.className = 'ucf-monitor'
            row.appendChild(out)
            this._addRow(c, parents, () => {
                const v = String(value())
                if (out.textContent !== v) out.textContent = v
            })
        } else { // input and any other type: text
            const input = document.createElement('input')
            input.type = 'text'
            input.addEventListener('change', () => this._set(c, parents, input.value))
            row.appendChild(input)
            this._addRow(c, parents, (force) => {
                if (force || document.activeElement !== input) writeValue(input, String(value() ?? ''))
            })
        }
        // the fields of the row, found once: a refresh (on each change, e.g. each move of a scrub) touches the DOM only
        // when a value or the disabled state changes
        const controls = row.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
        let disabled: boolean | undefined
        this._addRow(c, parents, () => {
            const d = isDisabled()
            if (d === disabled) return
            disabled = d
            controls.forEach(el => el.disabled = d)
        })
        // the first values of the fields of this config (a slider has two)
        for (let i = firstRow; i < this._rows.length; i++) this._update(this._rows[i])
    }

    /**
     * A number field. After a committed edit (Enter, the spinner, a blur), it shows the value of the binding, which can
     * be clamped or rounded, also while it has the focus (after the edit, which can wait for the dispatchMode event).
     * @param c - the config, for its dispatchMode
     * @param step - the change of the arrow keys and the spinner: the `stepSize` of the config. A typed value off the
     * step is kept. Without one, the field takes any value and the browser steps by 1.
     */
    private _number(c: UiObjectConfig, set: (n: number) => void, get: () => any, step?: number) {
        const input = document.createElement('input')
        input.type = 'number'
        input.step = step && step > 0 ? String(step) : 'any'
        input.addEventListener('change', () => {
            const n = parseFloat(input.value)
            if (isFinite(n)) set(n)
            this._atDispatch(c, () => input.value = fmt(get()))
        })
        return input
    }

    /**
     * Drag the handle (the name) left or right with the main button to change the number, Shift for 10x
     * @param step - the change per pixel, or a function of the value at the start of the drag
     */
    private _scrub(handle: HTMLElement, isDisabled: () => boolean, get: () => number, step: number | ((v: number) => number), set: (n: number) => void, end: () => void) {
        handle.style.cursor = 'ew-resize'
        handle.addEventListener('pointerdown', e => {
            if (e.button !== 0 || isDisabled()) return
            e.preventDefault()
            handle.setPointerCapture(e.pointerId)
            const x0 = e.clientX
            const v0 = get()
            const perPixel = typeof step === 'function' ? step(v0) : step
            const move = (ev: PointerEvent) => set(v0 + (ev.clientX - x0) * perPixel * (ev.shiftKey ? 10 : 1))
            const up = () => {
                handle.removeEventListener('pointermove', move)
                handle.removeEventListener('pointerup', up)
                handle.removeEventListener('pointercancel', up)
                end()
            }
            handle.addEventListener('pointermove', move)
            handle.addEventListener('pointerup', up)
            handle.addEventListener('pointercancel', up)
        })
    }
}

/** The field types that the form draws as they are; any other type is drawn by the type of its value */
const FIELD_TYPES = new Set(['checkbox', 'toggle', 'dropdown', 'color', 'vec', 'vec2', 'vec3', 'vec4', 'number', 'slider', 'monitor'])
/** Other names of field types, as in the other renderers */
const TYPE_ALIASES: Record<string, string> = {select: 'dropdown', vector: 'vec'}

/** The label of a config: a label from the key of the property gets spaces (roughnessMap: roughness Map); a given label stays as it is */
function labelOf(c: UiObjectConfig) {
    const label = UiConfigMethods.GetLabel(c)
    return getOrCall(c.label) ? label : label.replace(/([a-z])([A-Z])/g, '$1 $2')
}

const isIconUrl = (icon: string) => /^(https?:|data:|blob:)/.test(icon) || /[/.]/.test(icon)
const warnedIcons = new Set<string>()
/** The form can draw the icon: markup, an image URL or a name of an icon ({@link iconMarkup}). An unknown name warns once. */
function canDrawIcon(icon: string) {
    if (icon.trimStart().startsWith('<') || isIconUrl(icon) || iconMarkup(icon)) return true
    if (!warnedIcons.has(icon)) {
        warnedIcons.add(icon)
        console.warn(`UiConfigForm: no icon named "${icon}" (see lucideIcons and addIcons); the label is shown`)
    }
    return false
}

/**
 * Draws an icon into an element: markup (starts with `<`, SVG drawn inline in the text colour), an image URL, or the
 * name of an icon ({@link iconMarkup}). An unknown name draws nothing.
 */
function setIcon(el: HTMLElement, icon: string) {
    while (el.lastChild) el.lastChild.remove()
    if (!icon) return
    if (icon.trimStart().startsWith('<')) {
        el.innerHTML = icon
        return
    }
    if (isIconUrl(icon)) {
        const img = document.createElement('img')
        img.alt = ''
        img.src = icon
        el.appendChild(img)
        return
    }
    const svg = iconMarkup(icon)
    if (svg) el.innerHTML = svg
}

/** Where a popover goes: the element in full screen, else the page body, so it shows above the page */
function popoverParent(): Element {
    return document.fullscreenElement ?? document.body
}

/** A colour value as a CSS hex code: a three.js colour, a number (0xff8800) or a CSS colour string */
function colorHex(v: any): string {
    if (isColorLike(v)) return '#' + v.getHexString()
    if (typeof v === 'number') return '#' + v.toString(16).padStart(6, '0')
    return String(v ?? '')
}

/** A number on a button or a row: whole numbers as they are, others with 4 significant digits (whole from 1000) */
function numberText(n: number) {
    return Number.isInteger(n) ? String(n) : Math.abs(n) >= 1000 ? String(Math.round(n)) : String(+n.toPrecision(4))
}

/** The value of a field on its button in a bar, or of a monitor: a number, a colour, a vector, a text */
function valueText(v: any): string {
    if (v === undefined || v === null) return ''
    if (typeof v === 'number') return numberText(v)
    if (isColorLike(v)) return colorHex(v)
    if (typeof v === 'object') {
        const parts = Array.isArray(v) ? v : ['x', 'y', 'z', 'w'].filter(a => typeof v[a] === 'number').map(a => v[a])
        return parts.map((n: any) => typeof n === 'number' ? numberText(n) : String(n)).join(', ')
    }
    return String(v)
}

/** Places a popover next to its button, inside the window: above it (a bar) or on its left (a stack) */
function placePopover(pop: HTMLElement, anchor: HTMLElement, side: 'top' | 'left') {
    const a = anchor.getBoundingClientRect()
    const p = pop.getBoundingClientRect()
    const gap = 8
    let x = side === 'top' ? a.left + a.width / 2 - p.width / 2 : a.left - p.width - gap
    let y = side === 'top' ? a.top - p.height - gap : a.top + a.height / 2 - p.height / 2
    // no room above or on the left: below or on the right
    if (side === 'top' && y < gap) y = a.bottom + gap
    if (side === 'left' && x < gap) x = a.right + gap
    x = Math.max(gap, Math.min(x, window.innerWidth - p.width - gap))
    y = Math.max(gap, Math.min(y, window.innerHeight - p.height - gap))
    pop.style.left = x + 'px'
    pop.style.top = y + 'px'
}

/** `onChange` of a config, a function or a list of functions, without its `parentOnChange` */
function callOnChange(config: UiObjectConfig, ev: ChangeEvent) {
    const on = config.onChange
    // called on the config, as `UiConfigMethods.DispatchOnChangeSync` calls it (a method-style onChange that uses `this`)
    if (typeof on === 'function') on.call(config, ev)
    else if (Array.isArray(on)) on.flat().forEach(f => typeof f === 'function' && f(ev))
}

/** Sets the value of a field only when it changes: no DOM write (and no new style or layout) for the same value */
function writeValue(el: {value: string}, v: string) {
    if (el.value !== v) el.value = v
}

/** A number with 12 significant digits: no float noise (0.30000000000000004), and small steps (0.00001) stay */
function fmt(v: any) {
    return typeof v === 'number' ? String(+v.toPrecision(12)) : String(v ?? '')
}

/** The default of {@link UiConfigFormOptions.isInteger} */
function defaultIsInteger(c: UiObjectConfig, label: string) {
    const step = getOrCall(c.stepSize)
    if (typeof step === 'number' && step >= 1 && Number.isInteger(step)) return true
    return isIntegerName(String(getOrCall(c.property)?.[1] ?? label))
}

/** A name of a count (segments, sides, steps...): its number field takes whole numbers */
export function isIntegerName(name: string) {
    return /segment|count|sides|detail|points|tubular|radial|steps/i.test(name)
}
