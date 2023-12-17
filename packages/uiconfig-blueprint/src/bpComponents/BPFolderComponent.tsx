import React, {DOMAttributes} from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {Button, Collapse, Icon, Intent} from "@blueprintjs/core";
import {ConfigObject} from "../ConfigObject";
import {PanelActions} from "@blueprintjs/core/lib/esm/components/panel-stack2/panelTypes";
import {safeSetProperty} from 'ts-browser-helpers'
import {BPContainerComponent, BPContainerComponentState} from './BPContainerComponent'

export type BPFolderComponentState = BPContainerComponentState & {
}

export class BPFolderComponent extends BPContainerComponent<BPFolderComponentState> {
    constructor(props: BPComponentProps<void>&PanelActions, context: UiConfigRendererContextType) {
        super(props, context, {children: [], expanded: false, label: 'Folder'});
    }

    render() {
        const setExpanded = (e: boolean) => {
            if (e === this.state.expanded) return
            this.setState({...this.state, expanded: e})
            safeSetProperty(this.props.config, "expanded", e, true)
            // if (e) this.state.children.forEach(c => Array.isArray(c) ? null : c.uiRefresh?.("postFrame", true, 1)) // todo: handle array and functions
        }

        return !this.state.hidden ? (
            <FolderHeadCard
                key={this.props.config.uuid}
                open={this.state.expanded}
                disabled={this.state.disabled}
                minimal={(this.props.level ?? 0) > 0}
                onClick={() => {
                    if(this.state.readOnly) return
                    setExpanded(!this.state.expanded)
                }}
                label={this.state.label}
            >
                <Collapse isOpen={this.state.expanded} keepChildrenMounted={false}>
                    <div className="folder-children" style={{listStyleType: "none", paddingLeft: "0"}}>
                        {this.state.children.map((c, i) => <ConfigObject key={'c' + i} {...this.props} config={c}
                                                                         level={(this.props.level ?? 0) + 1}/>)}
                    </div>
                </Collapse>
            </FolderHeadCard>
        ) : null
    }
}

export const FolderHeadCard: React.FC<React.PropsWithChildren<{ open: boolean, label: string, minimal: boolean, disabled?: boolean, onClick: DOMAttributes<HTMLElement>['onClick'] }>> = (props) => {
    return (
        <div
            // interactive={!props.open}
            className="folder-card"
            // elevation={props.open ? 3 : undefined}
        >
            <div className={props.minimal ? 'folder-head-card-minimal' : 'folder-head-card'}>
                {/*<H6 className="folder-head-label"*/}
                {/*    onClick={props.onClick}>{props.label}</H6>*/}
                {/*<Icon icon="chevron-right" style={{*/}
                {/*    rotate: props.open ? "90deg" : "0deg",*/}
                {/*    transition: "rotate 0.25s ease-in-out"*/}
                {/*}} className="folder-head-label-icon"/>*/}

                {/*<Button className="folder-trigger-button" onClick={props.onClick}*/}
                {/*        fill={true} minimal={true}*/}
                {/*        rightIcon={(*/}
                {/*            <Icon icon="chevron-right" style={{*/}
                {/*                rotate: props.open ? "90deg" : "0deg",*/}
                {/*                transition: "rotate 0.25s ease-in-out"*/}
                {/*            }} className="folder-head-label-icon"/>*/}
                {/*        )}>{props.label}*/}
                {/*</Button>*/}

                <Button
                    className="folder-trigger-button" fill={!props.minimal} onClick={props.onClick}
                    minimal={true}
                    disabled={props.disabled}
                    small={props.minimal}
                    style={props.minimal ? {} : {fontSize: "0.95rem", paddingTop: "8px", paddingBottom: "8px"}}
                    intent={props.open ? Intent.PRIMARY : Intent.NONE}
                    rightIcon={(
                        <Icon icon="chevron-right" style={{
                            rotate: props.open ? "90deg" : "0deg",
                            transition: "rotate 0.25s ease-in-out"
                        }}/>
                    )}>{props.label}
                </Button>
            </div>
            {props.children}
        </div>
    )
}
