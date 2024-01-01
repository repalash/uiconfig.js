import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {ConfigObject} from "../ConfigObject";
import {BPLabelledComponentState} from "./BPLabelledComponent";
import {PanelActions} from "@blueprintjs/core/lib/esm/components/panel-stack2/panelTypes";
import {UiObjectConfig} from 'uiconfig.js'
import {safeSetProperty} from 'ts-browser-helpers'
import {BPContainerComponent} from './BPContainerComponent'

export type BPPanelComponentState = BPLabelledComponentState & {
    children: UiObjectConfig[]
    expanded: boolean
}

export class BPPanelComponent extends BPContainerComponent<BPPanelComponentState> {
    constructor(props: BPComponentProps<void>&PanelActions, context: UiConfigRendererContextType) {
        super(props, context, {
            children: [],
            expanded: false,
            label: 'Panel'
        });
    }

    setExpanded = (e: boolean) => {
        if (e === this.state.expanded) return
        this.setState({...this.state, expanded: e})
        safeSetProperty(this.props.config, "expanded", e, true)
        // if (e) this.state.children.forEach(c => Array.isArray(c) ? null : c.uiRefresh?.("postFrame", true, 1)) // todo: handle array and functions
    }

    componentDidMount() {
        super.componentDidMount();
        this.setExpanded(true)
    }

    componentWillUnmount() {
        this.setExpanded(false)
        super.componentWillUnmount();
    }

    render() {
        return !this.state.hidden ? (
            <div
                key={this.props.config.uuid}
                className="folder-children" style={{listStyleType: "none", paddingLeft: "0"}}>
                {this.state.children.map((c, i) => <ConfigObject key={'c' + i} {...this.props} config={c}/>)}
            </div>
        ) : null
    }
}
