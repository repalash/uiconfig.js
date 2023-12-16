import React, {createContext} from "react";
import type {UiConfigRendererBlueprint} from '../UiConfigRendererBlueprint'
import {UiObjectConfig} from 'uiconfig.js'

export type BPComponentProps<T> = {
    config: UiObjectConfig<T>,
    level?: number
}
export type BPComponentState = {

}
export const UiConfigRendererContext = createContext<UiConfigRendererBlueprint>(null as any)
export abstract class BPComponent<TValue, TState, TProps extends BPComponentProps<TValue> = BPComponentProps<TValue>> extends React.Component<TProps, TState> {
    static contextType = UiConfigRendererContext
    context!: React.ContextType<typeof UiConfigRendererContext>

    protected constructor(props: TProps, context: React.ContextType<typeof UiConfigRendererContext>, state: TState) {
        super(props, context);
        this.state = this.getUpdatedState(state)
        // this.state = state
    }

    setStatePromise(state: TState) {
        return new Promise<void>(resolve => this.setState(state, resolve))
    }

    abstract getUpdatedState(state: TState): TState;

    private _refreshing = false;
    async refreshConfigState(state?: TState) {
        if (!this.props.config) return;
        if (this._refreshing) return;
        this._refreshing = true
        const s = this.getUpdatedState(state || this.state)
        // console.log('set state', s)
        await this.setStatePromise(s)
        console.log('refreshing', this.props.config.label, this.props.config.type, this.state)
        this._refreshing = false
    }

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
