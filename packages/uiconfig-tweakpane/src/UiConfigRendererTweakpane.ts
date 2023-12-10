import {AnyOptions, createDiv, createStyles, css, getOrCall} from 'ts-browser-helpers'
import {BladeApi, FolderApi, Pane} from 'tweakpane'
import {TUiRefreshModes, UiConfigRendererBase, UiObjectConfig} from 'uiconfig.js'
import {BladeController, View} from '@tweakpane/core'
import {
    tpButtonInputGenerator,
    tpDropdownInputGenerator,
    tpFolderGenerator,
    tpInputGenerator,
    tpSliderInputGenerator,
    tpVecInputGenerator,
} from './tpGenerators'
import {THREE, tpColorInputGenerator} from './tpGeneratorsThree'

export class UiConfigRendererTweakpane extends UiConfigRendererBase<Pane> {

    constructor(container: HTMLElement = document.body, {expanded = true, autoPostFrame = true} = {}) {
        super(container, autoPostFrame)
        if (this._root) this._root.expanded = expanded
    }

    protected _createUiContainer(): HTMLDivElement {
        const container = createDiv({id: 'tweakpaneUiContainer', addToBody: false})
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
        `)

        this._root = new Pane({title: 'Configuration', container})
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

    renderUiObject(uiConfig: UiObjectConfig, parent?: FolderApi) {
        parent = parent ?? this._root
        if (!uiConfig.type) return
        this.methods.initUiConfig(uiConfig)
        if (uiConfig.uiRef && uiConfig.uiRefType !== uiConfig.type) {
            // console.log('Removing UI object because of type mismatch', uiConfig.uiRef)
            this.disposeUiConfig(uiConfig)
        }
        const ui = uiConfig.type ? this.typeGenerators[uiConfig.type]?.(parent, uiConfig, this) as BladeApi<BladeController<View>> | undefined : undefined
        if (ui) {
            ui.hidden = getOrCall(uiConfig.hidden) ?? false
            ui.disabled = getOrCall(uiConfig.disabled) ?? false // todo: also see if property is writable?
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
    input: tpInputGenerator,
    number: tpInputGenerator,
    slider: tpSliderInputGenerator,
    dropdown: tpDropdownInputGenerator,
    checkbox: tpInputGenerator,
    toggle: tpInputGenerator,
    button: tpButtonInputGenerator,
    vec: tpVecInputGenerator,
    vector: tpVecInputGenerator,
    vec2: tpVecInputGenerator,
    vec3: tpVecInputGenerator,
    vec4: tpVecInputGenerator,

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
