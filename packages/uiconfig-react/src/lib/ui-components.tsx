import {BPComponentProps} from "../components/BPComponent.tsx";
import {BPLabelledComponent} from "../components/BPLabelledComponent.tsx";
import {BPContainerComponent} from "../components/BPContainerComponent.tsx";
import {Class} from "ts-browser-helpers";
import {ConfigObject} from "../components/ConfigObject.tsx";
import {BPInputComponent} from "../components/BPInputComponent.tsx";
import {BPDropdownInputComponent} from "../components/BPDropdownInputComponent.tsx";
import React from "react";
import {UiConfigRendererReact} from "./UiConfigRendererReact.tsx";
import {
    BPValueComponentState, TColorInputVal,
    TVectorInputVal,
    useColorInputState,
    useNumberInputState,
    useVectorInputState
} from "../components/BPValueComponent.tsx";
import {UiObjectConfig} from "uiconfig.js";

export function TextInputComponent<T extends string | number = string>({
                                                                      initialValue,
                                                                      inputProps,
                                                                      strToValue,
                                                                      valToStr,
                                                                      ...props
                                                                  }: BPComponentProps<T> & {
    initialValue?: T
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    strToValue?: (value: string) => T
    valToStr?: (value: T) => string
}) {
    return <BPInputComponent<T>
        config={props.config}
        level={props.level}
        initialState={{
            value: initialValue !== undefined ? valToStr ? valToStr(initialValue) : initialValue as any : strToValue ? strToValue('') : '' as any,
            label: 'Input'
        }}
        // @ts-ignore
        render={({setValue, state, props}: BPInputComponent<T>)=>{
            return (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.5em',
                        width: '100%',
                    }}
                >{state.label}
                    <input
                        {...inputProps}
                        {...props.config.props}
                        name={props.config.name||props.config.uuid}
                        value={state.value}
                        disabled={state.disabled}
                        readOnly={state.readOnly}
                        style={{
                            flexGrow: 1,
                            ...inputProps?.style,
                            ...props.config.props?.style,
                        }}
                        // onChange={(e) => {
                        //     console.log('input onchange', e.target.value)
                        //     setValue(strToValue ? strToValue(e.target.value) : e.target.value as any)
                        // }}
                        onChange={(e) => setValue(strToValue ? strToValue(e.target.value) : e.target.value as any, false)}
                        onBlur={(e) => setValue(strToValue ? strToValue(e.target.value) : e.target.value as any, true)}
                        onKeyDown={(e) => {
                            if (e.code === 'Enter') setValue(strToValue ? strToValue(e.currentTarget.value) : e.currentTarget.value as any, true)
                        }}
                    />
                </div>
            );
        }}
    />
}

export function CheckboxComponent(props: BPComponentProps<boolean>) {
    return <BPInputComponent<boolean>
        {...props}
        initialState={{value: false, label: 'Toggle'}}
        // @ts-ignore
        render={({setValue, state, props}: BPInputComponent<boolean>) =>
            (<div
                style={{
                    display: 'flex',
                    // justifyContent: 'space-between',
                    gap: '0.5em',
                    width: '100%',
                }}
                key={props.config.uuid}
            >{state.label}
                <input
                    {...props.config.props}
                    name={props.config.name||props.config.uuid}
                    checked={state.value}
                    disabled={state.disabled}
                    readOnly={state.readOnly}
                    style={{
                        height: '1.5em',
                        ...props.config.props?.style,
                    }}
                    type="checkbox"
                    onChange={(e) => setValue(e.target.checked)}
                />
            </div>)}
    />
}

export function NumberComponent(props: BPComponentProps<number>) {
    return <TextInputComponent<number>
        {...props}
        strToValue={parseFloat}
        valToStr={String}
        inputProps={{type: 'number'}}
    />
}

function NumberInputFC({setValue, state, config, min, max, step}: {setValue: (v: number, last: boolean) => void, state: BPValueComponentState<number>, config: UiObjectConfig, min: number, max: number, step: number}) {
    const [val, setVal] = useNumberInputState(state.value, min, max, step, setValue);
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5em',
                width: '100%',
            }}
            key={config.uuid}
        >{state.label}
            <input
                value={val}
                name={config.name||config.uuid}
                disabled={state.disabled}
                readOnly={state.readOnly}
                onChange={(e) => setVal(e.target.value, false)}
                onBlur={(e) => setVal(e.target.value, true)}
                onKeyDown={(e) => {
                    if (e.code === 'Enter') setVal(e.currentTarget.value, true)
                }}
                type="number"
                min={min} max={max} step={step}
            />
        </div>
    );
}

function ColorInputFC({setValue, state, config}: {setValue: (v: TColorInputVal, last: boolean) => void, state: BPValueComponentState<TColorInputVal>, config: UiObjectConfig}) {
    const [val, setVal] = useColorInputState(state.value, setValue);
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5em',
                width: '100%',
            }}
            key={config.uuid}
        >{state.label}
            {config.showInput !== false && <input
                value={val}
                disabled={state.disabled}
                readOnly={state.readOnly}
                onChange={(e) => setVal(e.target.value, false)}
                onBlur={(e) => setVal(e.target.value, true)}
                onKeyDown={(e) => {
                    if (e.code === 'Enter') setVal(e.currentTarget.value, true)
                }}
                type="text"
            />}
            <input
                value={val}
                name={config.name||config.uuid}
                disabled={state.disabled}
                readOnly={state.readOnly}
                onChange={(e) => setVal(e.target.value, false)}
                onBlur={(e) => setVal(e.target.value, true)}
                type="color"
            />
        </div>
    );
}

function SliderFC({setValue, state, config, min, max, step}: {setValue: (v: number, last: boolean) => void, state: BPValueComponentState<number>, config: UiObjectConfig, min: number, max: number, step: number}) {
    const [val, setVal] = useNumberInputState(state.value, min, max, step, setValue);
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5em',
                width: '100%',
            }}
            key={config.uuid}
        >{state.label}
            <input
                {...config.props}
                value={val}
                name={config.name||config.uuid}
                disabled={state.disabled}
                readOnly={state.readOnly}
                onChange={(e) => setVal(e.target.value, false)}
                onMouseUp={(e) => setVal(e.currentTarget.value, true)}
                type="range"
                min={min} max={max} step={step}
            />
            {config.showInput !== false && <input
                value={val}
                disabled={state.disabled}
                readOnly={state.readOnly}
                onChange={(e) => setVal(e.target.value, false)}
                onBlur={(e) => setVal(e.target.value, true)}
                onKeyDown={(e) => {
                    if (e.code === 'Enter') setVal(e.currentTarget.value, true)
                }}
                type="number"
                min={min} max={max} step={step}
            />}
        </div>
    );
}

function VectorInputFC({setValue, state, config, min, max, step}: {setValue: (v: TVectorInputVal, last: boolean) => void, state: BPValueComponentState<TVectorInputVal>, config: UiObjectConfig, min: number, max: number, step: number}) {
    const [val, setOne, _setAll] = useVectorInputState(state.value, min, max, step, setValue);
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5em',
                width: '100%',
            }}
            key={config.uuid}
        >{state.label}
            {[0,1,2,3].map(i=>val.length > i && <input
                value={val[i]}
                key={i}
                disabled={state.disabled}
                readOnly={state.readOnly}
                onChange={(e) => setOne(e.target.value, i, false)}
                onBlur={(e) => setOne(e.target.value, i, true)}
                onKeyDown={(e) => {
                    if (e.code === 'Enter') setOne(e.currentTarget.value, i, true)
                }}
                type="number"
                min={min} max={max} step={step}
            />)}
        </div>
    );
}

export function NumberInputComponent(props: BPComponentProps<number>) {
    // console.log('render slider')
    return <BPInputComponent<number>
        {...props}
        initialState={{value: 0, label: 'Number'}}
        // @ts-ignore
        render={({setValue, state, context, props, keyVersion}: BPInputComponent<number>) => {
            const {min, max, step} = context.methods.getBounds(props.config, true)
            return <NumberInputFC key={keyVersion.toString()} setValue={setValue} state={state} config={props.config} min={min} max={max} step={step}/>
        }}
    />
}

export function ColorInputComponent(props: BPComponentProps<TColorInputVal>) {
    // console.log('render slider')
    return <BPInputComponent<TColorInputVal>
        {...props}
        initialState={{value: '#ffffff', label: 'Color'}}
        // @ts-ignore
        render={({setValue, state, props, keyVersion}: BPInputComponent<TColorInputVal>) => {
            return <ColorInputFC key={keyVersion.toString()} setValue={setValue} state={state} config={props.config}/>
        }}
    />
}

export function SliderComponent(props: BPComponentProps<number>) {
    // console.log('render slider')
    return <BPInputComponent<number>
        {...props}
        initialState={{value: 0, label: 'Slider'}}
        // @ts-ignore
        render={({setValue, state, context, props, keyVersion}: BPInputComponent<number>) => {
            const {min, max, step} = context.methods.getBounds(props.config)
            return <SliderFC key={keyVersion.toString()} setValue={setValue} state={state} config={props.config} min={min} max={max} step={step}/>
        }}
    />
}

export function VectorComponent(props: BPComponentProps<TVectorInputVal>) {
    // console.log('render slider')
    return <BPInputComponent<TVectorInputVal>
        {...props}
        initialState={{value: [0,0,0], label: 'Vector'}}
        // @ts-ignore
        render={({setValue, state, context, props, keyVersion}: BPInputComponent<TVectorInputVal>) => {
            const {min, max, step} = context.methods.getBounds(props.config, true)
            return <VectorInputFC key={keyVersion.toString()} setValue={setValue} state={state} config={props.config} min={min} max={max} step={step}/>
        }}
    />
}

export function ButtonComponent(props: BPComponentProps<void>) {
    return <BPLabelledComponent<void>
        {...props}
        initialState={{label: 'Button'}}
        render={({state, context}) =>
            (
                <button
                    {...props.config.props}
                    style={{
                        width: '100%',
                        ...props.config.props?.style,
                    }}
                    key={props.config.uuid}
                    disabled={state.disabled}
                    onClick={(event) => context.methods.clickButton(props.config, {args: [event]})}
                >{state.label}</button>
            )}
    />
}

export function FolderComponent(props: BPComponentProps<void>) {
    return <BPContainerComponent
        {...props}
        initialState={{children: [], expanded: false, label: 'Folder'}}
        // @ts-ignore
        render={({state, toggleExpanded, props}: BPContainerComponent)=>{
            return (
                <div
                    style={{
                        marginLeft: props.level ? (props.level * 20) + 'px' : '0',
                        width: `calc(100% - ${props.level ? (props.level * 20) + 'px' : '0px'})`,
                    }}
                >
                    <div onClick={toggleExpanded}
                         style={{
                             textAlign: 'left',
                             border: 'none',
                             outline: 'none',
                             cursor: 'pointer',
                             position: 'relative',
                             paddingRight: '20px',
                             color: '#333',
                             userSelect: 'none',
                             boxSizing: 'border-box',
                             padding: '5px',
                             fontSize: '14px',
                             width: `100%`,
                             backgroundColor: state.expanded ? 'lightblue' : 'white',
                         }}
                    >{state.label}
                        <span style={{
                            position: 'absolute',
                            right: '10px',
                            fontSize: '10px',
                            color: '#777',
                            height: '100%',
                            lineHeight: '24px',
                        }}>{state.expanded ? '\u2796' : '\u2795'}</span>
                    </div>
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5em',
                        paddingTop: '5px',
                    }}>
                        {state.expanded && state.children.map((c, i) =>
                            <ConfigObject key={c.uuid ?? ('c' + i)}
                                          {...props}
                                          config={c}
                                          level={(props.level ?? 0) + 1}/>)}
                    </div>
                </div>
            )
        }}
    />
}

export function DropdownComponent(props: BPComponentProps<string | number>) {
    return <BPDropdownInputComponent<string | number>
        {...props}
        initialState={{
            value: '0',
            label: 'Dropdown',
            options: [{label: 'none', value: ''}]
        }}
        // @ts-ignore
        render={({setValue, state}: BPDropdownInputComponent<string | number>) => {
            const item = state.options.find(o => o.value === state.value) || state.options[0]
            return (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.5em',
                        width: '100%',
                    }}
                    key={props.config.uuid}
                >{state.label}
                    <select
                        {...props.config.props}
                        value={item.value}
                        disabled={state.disabled || state.readOnly}
                        onChange={(e) => setValue(e.target.value)}
                    >
                        {state.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            );
        }}
    />
}

export const ConfigObjectGeneratorsSample = {
    input: TextInputComponent,
    number: NumberInputComponent,
    button: ButtonComponent,
    folder: FolderComponent,
    dropdown: DropdownComponent,
    slider: SliderComponent,
    checkbox: CheckboxComponent,
    toggle: CheckboxComponent,
    panel: FolderComponent,
    // folder: bpPopFolderGenerator,
    // tree: BPTreeFolderComponent,
    color: ColorInputComponent,
    // image: BPFileComponent,
    vector: VectorComponent,
    vec: VectorComponent,
}

export class RendererSample extends UiConfigRendererReact {
    protected _styles?: HTMLStyleElement
    constructor() {
        super()
        Object.assign(this.ConfigObjectGenerators, ConfigObjectGeneratorsSample)
    }

    start() {
        // this._styles = createStyles(cssString)
        super.start();
    }

    stop() {
        this._styles?.remove()
        super.stop()
    }

    static Provider = ({renderer, rClass, children}: {renderer?: RendererSample, rClass?: Class<RendererSample>, children: React.ReactNode})=>{
        return UiConfigRendererReact.Provider({renderer, rClass: rClass ?? RendererSample, children})
    }
}