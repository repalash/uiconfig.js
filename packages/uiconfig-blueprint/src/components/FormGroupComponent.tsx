import {FormGroup} from "@blueprintjs/core";
import React, {PropsWithChildren} from "react";

export function FormGroupComponent(props: PropsWithChildren<{ label: string, flexBasis?: string }>) {
    return (
        <FormGroup className="xPaddedContent folderContent" contentClassName="formGroupContent"
                   style={{
                       justifyContent: "space-between",
                       marginTop: "2px",
                       marginBottom: "2px",
                       flexBasis: props.flexBasis ?? "50%"
                   }}
            // helperText="Helper text with details..."
                   label={(<span title={props.label}>{props.label}</span>)}
                   inline={true}
            // labelInfo="(required)"
        >
            {props.children}
        </FormGroup>
    )
}
