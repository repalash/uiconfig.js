import React, {ChangeEventHandler, DOMAttributes} from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {
    Button,
    Checkbox,
    Collapse,
    Divider,
    Icon,
    IconName,
    Intent,
    MaybeElement, Menu, MenuItem, Popover
} from "@blueprintjs/core";
import {ConfigObject} from "../ConfigObject";
import {PanelActions} from "@blueprintjs/core/lib/esm/components/panel-stack2/panelTypes";
import {getOrCall, safeSetProperty} from 'ts-browser-helpers'
import {BPContainerComponent, BPContainerComponentState, BPContainerComponentProps} from './BPContainerComponent'
import classNames from "classnames";
import {Classes} from "@blueprintjs/core/src/common";
import {AnimationStates} from "@blueprintjs/core/lib/esm/components/collapse/collapse";

export type BPFolderComponentState = BPContainerComponentState & {
}

export type BPFolderComponentProps = BPContainerComponentProps & {
    icon?: IconName | MaybeElement
}


export class BPFolderComponent extends BPContainerComponent<BPFolderComponentState, BPFolderComponentProps> {
    constructor(props: BPComponentProps<void>&PanelActions&BPFolderComponentProps, context: UiConfigRendererContextType) {
        super(props, context, {children: [], expanded: false, label: 'Folder'});
    }

    render() {
        const {
            icon,
            config,
            level,
            filter,
            ...props
        } = this.props

        const setExpanded = (e: boolean) => {
            if (e === this.state.expanded) return
            this.setState({...this.state, expanded: e})
            safeSetProperty(config, "expanded", e, true)
            // if (e) this.state.children.forEach(c => Array.isArray(c) ? null : c.uiRefresh?.("postFrame", true, 1)) // todo: handle array and functions
        }
        let children = this.state.children
        const enabledToggle = children[0] && this.context.methods.getBinding(children[0])[1] === 'enabled' ? children[0] : undefined
        if(enabledToggle) children = children.slice(1)

        const ctxMenuBtns = children.filter(c=>{
            return c.type === 'button' && c.tags?.includes('context-menu')
        })
        let endIcon: MaybeElement = undefined
        if(ctxMenuBtns.length > 0){
            children = children.filter(c=>!ctxMenuBtns.includes(c))
            endIcon = (
                <Popover
                    content={<ContextMenu buttons={ctxMenuBtns} context={this.context} />}
                    placement="bottom-end"
                >
                    <Button
                        icon="more"
                        variant={"minimal"}
                        size={"small"}
                    />
                </Popover>
            )
        }

        return !this.state.hidden ? (
            <FolderHeadCard
                key={config.uuid}
                open={this.state.expanded}
                disabled={this.state.disabled}
                level={level ?? 0}
                minimal={(level ?? 0) > 0}
                onClick={() => {
                    if(this.state.readOnly) return
                    setExpanded(!this.state.expanded)
                }}
                icon={icon}
                endIcon={endIcon}
                label={this.state.label}
                enabled={enabledToggle ? this.context.methods.getRawValue(enabledToggle) : undefined}
                onEnabledChange={(e) => enabledToggle && this.context.methods.setValue(enabledToggle, e.target.checked, {}).then(() => this.setState(this.state))}
            >
                <Collapse2 isOpen={this.state.expanded} keepChildrenMounted={true} transitionDuration={300}>
                    <div className="folder-children" style={{
                        listStyleType: "none",
                        paddingLeft: level??0 > 2 ? "6px" : 0}
                    }> {/*todo use parameter instead of const 6*/}
                        {children.map((c, i) =>
                            <ConfigObject key={'c' + i} {...props} config={c}
                                          level={(level ?? 0) + 1}/>
                        )}
                    </div>
                </Collapse2>
            </FolderHeadCard>
        ) : null
    }
}

export const FolderHeadCard: React.FC<React.PropsWithChildren<{
    open: boolean, label: string,
    minimal: boolean, level: number,
    disabled?: boolean,
    enabled?: boolean, onEnabledChange?: ChangeEventHandler<HTMLInputElement>,
    onClick: DOMAttributes<HTMLElement>['onClick']
    icon?: IconName | MaybeElement
    endIcon?: IconName | MaybeElement
}>> = (props) => {
    const hasEnabled = (props.enabled !== undefined)
    return (
        <div
            // interactive={!props.open}
            className="folder-card"
            // elevation={props.open ? 3 : undefined}
        >
            {props.level === 0 &&
            <Divider style={{margin: 0}}/>
            }
            <div className={props.minimal ? 'folder-head-card-minimal' : 'folder-head-card'} style={{
                paddingTop: props.level > 0 ? "unset" : undefined,
                paddingBottom: props.level > 0 ? "unset" : undefined,
            }}>
                {/*<H6 className="folder-head-label"*/}
                {/*    onClick={props.onClick}>{props.label}</H6>*/}
                {/*<Icon icon="chevron-right" style={{*/}
                {/*    rotate: props.open ? "90deg" : "0deg",*/}
                {/*    transition: "rotate 0.25s ease-in-out"*/}
                {/*}} className="folder-head-label-icon"/>*/}

                {/*<Button className="folder-trigger-button folder-trigger-text" onClick={props.onClick}*/}
                {/*        fill={true} variant={"minimal"}*/}
                {/*        endIcon={(*/}
                {/*            <Icon icon="chevron-right" style={{*/}
                {/*                rotate: props.open ? "90deg" : "0deg",*/}
                {/*                transition: "rotate 0.25s ease-in-out"*/}
                {/*            }} className="folder-head-label-icon"/>*/}
                {/*        )}>{props.label}*/}
                {/*</Button>*/}

                <Button
                    className={"folder-trigger-button folder-trigger-text " + (props.open ? "folder-trigger-button-expanded" : "")}
                    // fill={!props.minimal}
                    fill={true}
                    onClick={props.onClick}
                    variant={"minimal"}
                    disabled={props.disabled}
                    size={props.minimal?"small":"medium"}
                    style={props.level ? {marginLeft: "6px"} : {fontSize: "0.95rem", paddingTop: "8px", paddingBottom: "8px"}}
                    // intent={props.open ? Intent.PRIMARY : Intent.NONE}
                    intent={Intent.NONE}
                    // icon={props.enabled !== undefined  && <span style={{minWidth: '20px'}}></span>} // adding a span here will center the text in the button
                    icon={props.icon ?? (
                        <>
                            <Icon icon="caret-right" style={{
                                rotate: props.open ? "90deg" : "0deg",
                                transition: "rotate 0.25s ease-in-out"
                            }}/>
                        </>
                    )}
                >{props.label}
                </Button>
                {hasEnabled && <Checkbox
                    style={{margin: 0, position: 'absolute', left: '10px'}}
                    inline size={"large"}
                    defaultChecked={props.enabled}
                    onChange={props.onEnabledChange}
                    disabled={props.disabled}
                    onClick={(e) => e.stopPropagation()}
                />}
                {props.endIcon && <div style={{position: 'absolute', right: '10px'}}>
                    {props.endIcon}
                </div>}
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

export const ContextMenu: React.FC<{
    buttons: any[];
    context: UiConfigRendererContextType;
}> = ({ buttons, context }) => {
    return (
        <Menu>
            {buttons.map((btn, i) => {
                const getProps = ()=>{ // todo use UiConfigMethods.getBaseProps
                    const hidden = getOrCall(btn.hidden) ?? false
                    const disabled = getOrCall(btn.disabled) ?? false
                    const readOnly = getOrCall(btn.readOnly) ?? false
                    return { hidden, disabled, readOnly }
                }
                const props = getProps()
                return props.hidden ? null : (
                    <MenuItem
                        key={'ctx' + i}
                        disabled={props.disabled || props.readOnly}
                        text={context.methods.getLabel(btn)}
                        onClick={(e) => {
                            e.stopPropagation();
                            const {hidden, disabled, readOnly} = getProps()
                            if (hidden || disabled || readOnly) return;
                            // todo loading state for promise
                            context.methods.clickButton(btn, { args: [e] });
                        }}
                    />
                );
            })}
        </Menu>
    );
};
