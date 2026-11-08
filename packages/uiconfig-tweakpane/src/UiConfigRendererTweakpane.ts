import {AnyOptions, createDiv, createStyles, css, getOrCall, JSUndoManager} from 'ts-browser-helpers'
import {BladeApi, FolderApi, Pane, TabPageApi} from 'tweakpane'
import {TUiRefreshModes, UiConfigMethods, UiConfigRenderer, UiObjectConfig} from 'uiconfig.js'
import {BladeController, View} from '@tweakpane/core'
import {
    tpButtonInputGenerator,
    tpDropdownInputGenerator,
    tpFolderGenerator,
    tpInputGenerator, tpSeparatorGenerator,
    tpSliderInputGenerator,
    tpTabGenerator, tpTextAreaInputGenerator,
    tpVecInputGenerator,
} from './tpGenerators'
import {THREE, tpColorInputGenerator} from './tpGeneratorsThree'
import * as TextareaPlugin from '@pangenerator/tweakpane-textarea-plugin'
import {folderHeaderButtons, isFolderMenuButton, openButtonMenu} from './tpFolderMenu'

/** Color modes of the theme in `uiconfig-tweakpane/theme.css`. */
export const tweakpaneThemeModes = ['light', 'dark', 'blue', 'white', 'black'] as const
export type TweakpaneThemeMode = typeof tweakpaneThemeModes[number]

/**
 * Applies a color mode of the theme in `uiconfig-tweakpane/theme.css` to an element and the Tweakpane panels in it,
 * by setting the classes `tpTheme` and `tpTheme-<mode>`. Import the stylesheet once. `null` removes the theme.
 * @param element - the panel's container, or any ancestor of the panels
 * @param mode - the color mode, or null for the default Tweakpane look
 */
export function applyTweakpaneTheme(element: HTMLElement, mode: TweakpaneThemeMode | null) {
    element.classList.remove('tpTheme', ...tweakpaneThemeModes.map(m => 'tpTheme-' + m))
    if (mode) element.classList.add('tpTheme', 'tpTheme-' + mode)
}

export class UiConfigRendererTweakpane extends UiConfigRenderer {

    protected _root?: Pane
    protected _container?: HTMLDivElement

    /**
     * A folder shows its direct `button` children with the `context-menu` tag in a menu, from a ⋮ button in its header,
     * instead of in its body, as the blueprint renderer does. A button that also has the `inline` tag stays in the body.
     * Set `false` (before the folders render) to show all the buttons in the body.
     */
    folderMenus = true

    /** The menu buttons of a folder config ({@link folderMenus}): its direct `context-menu` buttons; the menu leaves out the hidden ones */
    folderMenuButtons(config: UiObjectConfig): UiObjectConfig[] {
        return this.folderMenus ? UiConfigMethods.GetChildren(config).filter(isFolderMenuButton) : []
    }

    /**
     * Opens the menu of a folder config at an element, like a click on the ⋮ button of its header: for a folder whose
     * header the app hides, or another button for the same menu.
     * @returns false when the folder has no menu button that is shown, and no menu opens
     */
    openFolderMenu(config: UiObjectConfig, anchor: HTMLElement): boolean {
        return openButtonMenu(this, this.folderMenuButtons(config), anchor)
    }

    /**
     * Applies a color mode of the theme in `uiconfig-tweakpane/theme.css` to this renderer's panel; `null` removes it.
     * Import the stylesheet once (`import 'uiconfig-tweakpane/theme.css'`).
     */
    setTheme(mode: TweakpaneThemeMode | null) {
        if (this._container) applyTweakpaneTheme(this._container, mode)
    }

    unmount() {
        this._root?.dispose()
        super.unmount()
    }

    constructor(container: HTMLElement = document.body, {expanded = true, autoPostFrame = true} = {}, undoManager?: JSUndoManager|false) {
        super(container, autoPostFrame, undefined, undoManager)
        if (this._root) this._root.expanded = expanded
    }

    protected _createUiContainer(): HTMLDivElement {
        const container = createDiv({id: 'tweakpaneUiContainer', addToBody: false})
        // added to the document once, not for each renderer
        if (!document.querySelector('style[data-uiconfig-tweakpane]')) {
            createStyles(css`
              :root{
                --tweakpane-ui-container-width: 300px;
              }
              @media only screen and (min-width: 1500px) {
                :root{
                  --tweakpane-ui-container-width: 300px;
                }
              }
              @media only screen and (min-width: 2500px) {
                :root{
                  --tweakpane-ui-container-width: 500px;
                }
              }
              #tweakpaneUiContainer {
                position: fixed;
                top: 1rem;
                padding-right: 4px;
                padding-bottom: 20px;
                right: 1rem;
                width: var(--tweakpane-ui-container-width);
                height: auto;
                overflow-y: scroll;
                z-index: 100;
                pointer-events: auto;
                max-height: calc(100% - 3rem);
                border-radius: 0.5rem;
                font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
              }
            `).dataset.uiconfigTweakpane = 'container'
        }

        this._container = container
        this._root = new Pane({title: 'Configuration', container})
        this._root.registerPlugin(TextareaPlugin)
        return container
    }


    appendChild(config?: UiObjectConfig, params?: UiObjectConfig) {
        if (!config) return
        super.appendChild(config, params)
        this.renderUiConfig(config)
    }

    renderUiConfig(uiConfig: UiObjectConfig): void {
        this.renderUiObject(uiConfig)
    }

    renderUiObject(uiConfig: UiObjectConfig, parent?: FolderApi | TabPageApi) {
        parent = parent ?? this._root
        if (!uiConfig.type) return
        // console.log(`Render ui ${uiConfig.label} in ${parent?.title}`)
        folderHeaderButtons.delete(uiConfig) // drawn as a control, not in a folder header
        this.methods.initUiConfig(uiConfig)
        if (uiConfig.uiRef && uiConfig.uiRefType !== uiConfig.type) {
            // console.log('Removing UI object because of type mismatch', uiConfig.uiRef)
            this.disposeUiConfig(uiConfig)
        }
        const ui = uiConfig.type ? this.typeGenerators[uiConfig.type]?.(parent, uiConfig, this) as BladeApi<BladeController<View>> | undefined : undefined
        if (ui) {
            ui.hidden = getOrCall(uiConfig.hidden) ?? false
            if (uiConfig.type !== 'button') ui.disabled = getOrCall(uiConfig.disabled) ?? false // todo: also see if property is writable?
            ;(ui as any).srcUiConfig = uiConfig
        }
        uiConfig.uiRef = ui
        uiConfig.uiRefType = ui ? uiConfig.type : undefined
        uiConfig.__uiParent = parent
        uiConfig.uiRefresh =
            (deep = false, mode: TUiRefreshModes | 'immediate' = 'postFrame', delay = 0) =>
                this.addToRefreshQueue(mode, uiConfig, deep, delay)
        ui?.controller_.viewProps.handleDispose(()=>{
            uiConfig.uiRef = undefined
            uiConfig.uiRefType = undefined
            uiConfig.uiRefresh = undefined
        })
    }

    protected _refreshUiConfigObject(config: UiObjectConfig) {
        // a button in a folder header: its folder renders it (a deep refresh can list it before it moved from the body)
        if (folderHeaderButtons.has(config)) return config.uiRefresh?.()
        if (!config.__uiParent) {
            console.error('No parent for ui object', config)
        }
        this.renderUiObject(config, config.__uiParent)
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    THREE: THREE|undefined = (window as any).THREE

    readonly typeGenerators: typeof defaultGenerators & AnyOptions = {
        ...defaultGenerators,
    }

}

const defaultGenerators = {
    panel: tpFolderGenerator,
    folder: tpFolderGenerator,
    tab: tpTabGenerator,
    tabs: tpTabGenerator,
    input: tpInputGenerator,
    number: tpInputGenerator,
    slider: tpSliderInputGenerator,
    separator: tpSeparatorGenerator,
    divider: tpSeparatorGenerator,
    dropdown: tpDropdownInputGenerator,
    select: tpDropdownInputGenerator,
    checkbox: tpInputGenerator,
    toggle: tpInputGenerator,
    button: tpButtonInputGenerator,
    vec: tpVecInputGenerator,
    vector: tpVecInputGenerator,
    vec2: tpVecInputGenerator,
    vec3: tpVecInputGenerator,
    vec4: tpVecInputGenerator,
    textarea: tpTextAreaInputGenerator,
    textArea: tpTextAreaInputGenerator,
    multiline: tpTextAreaInputGenerator,

    // three
    color: tpColorInputGenerator,

    // others
    monitor: (parent: FolderApi, config: UiObjectConfig, plugin: UiConfigRendererTweakpane, params?: any) => {
        config.readOnly = true
        return tpInputGenerator(parent, config, plugin, params)
    },
    // dummy for creating new ones, do not remove.
    dummy: (parent: FolderApi, config: UiObjectConfig, plugin: UiConfigRendererTweakpane, params?: any) => {
        return tpInputGenerator(parent, config, plugin, params)
    },
}
