import React, {createContext} from "react";
import type {UiConfigRendererBlueprint} from '../UiConfigRendererBlueprint'
import {UiObjectConfig} from 'uiconfig.js'
import {getOrCall} from 'ts-browser-helpers'

export type BPComponentProps<T> = {
    config: UiObjectConfig<T>,
    level?: number
}
export type BPComponentState = {
    hidden?: boolean
    disabled?: boolean
    readOnly?: boolean // same as disabled(for most inputs)
}
export const UiConfigRendererContext = createContext<UiConfigRendererBlueprint>(null as any)
export type UiConfigRendererContextType = React.ContextType<typeof UiConfigRendererContext>
export abstract class BPComponent<TValue, TState, TProps extends BPComponentProps<TValue> = BPComponentProps<TValue>> extends React.Component<TProps, TState> {
    static contextType = UiConfigRendererContext
    context!: UiConfigRendererContextType

    protected constructor(props: TProps, context: UiConfigRendererContextType, state: TState) {
        super(props, context);
        this.state = this.getUpdatedState(state)
        // this.state = state
    }

    /**
     * Set the state(and rerender), then return a promise that resolves when the state is set
     * @param state
     */
    setStatePromise(state: TState) {
        return new Promise<void>(resolve => this.setState(state, resolve))
    }

    /**
     * This is called to get the updated state from the config, copy any values/properties from the config to the state here
     * @param state - the current state
     */
    getUpdatedState(state: TState): TState{
        return {
            ...state,
            hidden: getOrCall(this.props.config.hidden) ?? false,
            disabled: getOrCall(this.props.config.disabled) ?? false,
            readOnly: getOrCall(this.props.config.readOnly) ?? false,
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
        // console.log('set state', s)
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

}
