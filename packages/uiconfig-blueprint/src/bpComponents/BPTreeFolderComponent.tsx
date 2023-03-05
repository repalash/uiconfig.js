import {v4} from "uuid";
import {TreeNodeInfo} from "@blueprintjs/core";
import {BPTreeComponent} from "./BPTreeComponent";
import {UiObjectConfig} from 'uiconfig'
import {getOrCall} from 'ts-browser-helpers'

export class BPTreeFolderComponent extends BPTreeComponent<UiObjectConfig> {

    protected _getNodeId(obj: UiObjectConfig) {
        return obj.uuid || v4();
    }

    protected _updateNodeInfo(node: TreeNodeInfo<UiObjectConfig>, obj: UiObjectConfig) {
        node.label = getOrCall(obj.label) || 'unnamed'
        node.childNodes = this.context.methods.getChildren(this.props.config).reduce<any[]>((...args) => this.buildData(...args), [])
        return node;
    }

    protected _getRootNodes(): UiObjectConfig[] {
        return (this.props.config.children || []).map(c => getOrCall(c) || {}).flat(2) as UiObjectConfig[]
    }

    protected async _onNodeClick(_node: TreeNodeInfo<UiObjectConfig>) {
        console.log("TODO: Tree node clicked")
    }

    protected async _onNodeDoubleClick(_node: TreeNodeInfo<UiObjectConfig>) {
        console.log("TODO: Tree node double clicked")
    }

}
