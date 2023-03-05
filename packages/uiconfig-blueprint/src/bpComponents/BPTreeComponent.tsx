import {BPComponent, BPComponentProps, BPComponentState} from "./BPComponent";
import {Tree, TreeNodeInfo} from "@blueprintjs/core";
import React from "react";

export type BPTreeComponentState<T = {}> = BPComponentState & {
    nodes: TreeNodeInfo<T>[]
}

export function forEachTreeNode<T>(nodes: TreeNodeInfo<T>[] | undefined, callback: (node: TreeNodeInfo<T>) => void) {
    if (!nodes) return;
    for (const node of nodes) {
        callback(node);
        forEachTreeNode(node.childNodes, callback);
    }
}

export abstract class BPTreeComponent<T = {}, TConfigVal = void> extends BPComponent<TConfigVal, BPTreeComponentState<T>> {
    constructor(props: BPComponentProps<TConfigVal>, context: any) {
        super(props, context, {nodes: []});
    }

    protected _infoMap = new Map<string, TreeNodeInfo<T>>()

    protected _createNodeInfo(id: string, obj: T) {
        return {
            id,
            label: 'unnamed',
            nodeData: obj,
            childNodes: [],
        }
    }

    protected abstract _getNodeId(obj: T): string

    protected abstract _updateNodeInfo(node: TreeNodeInfo<T>, obj: T): TreeNodeInfo<T>;

    protected abstract _getRootNodes(): T[]

    protected async _onNodeClick(_node: TreeNodeInfo<T>) {
    }

    protected async _onNodeDoubleClick(_node: TreeNodeInfo<T>) {
    }

    protected async _onNodeExpand(node: TreeNodeInfo<T>) {
        node.isExpanded = !node.isExpanded
        await this.setStatePromise(this.state)
    }

    protected async _onNodeCollapse(node: TreeNodeInfo<T>) {
        node.isExpanded = !node.isExpanded
        await this.setStatePromise(this.state)
    }

    protected async _onNodeContextMenu(_node: TreeNodeInfo<T>) {
    }

    protected buildData(data: TreeNodeInfo<T>[], obj: T, _?: any, _2?: any) {
        if (!obj) return data
        const id = this._getNodeId(obj)
        if (!this._infoMap.has(id)) this._infoMap.set(id, this._createNodeInfo(id, obj))
        const node = this._infoMap.get(id)!
        const node2 = this._updateNodeInfo(node, obj)
        if (node2 !== node) this._infoMap.set(id, node2)
        data.push(node2)
        return data
    }

    getUpdatedState(_state: BPTreeComponentState<T>): BPTreeComponentState<T> {
        if (!this._infoMap) this._infoMap = new Map()
        const children = this._getRootNodes()
        const nodes = children.map(c => {
            return this.buildData([], c)[0]
        }).filter(v => v)
        console.log('update', nodes, children)
        return {
            nodes
        };
    }

    deselectAll() {
        forEachTreeNode(this.state.nodes, (n) => n.isSelected = false)
    }

    async setSelected(node?: TreeNodeInfo<T>) {
        this.deselectAll()
        if (node) {
            node.isSelected = true
            await this.setStatePromise(this.state)
        }
    }

    componentDidMount() {
        super.componentDidMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    render() {
        console.log('render tree', this.state.nodes)
        const TreeT = Tree.ofType<T>()
        return (
            <TreeT
                contents={this.state.nodes}
                className="folderContent"
                onNodeExpand={(node, _path, _e) => {
                    this._onNodeExpand(node)
                }}
                onNodeCollapse={(node, _path, _e) => {
                    this._onNodeCollapse(node)
                }}
                onNodeClick={(node, _path, _e) => {
                    this._onNodeClick(node)
                }}
                onNodeDoubleClick={(node, _path, _e) => {
                    this._onNodeDoubleClick(node)
                }}
                onNodeContextMenu={(node, _path, _e) => {
                    this._onNodeContextMenu(node)
                }}
            />
        )
    }
}

