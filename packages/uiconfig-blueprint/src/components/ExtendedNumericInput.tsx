/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Many changes over the original implementation here: https://github.com/palantir/blueprint/blob/develop/packages/docs-app/src/examples/core-examples/numericInputExtendedExample.tsx
 */

import React from "react";

import type {HTMLInputProps, NumericInputProps} from "@blueprintjs/core";
import {NumericInput} from "@blueprintjs/core";
import {DraggableIcon} from "./DraggableIcon";

export interface IExtendedNumericInputState {
    value?: string;
}

const NumberAbbreviation = {
    BILLION: "b",
    MILLION: "m",
    THOUSAND: "k",
};

const NUMBER_ABBREVIATION_REGEX = /((\.\d+)|(\d+(\.\d+)?))(k|m|b)\b/gi;
const SCIENTIFIC_NOTATION_REGEX = /((\.\d+)|(\d+(\.\d+)?))(e\d+)\b/gi;

export class ExtendedNumericInput extends React.PureComponent<HTMLInputProps & NumericInputProps & { onChange2: (v: number, last?: boolean) => void }, IExtendedNumericInputState> {
    public state: IExtendedNumericInputState = {
        value: (this.props.value ?? this.props.defaultValue ?? '').toString(),
    };

    async setValue(val?: number) {
        return new Promise<void>((resolve) => {
            this.setState({value: (val ?? this.props.value ?? this.props.defaultValue ?? '').toString()}, resolve)
        })
    }

    public render() {
        const {value} = this.state;
        const props2: HTMLInputProps & NumericInputProps & { onChange2?: (v: number, last?: boolean) => void } = {...this.props}
        if (props2.onChange2) delete props2.onChange2

        return (
            <NumericInput
                {...props2}
                leftElement={(
                    <DraggableIcon icon={this.props.leftIcon ?? "variable"}
                                   size={16}
                                   small={this.props.small}
                                   value={parseFloat(value ?? '0')}
                                   stepSize={this.props.stepSize}
                                   onChange={(v, last) => {
                                       this.handleValueChange(v, v.toString(), null, last, true)
                                   }}/>
                )}
                // leftIcon={"variable"}
                buttonPosition={this.props.buttonPosition ?? (this.props.disabled ? "none" : "right")}
                allowNumericCharactersOnly={false}
                onBlur={this.handleBlur}
                onKeyDown={this.handleKeyDown}
                onButtonClick={this.handleButtonClick}
                onValueChange={this.handleValueChange}
                placeholder="Enter a number or expression..."
                value={value}
            />
        );
    }

    private handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        this.handleConfirm((e.target as HTMLInputElement).value);
    };


    private _lastChangedValue = null as [number, string] | null
    private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.code === 'Enter') {
            this.handleConfirm((e.target as HTMLInputElement).value);
        }else if(e.code === 'ArrowUp' || e.code === 'ArrowDown'){
            if(this._lastChangedValue) {
                if(!this._lastChangedValue[1].length && (e.target as HTMLInputElement).value.length){
                    // could be because of NaN, so we need to evaluate the expression
                    // note: to test this type in "1+1" and press up/down. the output should be 2 and not 1 or 0
                    this.handleConfirm((e.target as HTMLInputElement).value)
                    // todo: should we increment the value here? (also need to take care of ctrl and alt and step sizes)
                }else this.handleValueChange(this._lastChangedValue[0], this._lastChangedValue[1], e.target as HTMLInputElement, true, true)
            }
            else {
                this.handleConfirm((e.target as HTMLInputElement).value);
                // todo: should we increment the value here? (also need to take care of ctrl and alt and step sizes)
            }
        }
        this._lastChangedValue = null
    };

    private handleValueChange = (_valueAsNumber: number, valueAsString: string, inputElement: HTMLInputElement | null, last?: boolean, dispatchOnChange2 = false) => {
        this._lastChangedValue = [_valueAsNumber, valueAsString]
        this.setState({value: valueAsString}, () => {
            this.props.onValueChange?.(_valueAsNumber, valueAsString, inputElement)
            if(dispatchOnChange2)
                this.props.onChange2?.(_valueAsNumber, last)
        });
    };

    private handleButtonClick = (_valueAsNumber: number, valueAsString: string) => {
        this.handleValueChange(_valueAsNumber, valueAsString, null, true, true)
    };

    private handleConfirm = (value: string) => {
        let result = value;
        result = this.expandScientificNotationTerms(result);
        result = this.expandNumberAbbreviationTerms(result);
        result = this.evaluateSimpleMathExpression(result);
        result = this.nanStringToEmptyString(result);
        this.setState({value: result}, () => {
            this.props.onValueChange?.(parseFloat(result) || 0, result, null)
            this.props.onChange2?.(parseFloat(result) || 0)
        });

        // the user could have typed a different expression that evaluates to
        // the same value. force the update to ensure a render triggers even if
        // this is the case.
        this.forceUpdate();
    };

    private expandScientificNotationTerms = (value: string) => {
        // leave empty strings empty
        if (!value) {
            return value;
        }
        return value.replace(SCIENTIFIC_NOTATION_REGEX, this.expandScientificNotationNumber);
    };

    private expandNumberAbbreviationTerms = (value: string) => {
        // leave empty strings empty
        if (!value) {
            return value;
        }
        return value.replace(NUMBER_ABBREVIATION_REGEX, this.expandAbbreviatedNumber);
    };

    // Adapted from http://stackoverflow.com/questions/2276021/evaluating-a-string-as-a-mathematical-expression-in-javascript
    // maybe try a better solution from above, right now it only works left to right
    private evaluateSimpleMathExpression = (value: string) => {
        // leave empty strings empty
        if (!value) {
            return value;
        }

        // parse all terms from the expression. split on the +, -, *, /, ^(pow) characters and then
        // validate that each term is a number.
        const terms = value.split(/[+\-*\/^]/);

        // ex. "1 + 2 - 3 # 4" will parse on the + and - signs into
        // ["1 ", " 2 ", " 3 # 4"]. after trimming whitespace from each term
        // and coercing them to numbers, the third term will become NaN,
        // indicating that there was some illegal character present in it.
        const trimmedTerms = terms.map((term: string) => term.trim());
        const numericTerms = trimmedTerms.map((term: string) => +term);
        const illegalTerms = numericTerms.filter(isNaN);

        if (illegalTerms.length > 0) {
            return "";
        }

        // evaluate the expression now that we know it's valid
        let total = 0;

        // the regex below will match decimal numbers--optionally preceded by
        // +-*/^ followed by any number of spaces—-including each of the
        // following:
        // ".1"
        // "  1"
        // "1.1"
        // "+ 1"
        // "-   1.1"
        const matches = value.match(/[+\-*\/^]*\s*(\.\d+|\d+(\.\d+)?)/gi) || [];
        for (const match of matches) {
            const compactedMatch = match.replace(/\s/g, "");
            const compactedMatchNum = compactedMatch.replace(/[*\/^]/g, "");
            const num = parseFloat(compactedMatchNum);
            if(compactedMatch.startsWith("*")) total *= num;
            else if(compactedMatch.startsWith("/")) total /= num;
            else if(compactedMatch.startsWith("^")) total = Math.pow(total, num);
            else total += num;
        }
        const roundedTotal = this.roundValue(total);
        return roundedTotal.toString();
    };

    private nanStringToEmptyString = (value: string) => {
        // our evaluation logic isn't perfect, so use this as a final
        // sanitization step if the result was not a number.
        return value === "NaN" ? "" : value;
    };

    private expandAbbreviatedNumber = (value: string) => {
        if (!value) {
            return value;
        }

        const num = +value.substring(0, value.length - 1);
        const lastChar = value.charAt(value.length - 1).toLowerCase();

        let result: number | null = null;

        if (lastChar === NumberAbbreviation.THOUSAND) {
            result = num * 1e3;
        } else if (lastChar === NumberAbbreviation.MILLION) {
            result = num * 1e6;
        } else if (lastChar === NumberAbbreviation.BILLION) {
            result = num * 1e9;
        }

        const isValid = result != null && !isNaN(result);

        if (isValid) {
            result = this.roundValue(result!);
        }

        return isValid ? result!.toString() : "";
    };

    private expandScientificNotationNumber = (value: string) => {
        if (!value) {
            return value;
        }
        return (+value).toString();
    };

    private roundValue = (value: number, precision: number = 1) => {
        // round to at most two decimal places
        return Math.round(value * 10 ** precision) / 10 ** precision;
    };
}
