import {BPLabelledComponent, BPLabelledComponentState} from './BPLabelledComponent'
import {BPComponentProps, UiConfigRendererContextType} from './BPComponent'
import {PanelActions} from '@blueprintjs/core/lib/esm/components/panel-stack2/panelTypes'
import {UiObjectConfig} from 'uiconfig.js'
import {getOrCall} from 'ts-browser-helpers'

declare module '../ConfigObject' {
    interface ConfigProps {
        filter?: (child: UiObjectConfig) => boolean
    }
}

export type BPContainerComponentState = BPLabelledComponentState & {
    children: UiObjectConfig[]
    expanded: boolean
}

export type BPContainerComponentProps = {
    filter?: (child: UiObjectConfig) => boolean
}

export class BPContainerComponent<TState extends BPContainerComponentState=BPContainerComponentState, TProps extends BPContainerComponentProps=BPContainerComponentProps> extends BPLabelledComponent<void, TState, BPComponentProps<void> & PanelActions & TProps> {

    protected _childParentOnChange: UiObjectConfig['parentOnChange'] = (ev, ...args) => {
        // console.warn('child change', ev, this.props.config)
        this.context.methods.dispatchOnChangeSync(this.props.config, {...ev}, ...args)
    }

    protected _registerChild(child: UiObjectConfig) {
        // if(Object.keys(child).length)
        child.parentOnChange = this._childParentOnChange
        if(child.property === undefined &&
            child.value === undefined &&
            child.getValue === undefined &&
            child.setValue === undefined &&
            child.type !== 'button' &&
            (this.props.config.property !== undefined || this.props.config.value !== undefined)
        ) child.property = this.props.config.property !== undefined ? this.props.config.property : [this.props.config, 'value']
    }

    protected _unregisterChild(child: UiObjectConfig) {
        if (child.parentOnChange !== this._childParentOnChange)
            delete child.parentOnChange
        if(Array.isArray(child.property) &&
            (child.property === this.props.config.property ||
                (child.property[0] === this.props.config &&
                    child.property[1] === 'value')
            )
        ) delete child.property
    }

    constructor(props: BPComponentProps<void> & PanelActions & TProps, context: UiConfigRendererContextType, state: TState) {
        super(props, context, state);
    }

    getUpdatedState(state: TState) {
        const oldChildren = state.children
        let newChildren = this.context.methods.getChildren(this.props.config)
            .flatMap(c=>{
                if(c.type === 'folder' &&
                    c.unwrapContents === true
                ){
                    const children2 = this.context.methods.getChildren(c)
                    const enabledToggle = children2[0] && this.context.methods.getBinding(children2[0])[1] === 'enabled' ? children2[0] : undefined
                    enabledToggle && (enabledToggle.hidden = true)
                    return children2
                }
                return c
            })

        // Apply filter if provided
        if (this.props.filter) {
            newChildren = newChildren.filter(this.props.filter)
        }

        const removed = oldChildren.filter(c => !newChildren.includes(c))
        const added = newChildren.filter(c => !oldChildren.includes(c))
        // console.warn(this, this._registerChild, this._childParentOnChange, added, removed)
        removed.forEach(c => this._unregisterChild(c))
        added.forEach(c => this._registerChild(c))
        return {
            ...super.getUpdatedState(state),
            // children: (this.props.config.children || []).map(c => getOrCall(c) || {}).flat(2),
            children: newChildren,
            expanded: getOrCall(this.props.config.expanded) ?? false,
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
