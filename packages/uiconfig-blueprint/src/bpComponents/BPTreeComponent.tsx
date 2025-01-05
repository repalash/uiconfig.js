import {BPComponent, BPComponentProps, BPComponentState, UiConfigRendererContextType} from "./BPComponent";
import {Tree, TreeNodeInfo} from "@blueprintjs/core";
import {PrimitiveVal} from "uiconfig.js";

export type BPTreeComponentState<T = {}> = BPComponentState & {
    nodes: TreeNodeInfo<T>[]
}

// https://github.com/palantir/blueprint/blob/develop/packages/docs-app/src/examples/core-examples/treeExample.tsx
type NodePath = number[];

export abstract class BPTreeComponent<T = {}, TConfigVal extends PrimitiveVal|void = void> extends BPComponent<TConfigVal, BPTreeComponentState<T>> {
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

    protected async _onNodeClick(_id: string | number) {
    }

    protected async _onNodeDoubleClick(_id: string | number) {
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

    protected _forEachNode<T>(nodes: TreeNodeInfo<T>[] | undefined, callback: (node: TreeNodeInfo<T>, path: NodePath) => void, path: NodePath = []) {
        if (nodes === undefined) {
            return nodes;
        }
        for (const node of nodes) {
            callback(node, path);
            this._forEachNode(node.childNodes, callback, [...path, node.id] as NodePath);
        }
        return nodes
    }
    protected _forNodeAtPath<T>(nodes: TreeNodeInfo<T>[], path: NodePath, callback: (node: TreeNodeInfo<T>) => void) {
        callback(Tree.nodeFromPath(path, nodes));
    }

    protected async _onNodeExpandCollapse(_id: string | number, expanded?: boolean) {
        const nodes = this._cloneNodes()
        const node = this._infoMap.get(_id)
        if (!node) return
        node.isExpanded = expanded ?? !node.isExpanded
        // forNodeAtPath(nodes, _path, node => (node.isExpanded = !node.isExpanded));
        await this.setStatePromise({...this.state, nodes})
    }

    protected async _onNodeContextMenu(_id: string | number) {
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

    findSelectedNode(nodes?: TreeNodeInfo<T>[]): TreeNodeInfo<T> | undefined {
        if (!nodes) nodes = this.state.nodes
        for (const node of nodes) {
            if (node.isSelected) return node
            if (node.childNodes) {
                const res = this.findSelectedNode(node.childNodes)
                if (res) return res
            }
        }
    }
    getFlatNodes(onlyVisible = false, nodes?: TreeNodeInfo<T>[], res: TreeNodeInfo<T>[] = []): TreeNodeInfo<T>[] {
        if (!nodes) nodes = this.state.nodes
        for (const node of nodes) {
            res.push(node)
            if (node.childNodes && (!onlyVisible || node.isExpanded)) this.getFlatNodes(onlyVisible, node.childNodes, res)
        }
        return res
    }

    protected _handleKeyDown(e: React.KeyboardEvent) {
        const nodes = this.getFlatNodes(true)
        let current, next, previous;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (node.isSelected) {
                current = node
                next = i < nodes.length - 1 ? nodes[i + 1] : undefined
                previous = i > 0 ? nodes[i - 1] : undefined
                break
            }
        }
        switch (e.key) {
            case "ArrowUp":
                if (previous) this._onNodeClick(previous.id)
                break
            case "ArrowDown":
                if (next) this._onNodeClick(next.id)
                break
            case "ArrowRight":
                if (current) this._onNodeExpandCollapse(current.id, true)
                break
            case "ArrowLeft":
                if (current) this._onNodeExpandCollapse(current.id, false)
                break
            case "Escape":
                if (current) this._onNodeClick(current.id)
                break
            case "Enter":
                if (current) this._onNodeDoubleClick(current.id)
                break
            default:
                return
        }
        e.preventDefault()
        e.stopPropagation()
    }

    render() {
        const TreeT = Tree.ofType<T>()
        return !this.state.hidden ? (
            <div
                style={{width: "100%", height: "100%"}}
                 onKeyDown={e => this._handleKeyDown(e)}
                tabIndex={0}
            >
            <TreeT
                contents={this.state.nodes}
                className="folderContent"
                onNodeExpand={(node, _path, _e) => {
                    this._onNodeExpandCollapse(node.id)
                }}
                onNodeCollapse={(node, _path, _e) => {
                    this._onNodeExpandCollapse(node.id)
                }}
                onNodeClick={(node, _path, _e) => {
                    this._onNodeClick(node.id)
                }}
                onNodeDoubleClick={(node, _path, _e) => {
                    this._onNodeDoubleClick(node.id)
                }}
                onNodeContextMenu={(node, _path, _e) => {
                    this._onNodeContextMenu(node.id)
                }}
            /></div>
        ) : null
    }
}

