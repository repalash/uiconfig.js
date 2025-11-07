import {
    AbstractPureComponent,
    Classes,
    DISPLAYNAME_PREFIX,
    Icon,
    InputGroupProps,
    removeNonHTMLProps
} from "@blueprintjs/core";
import {InputGroupState} from "@blueprintjs/core/lib/esnext/components/forms/inputGroup";
import classNames from "classnames";
import * as React from "react";

export interface InputGroup2Props extends InputGroupProps{
    leftElementWidth?: number|string
    rightElementWidth?: number|string
}
export const NON_HTML_PROPS: Array<keyof InputGroup2Props> = ["inputSize", "onValueChange", "leftElementWidth", "rightElementWidth"];

export class InputGroup2 extends AbstractPureComponent<InputGroup2Props, InputGroupState> {
    public static displayName = `${DISPLAYNAME_PREFIX}.InputGroup`;

    public state: InputGroupState = {};

    private leftElement: HTMLElement | null = null;

    private rightElement: HTMLElement | null = null;

    private refHandlers = {
        leftElement: (ref: HTMLSpanElement | null) => (this.leftElement = ref),
        rightElement: (ref: HTMLSpanElement | null) => (this.rightElement = ref),
    };

    public render() {
        const {
            // asyncControl = false,
            className,
            disabled,
            fill,
            inputClassName,
            inputRef,
            inputSize,
            intent,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            large,
            readOnly,
            round,
            size = "medium",
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            small,
            tagName = "div",
        } = this.props;
        const inputGroupClasses = classNames(
            Classes.INPUT_GROUP,
            Classes.intentClass(intent),
            {
                [Classes.DISABLED]: disabled,
                [Classes.READ_ONLY]: readOnly,
                [Classes.FILL]: fill,
                [Classes.ROUND]: round,
            },
            Classes.sizeClass(size, {large, small}),
            className,
        );

        const paddingLeft = this.state.leftElementWidth || this.props.leftElementWidth || undefined
        const paddingRight = this.state.rightElementWidth || this.props.rightElementWidth || undefined
        const style: React.CSSProperties = {
            ...this.props.style,
            // paddingLeft: this.state.leftElementWidth || this.props.leftElementWidth || 0,
            // paddingRight: this.state.rightElementWidth || this.props.rightElementWidth || 0,
        };
        if(paddingLeft !== undefined)
            style.paddingLeft = paddingLeft
        if(paddingRight !== undefined)
            style.paddingRight = paddingRight

        const inputProps = {
            type: "text",
            ...removeNonHTMLProps(this.props, NON_HTML_PROPS, true),
            "aria-disabled": disabled,
            className: classNames(Classes.INPUT, inputClassName),
            onChange: this.handleInputChange,
            size: inputSize ?? (typeof size === "number" ? size : undefined),
            style,
        } satisfies React.HTMLProps<HTMLInputElement>;
        const inputElement = /*asyncControl ? (
            <AsyncControllableInput {...inputProps} inputRef={inputRef} />
        ) : */(
            <input {...inputProps} ref={inputRef}/>
        );

        return React.createElement(
            tagName,
            {className: inputGroupClasses},
            this.maybeRenderLeftElement(),
            inputElement,
            this.maybeRenderRightElement(),
        );
    }

    public componentDidMount() {
        this.updateInputWidth();
    }

    public componentDidUpdate(prevProps: InputGroupProps) {
        const {leftElement, rightElement} = this.props;
        if (prevProps.leftElement !== leftElement || prevProps.rightElement !== rightElement) {
            this.updateInputWidth();
        }
    }

    protected validateProps(_props: InputGroupProps) {
        // if (props.leftElement != null && props.leftIcon != null) {
        //     console.warn(INPUT_WARN_LEFT_ELEMENT_LEFT_ICON_MUTEX);
        // }
    }

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        this.props.onChange?.(event);
        this.props.onValueChange?.(value, event.target);
    };

    private maybeRenderLeftElement() {
        const {leftElement, leftIcon} = this.props;

        if (leftElement != null) {
            return (
                <span className={Classes.INPUT_LEFT_CONTAINER} ref={this.refHandlers.leftElement}>
                    {leftElement}
                </span>
            );
        } else if (leftIcon != null) {
            return <Icon icon={leftIcon} aria-hidden={true} tabIndex={-1}/>;
        }

        return undefined;
    }

    private maybeRenderRightElement() {
        const {rightElement} = this.props;
        if (rightElement == null) {
            return undefined;
        }
        return (
            <span className={Classes.INPUT_ACTION} ref={this.refHandlers.rightElement}>
                {rightElement}
            </span>
        );
    }

    private updateInputWidth() {
        const {leftElementWidth, rightElementWidth} = this.state;

        if (this.leftElement != null) {
            const {clientWidth} = this.leftElement;
            // small threshold to prevent infinite loops
            if (leftElementWidth === undefined || Math.abs(clientWidth - leftElementWidth) > 2) {
                this.setState({leftElementWidth: clientWidth});
            }
        } else {
            this.setState({leftElementWidth: undefined});
        }

        if (this.rightElement != null) {
            const {clientWidth} = this.rightElement;
            // small threshold to prevent infinite loops
            if (rightElementWidth === undefined || Math.abs(clientWidth - rightElementWidth) > 2) {
                this.setState({rightElementWidth: clientWidth});
            }
        } else {
            this.setState({rightElementWidth: undefined});
        }
    }
}
