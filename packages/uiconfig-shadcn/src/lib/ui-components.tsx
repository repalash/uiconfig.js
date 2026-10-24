import {Class, createStyles, safeSetProperty} from "ts-browser-helpers";
import {
    UiConfigContainer,
    UiConfigDropdownInput,
    UiConfigInput,
    UiConfigLabelled,
    ConfigObject,
    UiConfigRendererReact
} from "uiconfig-react/src";
import React from "react";
import {UiConfigBaseProps} from "uiconfig-react/src/components/UiConfigBase.tsx";
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {ChevronsUpDown} from "lucide-react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch";
import shadCnCss from '../globals.css?inline'
import {Slider} from "@/components/ui/slider"
import {
    UiConfigValueBaseState, TColorInputVal,
    TVectorInputVal, useColorInputState,
    useNumberInputState,
    useVectorInputState
} from "uiconfig-react/src/components/UiConfigValueBase.tsx";
import {UiObjectConfig} from "uiconfig.js";

export function TextComponent<T extends string | number = string>({
                                                                      initialValue,
                                                                      inputProps,
                                                                      strToValue,
                                                                      valToStr,
                                                                      ...props
                                                                  }: UiConfigBaseProps<T> & {
    initialValue?: T
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    strToValue?: (value: string) => T
    valToStr?: (value: T) => string
}) {
    return <UiConfigInput<T>
        {...props}
        initialState={{
            value: initialValue !== undefined ? valToStr ? valToStr(initialValue) : initialValue as any : strToValue ? strToValue('') : '' as any,
            label: 'Input'
        }}
        // @ts-ignore
        render={({setValue, state}: UiConfigInput<T>) =>
            (
                <div className="grid w-full max-w-sm items-center gap-1.5 pr-4" key={props.config.uuid}>
                    <Label htmlFor={props.config.name||props.config.uuid}>{state.label}</Label>
                    <Input
                        name={props.config.name||props.config.uuid}
                        {...inputProps}
                        {...props.config.props}
                        value={state.value}
                        disabled={state.disabled}
                        readOnly={state.readOnly}
                        style={{
                            // flexGrow: 1,
                            ...inputProps?.style,
                            ...props.config.props?.style,
                        }}
                        onChange={(e) => setValue(strToValue ? strToValue(e.target.value) : e.target.value as any, false)}
                        onBlur={(e) => setValue(strToValue ? strToValue(e.target.value) : e.target.value as any, true)}
                        onKeyDown={(e) => {
                            if (e.code === 'Enter') setValue(strToValue ? strToValue(e.currentTarget.value) : e.currentTarget.value as any, true)
                        }}
                    />
                </div>
            )}
    />
}

export function NumberComponent(props: UiConfigBaseProps<number>) {
    return <TextComponent<number>
        {...props}
        strToValue={(v)=>parseFloat(v||'0')}
        valToStr={String}
        inputProps={{type: 'number'}}
    />
}

function NumberInputFC({setValue, state, config, min, max, step}: {setValue: (v: number, last: boolean) => void, state: UiConfigValueBaseState<number>, config: UiObjectConfig, min: number, max: number, step: number}) {
    const [val, setVal] = useNumberInputState(state.value, min, max, step, setValue);
    return (
        <div className="grid w-full max-w-sm items-center gap-1.5 pr-4" key={config.uuid}>
            <Label htmlFor={config.name || config.uuid}>{state.label}</Label>
            <Input
                value={val}
                name={config.name || config.uuid}
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

function ColorInputFC({setValue, state, config}: {setValue: (v: TColorInputVal, last: boolean) => void, state: UiConfigValueBaseState<TColorInputVal>, config: UiObjectConfig}) {
    const [val, setVal] = useColorInputState(state.value, setValue);
    return (
        <div className="grid w-full max-w-sm items-center gap-1.5 pr-4" key={config.uuid}>
            <Label htmlFor={config.name || config.uuid}>{state.label}</Label>
            <div className="flex flex-row gap-1.5">
                <Input
                    value={val}
                    name={config.name || config.uuid}
                    disabled={state.disabled}
                    readOnly={state.readOnly}
                    onChange={(e) => setVal(e.target.value, false)}
                    onBlur={(e) => setVal(e.target.value, true)}
                    type="color"
                    className={"max-w-16"}
                />
                {config.showInput !== false && <Input
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
            </div>
        </div>
    );
}

function SliderFC({setValue, state, config, min, max, step}: {setValue: (v: number, last: boolean) => void, state: UiConfigValueBaseState<number>, config: UiObjectConfig, min: number, max: number, step: number}) {
    const [val, setVal] = useNumberInputState(state.value, min, max, step, setValue);
    return (
        <div className="grid w-full max-w-sm items-center gap-1.5 pr-4" key={config.uuid}>
            <Label htmlFor={config.name || config.uuid}>{state.label}</Label>
            <div className="flex flex-row gap-1.5">
                {config.showInput !== false && <Input
                    value={val}
                    disabled={state.disabled}
                    readOnly={state.readOnly}
                    onChange={(e) => setVal(e.target.value, false)}
                    onBlur={(e) => setVal(e.target.value, true)}
                    onKeyDown={(e) => {
                        if (e.code === 'Enter') setVal(e.currentTarget.value, true)
                    }}
                    type="number"
                    className={"max-w-16"}
                    min={min} max={max} step={step}
                />}
                <Slider
                    {...config.props}
                    value={[val]}
                    name={config.name || config.uuid}
                    disabled={state.disabled}
                    readOnly={state.readOnly}
                    onValueChange={(e) => setVal(e[0], false)}
                    onValueCommit={(e) => setVal(e[0], true)}
                    min={min} max={max} step={step}
                />
            </div>
        </div>
    );
}

function VectorInputFC({setValue, state, config, min, max, step}: {setValue: (v: TVectorInputVal, last: boolean) => void, state: UiConfigValueBaseState<TVectorInputVal>, config: UiObjectConfig, min: number, max: number, step: number}) {
    const [val, setOne, _setAll] = useVectorInputState(state.value, min, max, step, setValue);
    return (
        <div className="grid w-full max-w-sm items-center gap-1.5 pr-4" key={config.uuid}>
            <Label /*htmlFor={config.name || config.uuid}*/>{state.label}</Label>
            <div className="flex flex-row gap-1.5">
            {[0,1,2,3].map(i=>val.length > i && <Input
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
        </div>
    );
}

export function NumberInputComponent(props: UiConfigBaseProps<number>) {
    // console.log('render slider')
    return <UiConfigInput<number>
        {...props}
        initialState={{value: 0, label: 'Number'}}
        // @ts-ignore
        render={({setValue, state, context, props, keyVersion}: UiConfigInput<number>) => {
            const {min, max, step} = context.methods.getBounds(props.config, true)
            return <NumberInputFC key={keyVersion.toString()} setValue={setValue} state={state} config={props.config} min={min} max={max} step={step}/>
        }}
    />
}

export function ColorInputComponent(props: UiConfigBaseProps<TColorInputVal>) {
    // console.log('render slider')
    return <UiConfigInput<TColorInputVal>
        {...props}
        initialState={{value: '#ffffff', label: 'Color'}}
        // @ts-ignore
        render={({setValue, state, props, keyVersion}: UiConfigInput<TColorInputVal>) => {
            return <ColorInputFC key={keyVersion.toString()} setValue={setValue} state={state} config={props.config}/>
        }}
    />
}

export function SliderComponent(props: UiConfigBaseProps<number>) {
    return <UiConfigInput<number>
        {...props}
        initialState={{value: 0, label: 'Slider'}}
        // @ts-ignore
        render={({setValue, state, context, keyVersion}: UiConfigInput<number>) => {
            const {min, max, step} = context.methods.getBounds(props.config)
            return <SliderFC key={keyVersion.toString()} setValue={setValue} state={state} config={props.config} min={min} max={max} step={step}/>
        }}
    />
}

export function VectorComponent(props: UiConfigBaseProps<TVectorInputVal>) {
    // console.log('render slider')
    return <UiConfigInput<TVectorInputVal>
        {...props}
        initialState={{value: [0,0,0], label: 'Vector'}}
        // @ts-ignore
        render={({setValue, state, context, props, keyVersion}: UiConfigInput<TVectorInputVal>) => {
            const {min, max, step} = context.methods.getBounds(props.config, true)
            return <VectorInputFC key={keyVersion.toString()} setValue={setValue} state={state} config={props.config} min={min} max={max} step={step}/>
        }}
    />
}

export function RangeSliderComponent(props: UiConfigBaseProps<number>) {
    return <UiConfigInput<number>
        {...props}
        initialState={{value: 0, label: 'Slider'}}
        // @ts-ignore
        render={({setValue, state, context}: UiConfigInput<number>) => {
            const {min, max, step} = context.methods.getBounds(props.config)
            return (
                <div className="grid w-full max-w-sm items-center gap-1.5 pr-4" key={props.config.uuid}>
                    <Label htmlFor={props.config.name||props.config.uuid}>{state.label}</Label>
                    <div className="flex flex-row gap-1.5">
                        {props.config.showInput !== false && <Input
                            value={state.value}
                            disabled={state.disabled}
                            readOnly={state.readOnly}
                            onChange={(e) => setValue(parseFloat(e.target.value||'0'), false)}
                            onBlur={(e) => setValue(parseFloat(e.target.value||'0'), true)}
                            onKeyDown={(e) => {
                                if (e.code === 'Enter') setValue(parseFloat(e.currentTarget.value||'0'), true)
                            }}
                            type="number"
                            min={min} max={max} step={step}
                            className={"max-w-16"}
                        />}
                        <Input
                        {...props.config.props}
                        value={state.value}
                        disabled={state.disabled}
                        readOnly={state.readOnly}
                        onChange={(e) => setValue(parseFloat(e.target.value||'0'), false)}
                        onMouseUp={(e) => setValue(parseFloat(e.currentTarget.value||'0'), true)}
                        type="range"
                        min={min} max={max} step={step}
                    />
                    </div>
                </div>
            );
        }}
    />
}

export function SwitchToggleComponent(props: UiConfigBaseProps<boolean>) {
    return <UiConfigInput<boolean>
        {...props}
        initialState={{value: false, label: 'Toggle'}}
        // @ts-ignore
        render={({setValue, state}: UiConfigInput<boolean>) => {
            return (
                <div className="w-full max-w-sm items-center gap-1.5 pr-4 flex flex-row" key={props.config.uuid}>
                    <Label className={"grow"} htmlFor={props.config.name||props.config.uuid}>{state.label}</Label>
                    <Switch
                        {...props.config.props}
                        checked={state.value}
                        onCheckedChange={setValue}
                        disabled={state.disabled}
                        readOnly={state.readOnly}
                    />
                </div>
            );
        }}
    />
}

export function ButtonComponent(props: UiConfigBaseProps<void>) {
    return <UiConfigLabelled<void>
        {...props}
        initialState={{label: 'Button'}}
        render={({state, context}) =>
            (
                <Button
                    {...props.config.props}
                    style={{
                        width: 'calc(100% - 1rem)',
                        ...props.config.props?.style,
                    }}
                    key={props.config.uuid}
                    disabled={state.disabled}
                    className={"mr-4"}
                    onClick={(event) => context.methods.clickButton(props.config, {args: [event]})}
                >{state.label}</Button>
            )}
    />
}

export function AccordionComponent(props: UiConfigBaseProps<void>) {
    return <UiConfigContainer
        {...props}
        initialState={{children: [], expanded: false, label: 'Folder'}}
        // @ts-ignore
        render={({state, context, setState}: UiConfigContainer) => {
            const toggleExpanded = () => {
                const e = !state.expanded
                setState({...state, expanded: e})
                safeSetProperty(props.config, "expanded", e, true)
                // if (e) state.children.forEach(c => Array.isArray(c) ? null : c.uiRefresh?.("postFrame", true, 1)) // todo: handle array and functions
            }
            const children = context.methods.getChildren(props.config)
            return (
                <Accordion
                    style={{
                        // marginLeft: props.level ? (props.level * 20) + 'px' : '0',
                        // width: `calc(100% - ${props.level ? (props.level * 20) + 'px' : '0px'})`,
                    }}
                    type="single" collapsible className="w-full" key={props.config.uuid}
                    defaultValue={state.expanded ? 'item-1' : undefined}
                >
                    <AccordionItem value={'item-1'}>
                        <AccordionTrigger onClick={toggleExpanded}>
                            {/*<Button variant="ghost" size="sm" className="flex items-center justify-between space-x-4 w-full">*/}
                                <h4 className="text-sm font-semibold px-3">
                                    {state.label}
                                </h4>
                            {/*</Button>*/}
                        </AccordionTrigger>
                        <AccordionContent className="space-x-4 space-y-2 pl-3">
                            <div className="flex flex-col pt-2 gap-2.5">
                                {children.map((c, i) => (
                                    <ConfigObject
                                        key={c.uuid ?? ('c' + i)}
                                        {...props}
                                        config={c}
                                        level={(props.level ?? 0) + 1}
                                    />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )
        }}/>
}
export function CollapsibleComponent(props: UiConfigBaseProps<void>) {
    return <UiConfigContainer
        {...props}
        initialState={{children: [], expanded: false, label: 'Folder'}}
        // @ts-ignore
        render={({state, context, setState}: UiConfigContainer) => {
            const toggleExpanded = (e: boolean) => {
                if(e === state.expanded) return
                setState({...state, expanded: e})
                safeSetProperty(props.config, "expanded", e, true)
                // if (e) state.children.forEach(c => Array.isArray(c) ? null : c.uiRefresh?.("postFrame", true, 1)) // todo: handle array and functions
            }
            const children = context.methods.getChildren(props.config)
            return (
                <Collapsible
                    style={{
                        // marginLeft: props.level ? (props.level * 20) + 'px' : '0',
                        // width: `calc(100% - ${props.level ? (props.level * 20) + 'px' : '0px'})`,
                    }}
                    className="w-full" key={props.config.uuid}
                    open={state.expanded}
                    onOpenChange={toggleExpanded}
                >
                    <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center justify-between space-x-4 w-full">
                        <h4 className="text-sm font-semibold">
                            {state.label}
                        </h4>
                        <ChevronsUpDown className="h-4 w-4"/>
                        <span className="sr-only">Toggle</span>
                    </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-x-4 space-y-2 pl-3">
                        <div className="flex flex-col gap-2.5 pt-2">
                            {children.map((c, i) => (
                                <ConfigObject
                                    key={c.uuid ?? ('c' + i)}
                                    {...props}
                                    config={c}
                                    level={(props.level ?? 0) + 1}
                                />
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )
        }}/>
}

export function SelectComponent(props: UiConfigBaseProps<string | number>) {
    return <UiConfigDropdownInput<string | number>
        {...props}
        initialState={{
            value: '0',
            label: 'Dropdown',
            options: [{label: 'none', value: ''}]
        }}
        // @ts-ignore
        render={({setValue, state}: UiConfigDropdownInput<string | number>) => {
            const item = state.options.find(o => o.value === state.value) || state.options[0]
            return (
                <div className="grid w-full max-w-sm items-center gap-1.5 pr-4" key={props.config.uuid}>
                    <Label htmlFor={props.config.name||props.config.uuid}>{state.label}</Label>
                    <Select
                        {...props.config.props}
                        value={item.value}
                        disabled={state.disabled || state.readOnly}
                        onValueChange={(e) => setValue(e)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a value" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            {state.options.map(o => <SelectItem key={o.value} value={o.value as any}>{o.label}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            );
        }}
    />
}

export const ConfigObjectGeneratorsShadCn = {
    // ...ConfigObjectGeneratorsSample,
    input: TextComponent,
    // number: NumberComponent,
    number: NumberInputComponent,
    button: ButtonComponent,
    panel: AccordionComponent,
    folder: CollapsibleComponent,
    dropdown: SelectComponent,
    select: SelectComponent,
    slider: SliderComponent,
    range: RangeSliderComponent,
    checkbox: SwitchToggleComponent,
    toggle: SwitchToggleComponent,
    vector: VectorComponent,
    vec: VectorComponent,
    color: ColorInputComponent,
    // todo textarea
    // tree: BPTreeFolderComponent,
    // image: BPFileComponent,
    // vec: BPVectorInputComponent,
}

export class RendererShadCn extends UiConfigRendererReact {
    protected _styles?: HTMLStyleElement
    constructor() {
        super()
        Object.assign(this.ConfigObjectGenerators, ConfigObjectGeneratorsShadCn)
    }

    start() {
        this._styles = createStyles(shadCnCss)
        super.start();
    }

    stop() {
        this._styles?.remove()
        super.stop()
    }

    static Provider = ({renderer, rClass, children}: {renderer?: RendererShadCn, rClass?: Class<RendererShadCn>, children: React.ReactNode})=>{
        return UiConfigRendererReact.Provider({renderer, rClass: rClass ?? RendererShadCn, children})
    }

}
