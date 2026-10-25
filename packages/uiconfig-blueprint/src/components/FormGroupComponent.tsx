import {FormGroup} from "@blueprintjs/core";
import {CSSProperties, PropsWithChildren, ReactNode} from "react";

export function FormGroupComponent(props: PropsWithChildren<{
    label: string|ReactNode, flexBasis?: string, disabled?: boolean,
    style?: CSSProperties
}>) {
    return (
        <FormGroup className="xPaddedContent folderContent" contentClassName="formGroupContent"
                   style={{
                       justifyContent: "space-between",
                       marginTop: "2px",
                       marginBottom: "2px",
                       flexBasis: props.flexBasis ?? "50%",
                       ...props.style,
                   }}
            // helperText="Helper text with details..."
                   label={typeof props.label !== 'string' ? props.label : (<span title={props.label}>{props.label}</span>)}
                   inline={true}
                   disabled={props.disabled}
            // labelInfo="(required)"
        >
            {props.children}
        </FormGroup>
    )
}
