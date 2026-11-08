import React, {ChangeEventHandler, DOMAttributes} from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import type {UiObjectConfig} from "uiconfig.js";
import {
    Button,
    Checkbox,
    Collapse,
    Divider,
    Icon,
    IconName,
    Intent,
    MaybeElement, Menu, MenuItem, Popover,
    Classes,
} from "@blueprintjs/core";
import {ConfigObject} from "../ConfigObject";
import {PanelActions} from "@blueprintjs/core/lib/esm/components/panel-stack2/panelTypes";
import {getOrCall, safeSetProperty} from 'ts-browser-helpers'
import {BPContainerComponent, BPContainerComponentState, BPContainerComponentProps} from './BPContainerComponent'
import classNames from "classnames";
import {AnimationStates} from "@blueprintjs/core/lib/esm/components/collapse/collapse";

export type BPFolderComponentState = BPContainerComponentState & {
    /** The width of the header actions, kept free at the right of the title */
    actionsWidth?: number
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

        // the buttons with the tag context-menu (without the tag inline) go to the header: buttons while they fit, a menu for the rest
        const ctxMenuBtns = children.filter(c=>{
            return c.type === 'button' && c.tags?.includes('context-menu') && !c.tags?.includes('inline')
        })
        let endIcon: MaybeElement = undefined
        if(ctxMenuBtns.length > 0){
            children = children.filter(c=>!ctxMenuBtns.includes(c))
            endIcon = (
                <FolderActions
                    buttons={ctxMenuBtns}
                    context={this.context}
                    disabled={this.state.disabled}
                    onWidth={(w) => w !== this.state.actionsWidth && this.setState({...this.state, actionsWidth: w})}
                />
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
                endWidth={endIcon ? this.state.actionsWidth : undefined}
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
    /** The width that endIcon takes at the right; the label ends before it */
    endWidth?: number
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
                    style={{
                        ...props.level ? {marginLeft: "6px"} : {fontSize: "0.95rem", paddingTop: "8px", paddingBottom: "8px"},
                        ...props.endWidth ? {paddingRight: `${props.endWidth}px`} : {},
                    }}
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
                {props.endIcon && <div className="folder-head-end">
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
        <Menu size="small" className="folder-actions-menu">
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
                        icon={configIcon(btn)}
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

const isOff = (b: UiObjectConfig) => !!(getOrCall(b.disabled) || getOrCall(b.readOnly))

/**
 * The icon of a config (`config.icon`) for a Blueprint button or menu item: SVG markup inline, an image URL as an
 * `<img>`, any other string as a Blueprint icon name.
 */
export function configIcon(config: UiObjectConfig): IconName | MaybeElement {
    const icon = getOrCall(config.icon)?.trim()
    if (!icon) return undefined
    // app markup, see UiObjectConfig.icon
    if (icon.startsWith('<svg')) return <span className="folder-action-icon" dangerouslySetInnerHTML={{__html: icon}}/>
    if (/^(https?:|data:|blob:)/.test(icon) || /[/.]/.test(icon)) return <img className="folder-action-icon" src={icon} alt=""/>
    return icon as IconName
}

/**
 * The actions in a folder header: a button for each of `buttons` that fits after the folder label, and a ⋯ button with
 * a menu of the rest. It follows the size of the header (a resize of the panel) and each render of the folder.
 */
export const FolderActions: React.FC<{
    buttons: UiObjectConfig[]
    context: UiConfigRendererContextType
    /** the folder is disabled: all the actions are off */
    disabled?: boolean
    /** called with the width that the actions take at the right of the header (with their margin) */
    onWidth?: (width: number) => void
}> = ({buttons, context, disabled, onWidth}) => {
    const bar = React.useRef<HTMLDivElement>(null)
    const shown = buttons.filter(b => !getOrCall(b.hidden))
    const [fit, setFit] = React.useState(shown.length)
    // the buttons that fit after the label; the rest go to the menu. The display of each is set here, not by React
    const layout = () => {
        const el = bar.current
        const head = el?.closest<HTMLElement>('.folder-head-card, .folder-head-card-minimal')
        if (!el || !head) return
        const items = Array.from(el.querySelectorAll<HTMLElement>(':scope > .folder-action'))
        const more = el.querySelector<HTMLElement>(':scope > .folder-actions-more')
        for (const item of items) item.style.display = ''
        if (more) more.style.display = ''
        const h = head.getBoundingClientRect()
        if (!h.width) return // not on the page: the resize observer calls this again when it shows
        const end = el.parentElement ? h.right - el.parentElement.getBoundingClientRect().right : 0
        const text = head.querySelector(`.folder-trigger-button .${Classes.BUTTON_TEXT}`)
        let textRight = h.left
        if (text) {
            const range = document.createRange()
            range.selectNodeContents(text)
            textRight = Math.max(range.getBoundingClientRect().right, h.left)
        }
        const room = h.right - end - textRight - 8
        const gap = 2
        const widths = items.map(i => i.offsetWidth)
        let count = items.length
        if (widths.reduce((sum, w) => sum + w + gap, -gap) > room) {
            let used = more?.offsetWidth ?? 0
            count = 0
            while (count < items.length && used + gap + widths[count] <= room) used += gap + widths[count++]
        }
        items.forEach((item, i) => item.style.display = i < count ? '' : 'none')
        if (more) more.style.display = count < items.length ? '' : 'none'
        if (count !== fit) setFit(count)
        onWidth?.(end + el.offsetWidth + 4)
    }
    const layoutRef = React.useRef(layout)
    layoutRef.current = layout
    React.useLayoutEffect(() => layout())
    React.useEffect(() => {
        const head = bar.current?.closest('.folder-head-card, .folder-head-card-minimal')
        if (!head) return
        const observer = new ResizeObserver(() => layoutRef.current())
        observer.observe(head)
        return () => observer.disconnect()
    }, [])
    return (
        <div className="folder-actions" ref={bar}>
            {shown.map((b, i) => (
                <Button
                    key={b.uuid ?? 'a' + i}
                    className="folder-action"
                    size="small"
                    // with an icon: the icon only, and the label as its tooltip and name
                    {...configIcon(b) ? {icon: configIcon(b), title: context.methods.getLabel(b), 'aria-label': context.methods.getLabel(b)} : {text: context.methods.getLabel(b)}}
                    disabled={disabled || isOff(b)}
                    onClick={(e) => {
                        e.stopPropagation()
                        if (disabled || getOrCall(b.hidden) || isOff(b)) return
                        context.methods.clickButton(b, {args: [e]})
                    }}
                />
            ))}
            <span className="folder-actions-more">
                <Popover content={<ContextMenu buttons={shown.slice(fit)} context={context} />} placement="bottom-end" disabled={disabled}>
                    <Button icon="more" variant="minimal" size="small" disabled={disabled} aria-label="More actions" title="More actions" />
                </Popover>
            </span>
        </div>
    )
}
