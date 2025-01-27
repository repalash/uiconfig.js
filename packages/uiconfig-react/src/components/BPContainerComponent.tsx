import {BPLabelledComponent, BPLabelledComponentState} from './BPLabelledComponent.tsx'
import {BPComponentProps2, UiConfigRendererContextType} from './BPComponent.tsx'
import {UiObjectConfig} from 'uiconfig.js'
import {getOrCall, safeSetProperty} from 'ts-browser-helpers'

export type BPContainerComponentState = BPLabelledComponentState & {
    children: UiObjectConfig[]
    expanded: boolean
}
export class BPContainerComponent<TState extends BPContainerComponentState=BPContainerComponentState> extends BPLabelledComponent<void, TState> {
    toggleExpanded = () => {
        const e = !this.state.expanded
        this.setState({...this.state, expanded: e})
        safeSetProperty(this.props.config, "expanded", e, true)
        // if (e) state.children.forEach(c => Array.isArray(c) ? null : c.uiRefresh?.("postFrame", true, 1)) // todo: handle array and functions
        this.keyVersion++
    }

    protected _childParentOnChange: UiObjectConfig['parentOnChange'] = (ev, ...args) => {
        // console.warn('child change', ev, this.props.config)
        this.context.methods.dispatchOnChangeSync(this.props.config, {...ev}, ...args)
    }

    protected _registerChild(child: UiObjectConfig) {
        this.context.methods.initUiConfig(child) // dont remove this, as it sets the uuid which is used in key
        child.parentOnChange = this._childParentOnChange
        child.parentProperty = ()=>this.context.methods.getBinding(this.props.config)
        // child.parentPath = ()=>getOrCall(this.props.config.path)

        // todo is this required anymore?
        // if(child.property === undefined &&
        //     child.value === undefined &&
        //     child.getValue === undefined &&
        //     child.setValue === undefined &&
        //     child.type !== 'button' &&
        //     (this.props.config.property !== undefined || this.props.config.value !== undefined)
        // ) child.property = this.props.config.property !== undefined ? this.props.config.property : [this.props.config, 'value']
    }

    protected _unregisterChild(child: UiObjectConfig) {
        if (child.parentOnChange !== this._childParentOnChange)
            child.parentOnChange = undefined
        if (child.parentProperty)
            child.parentProperty = undefined
        // if(Array.isArray(child.property) &&
        //     (child.property === this.props.config.property ||
        //         (child.property[0] === this.props.config &&
        //             child.property[1] === 'value')
        //     )
        // ) delete child.property
    }

    constructor(props: BPComponentProps2<void, TState&BPLabelledComponentState>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    getUpdatedState(state: TState) {
        const oldChildren = state.children
        const newChildren = this.context.methods.getChildren(this.props.config)
        const removed = oldChildren.filter(c => !newChildren.includes(c))
        const added = newChildren.filter(c => !oldChildren.includes(c))
        // console.warn(this, this._registerChild, this._childParentOnChange, added, removed)
        removed.forEach(c => this._unregisterChild(c))
        added.forEach(c => this._registerChild(c))
        const expanded = getOrCall(this.props.config.expanded) ?? false
        if(expanded !== state.expanded || added.length || removed.length) this.keyVersion++
        return {
            ...super.getUpdatedState(state),
            // children: (this.props.config.children || []).map(c => getOrCall(c) || {}).flat(2),
            children: newChildren,
            expanded,
        }
    }

    componentDidMount() {
        super.componentDidMount?.();
        this.state.children.forEach(c => this._registerChild(c))
    }

    componentWillUnmount() {
        super.componentWillUnmount?.();
        this.state.children.forEach(c => this._unregisterChild(c))
    }

}
