import {BPValueComponent, BPValueComponentState} from "./BPValueComponent";
import {BPComponent, BPComponentProps, BPComponentProps2, UiConfigRendererContextType} from "./BPComponent";
import {BPContainerComponent} from "./BPContainerComponent";
import {ConfigObject} from "../ConfigObject";
import {safeSetProperty} from "ts-browser-helpers";
import {BPLabelledComponentState} from "./BPLabelledComponent";

// todo rename to GenericValueComponent
export class BPInputComponent<
    TStateValue, TState extends BPValueComponentState<TStateValue> = BPValueComponentState<TStateValue>>
    extends BPValueComponent<TStateValue, TState, TStateValue> {

    constructor(props: BPComponentProps2<TStateValue, TState, BPInputComponent<TStateValue, TState>>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    convertValueToState(value: TStateValue, state: TState): TState {
        return {...state, value}
    }

    async convertStateToValue(state: TState): Promise<TStateValue> {
        return state.value;
    }

}

export function TextComponent(props: BPComponentProps<string>) {
    return <BPInputComponent<string>
        {...props}
        initialState={{value: '', label: 'Input'}}
        render={({setValue, state}: BPInputComponent<string>) =>
            (
                <div
                    key={props.config.uuid}
                >{state.label}
                    <input
                        value={state.value}
                        disabled={state.disabled}
                        readOnly={state.readOnly}
                        onChange={(e) => setValue(e.target.value)}/>
                </div>
            )}
    />
}
export function ButtonComponent(props: BPComponentProps<void>) {
    return <BPComponent<void, BPLabelledComponentState>
        {...props}
        initialState={{label: 'Button'}}
        render={({state, context}) =>
            (
                <button
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
        render={({state, context, setState}: BPContainerComponent) => {
            const setExpanded = (e: boolean) => {
                if (e === state.expanded) return
                setState({...state, expanded: e})
                safeSetProperty(props.config, "expanded", e, true)
                // if (e) state.children.forEach(c => Array.isArray(c) ? null : c.uiRefresh?.("postFrame", true, 1)) // todo: handle array and functions
            }
            const children = context.methods.getChildren(props.config)
            return (
                <div>
                    <button
                        onClick={() => setExpanded(!state.expanded)}
                    >{state.label}</button>
                    {state.expanded && children.map((c, i) => <ConfigObject key={c.uuid ?? ('c' + i)} {...props} config={c} level={(props.level ?? 0) + 1}/>)}
                </div>
            )
        }}/>
}
