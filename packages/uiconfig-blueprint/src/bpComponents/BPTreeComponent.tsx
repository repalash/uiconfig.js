import {BPComponent, BPComponentProps, BPComponentState, UiConfigRendererContextType} from "./BPComponent";
import {Tree, TreeNodeInfo} from "@blueprintjs/core";

export type BPTreeComponentState<T = {}> = BPComponentState & {
    nodes: TreeNodeInfo<T>[]
}

// https://github.com/palantir/blueprint/blob/develop/packages/docs-app/src/examples/core-examples/treeExample.tsx
type NodePath = number[];

export abstract class BPTreeComponent<T = {}, TConfigVal = void> extends BPComponent<TConfigVal, BPTreeComponentState<T>> {
    constructor(props: BPComponentProps<TConfigVal>, context: UiConfigRendererContextType) {
        super(props, context, {nodes: []});
    }

    protected _infoMap = new Map<string | number, TreeNodeInfo<T>>()

    protected _createNodeInfo(id: string, obj: T) {
        return {
            id,
            label: 'unnamed',
            nodeData: obj,
            childNodes: [],
            isExpanded: false,
            isSelected: false,
        }
    }

    protected abstract _getNodeId(obj: T): string

    protected abstract _updateNodeInfo(node: TreeNodeInfo<T>, obj: T): TreeNodeInfo<T>;

    protected abstract _getRootNodes(): T[]

    protected async _onNodeClick(_id: string | number, _path: number[]) {
    }

    protected async _onNodeDoubleClick(_id: string | number, _path: number[]) {
    }

    protected _cloneNodes(callback?: (t:TreeNodeInfo<T>)=>void, state?: TreeNodeInfo<T>[]): TreeNodeInfo<T>[] {
        return (state ?? this.state.nodes).map(n => {
            let res: TreeNodeInfo<T> = {
                ...n,
                childNodes: n.childNodes ? this._cloneNodes(callback, n.childNodes) : undefined
            }
            if(callback) callback(res)
            this._infoMap.set(n.id, res)
            return res
        })
    }

    protected _forEachNode<T>(nodes: TreeNodeInfo<T>[] | undefined, callback: (node: TreeNodeInfo<T>) => void) {
        if (nodes === undefined) {
            return nodes;
        }
        for (const node of nodes) {
            callback(node);
            this._forEachNode(node.childNodes, callback);
        }
        return nodes
    }
    protected _forNodeAtPath<T>(nodes: TreeNodeInfo<T>[], path: NodePath, callback: (node: TreeNodeInfo<T>) => void) {
        callback(Tree.nodeFromPath(path, nodes));
    }

    protected async _onNodeExpandCollapse(_id: string | number, _path: number[]) {
        const nodes = this._cloneNodes()
        const node = this._infoMap.get(_id)
        if (!node) return
        node.isExpanded = !node.isExpanded
        // forNodeAtPath(nodes, _path, node => (node.isExpanded = !node.isExpanded));
        await this.setStatePromise({...this.state, nodes})
    }

    protected async _onNodeContextMenu(_id: string | number, _path: number[]) {
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
        return super.getUpdatedState({
            nodes
        })
    }

    deselectAll() {
        const nodes = this._cloneNodes(n => n.isSelected = false)
        return this.setStatePromise({...this.state, nodes})
    }

    async setSelected(id?: string) {
        const nodes = this._cloneNodes(n => n.isSelected = n.id === id)
        return this.setStatePromise({...this.state, nodes})
    }

    componentDidMount() {
        super.componentDidMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    render() {
        const TreeT = Tree.ofType<T>()
        return !this.state.hidden ? (
            <TreeT
                contents={this.state.nodes}
                className="folderContent"
                onNodeExpand={(node, _path, _e) => {
                    this._onNodeExpandCollapse(node.id, _path)
                }}
                onNodeCollapse={(node, _path, _e) => {
                    this._onNodeExpandCollapse(node.id, _path)
                }}
                onNodeClick={(node, _path, _e) => {
                    this._onNodeClick(node.id, _path)
                }}
                onNodeDoubleClick={(node, _path, _e) => {
                    this._onNodeDoubleClick(node.id, _path)
                }}
                onNodeContextMenu={(node, _path, _e) => {
                    this._onNodeContextMenu(node.id, _path)
                }}
            />
        ) : null
    }
}

