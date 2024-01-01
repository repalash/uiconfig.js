import {TreeNodeInfo} from "@blueprintjs/core";
import {BPTreeComponent} from "./BPTreeComponent";
import {UiObjectConfig} from 'uiconfig.js'
import {getOrCall, uuidV4} from 'ts-browser-helpers'

export class BPTreeFolderComponent extends BPTreeComponent<UiObjectConfig> {

    protected _getNodeId(obj: UiObjectConfig) {
        if(!obj.uuid) obj.uuid = uuidV4();
        return obj.uuid;
    }

    protected _updateNodeInfo(node: TreeNodeInfo<UiObjectConfig>, obj: UiObjectConfig) {
        node.label = getOrCall(obj.label) || 'unnamed'
        node.childNodes = this.context.methods.getChildren(this.props.config).reduce<any[]>((...args) => this.buildData(...args), [])
        return node;
    }

    protected _getRootNodes(): UiObjectConfig[] {
        return (this.props.config.children || []).map(c => getOrCall(c) || {}).flat(2) as UiObjectConfig[]
    }

    protected async _onNodeClick(_id: string|number) {
        console.log("TODO: Tree node clicked")
    }

    protected async _onNodeDoubleClick(_id: string|number) {
        console.log("TODO: Tree node double clicked")
    }

}
