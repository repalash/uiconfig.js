import React, {createContext, ReactNode} from "react";
import {PrimitiveVal, UiObjectConfig} from 'uiconfig.js'
import {getOrCall} from 'ts-browser-helpers'
import {UiConfigRendererReact} from "../lib/UiConfigRendererReact.tsx";

export type BPComponentProps<T> = {
    config: UiObjectConfig<T>,
    level?: number
}
export type BPComponentProps2<T extends PrimitiveVal|void, TState extends BPComponentState, C extends BPComponent<T, TState> = BPComponent<T, TState>> = {
    config: UiObjectConfig<T>,
    level?: number

    render?: (props: C) => ReactNode
    slt?: ()=>ReactNode
    initialState: TState

    // children?: ReactNode
}
export type BPComponentState = {
    hidden?: boolean
    disabled?: boolean
    readOnly?: boolean // same as disabled(for most inputs)
}

export const UiConfigRendererContext = createContext<UiConfigRendererReact>(null as any)
export type UiConfigRendererContextType = React.ContextType<typeof UiConfigRendererContext>

// todo rename to UiConfigComponent?
export class BPComponent<TValue extends PrimitiveVal|void, TState extends BPComponentState=BPComponentState> extends React.Component<BPComponentProps2<TValue, TState, BPComponent<TValue, TState>>, TState> {
    static contextType = UiConfigRendererContext
    declare context: UiConfigRendererContextType

    constructor(props: BPComponentProps2<TValue, TState, BPComponent<TValue, TState>>, context: UiConfigRendererContextType) {
        super(props, context);
        this.state = this.getUpdatedState(props.initialState)
        // this.state = state
        this.setState = this.setState.bind(this)
    }

    /**
     * Set the state(and rerender), then return a promise that resolves when the state is set
     * @param state
     */
    setStatePromise(state: TState) {
        return new Promise<void>(resolve => this.setState(state, resolve))
    }

    keyVersion = 0

    /**
     * This is called to get the updated state from the config, copy any values/properties from the config to the state here
     * @param state - the current state
     */
    getUpdatedState(state: TState): TState{
        const hidden = getOrCall(this.props.config.hidden) ?? false
        const disabled = getOrCall(this.props.config.disabled) ?? false
        const readOnly = getOrCall(this.props.config.readOnly) ?? false
        if(hidden !== state.hidden
            || disabled !== state.disabled
            || readOnly !== state.readOnly
        ) this.keyVersion++
        return {
            ...state,
            hidden,
            disabled,
            readOnly,
        }
    }

    private _refreshing = false;

    /**
     * Refreshes the state from the config
     *
     * This is called by the ui component when the value is changed and from uiRefresh from the config
     * @param state - optional state to refresh from, if not provided, the current state is used
     */
    async refreshConfigState(state?: TState) {
        if (!this.props.config) return;
        if (this._refreshing) return;
        this._refreshing = true
        const s = this.getUpdatedState(state || this.state)
        await this.setStatePromise(s)
        // todo debug refresh frequency etc
        // console.log('refreshing', this.props.config.label, this.props.config.type, this.state)
        this._refreshing = false
    }

    /**
     * Add reference to this to uiRef and set uiRefresh to the config to refresh this component
     *
     * also refreshes the config once which re-renders (todo: check if this is required)
     */
    componentDidMount() {
        super.componentDidMount?.();
        this.props.config.uiRef = this
        this.props.config.uiRefresh = (deep = false, mode = 'postFrame', delay = 0) => {
            // console.log('refresh', this.props.config.label, this.props.config.type)
            this.context.addToRefreshQueue(mode, this.props.config, deep, delay)
        }
        // console.log('mount', this.props.config.label, this.props.config.type, this.props.config)
        this.props.config.uiRefresh()
    }

    componentWillUnmount() {
        // console.log('unmount', this.props.config.label, this.props.config.type, this.props.config)
        this.props.config.uiRef = undefined
        this.props.config.uiRefresh = undefined
        super.componentWillUnmount?.();
    }

    // abstract updateStateValue(state: TState): Promise<void>;

    render() {
        // return this._render ? this._render({...this.state, setValue: this.setValue}) : null
        return this.props.render && !this.state.hidden ? this.props.render(this) : null
        // return this.state.hidden ? null : this.props.children
        // const Child = this.props.slt!
        // return this.state.hidden ? null : this.props.render ? this.props.render(this) : (<BPParentContext.Provider value={this}>
        //     {Child ? <Child/> : null}
        // </BPParentContext.Provider>)
    }
}

const BPParentContext = createContext<BPComponent<any, any>|null>(null)
// export type BPParentContextType = React.ContextType<typeof BPParentContext>
// export const BPParentProvider = BPParentContext.Provider
export const useBPParent = () => React.useContext(BPParentContext)