import {NumberUnits} from "./NumberUnits";

export function getNumberTransformFunctions(unit: string | undefined, unitType1: string | undefined, targetUnit: string | undefined) {
    const unitType = unit ? Object.entries(NumberUnits).find(([k, v]) => !!v[unit] && (!unitType1 || k === unitType1)) : undefined
    const target = targetUnit !== unit && unitType && targetUnit ? unitType[1][targetUnit] : undefined
    const source = targetUnit !== unit && unitType && unit ? unitType[1][unit] : undefined
    const transformValue = target && source ?
        (v: number) => target.from(source.to(v)) :
        undefined;
    const invTransformValue = target && source ?
        (v: number) => source.from(target.to(v)) :
        undefined;
    return {transformValue, invTransformValue};
}
