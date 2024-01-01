import {OverlayToaster, Toaster} from "@blueprintjs/core";

// /** Singleton toaster instance. Create separate instances for different options. */
// export const AppToaster = OverlayToaster.create({
//     // className: "recipe-toaster",
//     position: Position.TOP,
// });

// hack for blueprint 5, remove in blueprint 6
export const AppToasterRef = {ref: null as Toaster | null}
export const AppToaster = ()=>AppToasterRef.ref ?? {show: ()=>{}, dismiss: ()=>{}} as any as Toaster

/**
 * Use this component in the App.tsx or other root component to create the AppToaster singleton
 */
export function AppToasterOverlay(){
    return <OverlayToaster ref={(ref: Toaster|null) => (AppToasterRef.ref = ref)} />
}
