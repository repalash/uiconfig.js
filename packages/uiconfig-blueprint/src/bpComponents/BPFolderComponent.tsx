import React, {ChangeEventHandler, DOMAttributes} from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {Button, Checkbox, Collapse, Icon, Intent} from "@blueprintjs/core";
import {ConfigObject} from "../ConfigObject";
import {PanelActions} from "@blueprintjs/core/lib/esm/components/panel-stack2/panelTypes";
import {safeSetProperty} from 'ts-browser-helpers'
import {BPContainerComponent, BPContainerComponentState} from './BPContainerComponent'
import classNames from "classnames";
import {Classes} from "@blueprintjs/core/src/common";
import {AnimationStates} from "@blueprintjs/core/lib/esm/components/collapse/collapse";

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
        const children = this.state.children
        const enabledToggle = children[0] && this.context.methods.getBinding(children[0])[1] === 'enabled' ? children[0] : undefined
        enabledToggle && (enabledToggle.hidden = true)
        return !this.state.hidden ? (
            <FolderHeadCard
                key={this.props.config.uuid}
                open={this.state.expanded}
                disabled={this.state.disabled}
                level={this.props.level ?? 0}
                minimal={(this.props.level ?? 0) > 0}
                onClick={() => {
                    if(this.state.readOnly) return
                    setExpanded(!this.state.expanded)
                }}
                label={this.state.label}
                enabled={enabledToggle ? this.context.methods.getRawValue(enabledToggle) : undefined}
                onEnabledChange={(e) => enabledToggle && this.context.methods.setValue(enabledToggle, e.target.checked, {}).then(() => this.setState(this.state))}
            >
                <Collapse2 isOpen={this.state.expanded} keepChildrenMounted={true} transitionDuration={300}>
                    <div className="folder-children" style={{listStyleType: "none", paddingLeft: this.props.level??0 > 2 ? "6px" : 0}}> {/*todo use parameter instead of const 6*/}
                        {children.map((c, i) =>
                            <ConfigObject key={'c' + i} {...this.props} config={c}
                                          level={(this.props.level ?? 0) + 1}/>
                        )}
                    </div>
                </Collapse2>
            </FolderHeadCard>
        ) : null
    }
}

export const FolderHeadCard: React.FC<React.PropsWithChildren<{ open: boolean, label: string, minimal: boolean, level: number, disabled?: boolean, enabled?: boolean, onEnabledChange?: ChangeEventHandler<HTMLInputElement>, onClick: DOMAttributes<HTMLElement>['onClick'] }>> = (props) => {
    const hasEnabled = (props.enabled !== undefined)
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
                    className={"folder-trigger-button " + (props.open ? "folder-trigger-button-expanded" : "")}
                    // fill={!props.minimal}
                    fill={true}
                    onClick={props.onClick}
                    minimal={true}
                    disabled={props.disabled}
                    small={props.minimal}
                    style={props.level ? {marginLeft: "6px"} : {fontSize: "0.95rem", paddingTop: "8px", paddingBottom: "8px"}}
                    intent={props.open ? Intent.PRIMARY : Intent.NONE}
                    // icon={props.enabled !== undefined  && <span style={{minWidth: '20px'}}></span>} // adding a span here will center the text in the button
                    icon={(
                        <>
                            <Icon icon="caret-right" style={{
                                rotate: props.open ? "90deg" : "0deg",
                                transition: "rotate 0.25s ease-in-out"
                            }}/>
                        </>
                    )}>{props.label}
                </Button>
                {hasEnabled && <Checkbox
                    style={{margin: 0, position: 'absolute', left: '10px'}}
                    large inline
                    defaultChecked={props.enabled}
                    onChange={props.onEnabledChange}
                    disabled={props.disabled}
                    onClick={(e) => e.stopPropagation()}
                />}
            </div>
            {props.children}
        </div>
    )
}

export class Collapse2 extends Collapse{
    private contentsRefHandler2 = (el: HTMLElement | null) => {
        // @ts-ignore
        this.contents = el;
        // @ts-ignore
        if (this.contents != null) {
            // @ts-ignore
            const height = this.contents.clientHeight;
            this.setState({
                animationState: this.props.isOpen ? AnimationStates.OPEN : AnimationStates.CLOSED,
                height: height === 0 ? undefined : `${height}px`,
                heightWhenOpen: height === 0 ? undefined : height,
            });
        }
    };

    public render() {
        const isContentVisible = this.state.animationState !== AnimationStates.CLOSED;
        const shouldRenderChildren = isContentVisible || this.props.keepChildrenMounted;
        // const displayWithTransform = isContentVisible && this.state.animationState !== AnimationStates.CLOSING;
        const isAutoHeight = this.state.height === "auto";

        const containerStyle = {
            height: isContentVisible ? this.state.height : undefined,
            overflowY: isAutoHeight ? "visible" : undefined,
            // transitions don't work with height: auto
            transition: isAutoHeight ? "none" : undefined,
        };

        const contentsStyle = {
            // only use heightWhenOpen while closing
            // transform: displayWithTransform ? "translateY(0)" : `translateY(-${this.state.heightWhenOpen}px)`,
            // transitions don't work with height: auto
            // transition: isAutoHeight ? "none" : undefined,
            display: "block", // for opacity animation
            visibility: isContentVisible ? "visible" : "hidden",
            opacity: this.state.animationState === AnimationStates.CLOSING ||  this.state.animationState === AnimationStates.CLOSED ? 0.1 : 1,
        } as React.CSSProperties;

        // if(isContentVisible && !isAutoHeight && this.state.heightWhenOpen && this.state.height){
        //     const h = parseInt(this.state.height)
        //     contentsStyle.opacity = h / this.state.heightWhenOpen;
        //     console.log(contentsStyle.opacity)
        // }

        return React.createElement(
            this.props.component!,
            {
                className: classNames(Classes.COLLAPSE, this.props.className),
                style: containerStyle,
            },
            <div
                className={Classes.COLLAPSE_BODY}
                ref={this.contentsRefHandler2}
                style={contentsStyle}
                aria-hidden={!isContentVisible}
            >
                {shouldRenderChildren ? this.props.children : null}
            </div>,
        );
    }

}
