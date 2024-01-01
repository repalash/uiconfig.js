import * as React from "react";
import {Icon, IconName, MaybeElement} from "@blueprintjs/core";

// todo: bounds and stepsize
export class DraggableIcon extends React.Component<{ icon: IconName | MaybeElement, size?: number, value: number, stepSize?: number, small?: boolean, onChange: (v: number, last?: boolean) => void }> {
    private cursor = 'auto'
    private dragStartOffset = -Infinity
    private dragStartValue = -Infinity
    private lastValue = -Infinity
    private removeEvents = () => {
        if (isFinite(this.lastValue)) this.props.onChange(this.lastValue)
        this.lastValue = -Infinity
        this.dragStartOffset = -Infinity
        this.dragStartValue = -Infinity
        document.removeEventListener('mousemove', this.mouseMoveEvent)
        document.removeEventListener('mouseup', this.mouseUpEvent)
        document.documentElement.style.cursor = this.cursor
        // setDragging(false)
    };
    private mouseUpEvent = (ev: MouseEvent) => {
        ev.stopPropagation()
        ev.preventDefault()
        this.removeEvents()
    };
    private mouseMoveEvent = (ev: MouseEvent) => {
        ev.stopPropagation()
        ev.preventDefault()
        if (ev.buttons > 0) {
            if (isFinite(this.dragStartValue) && isFinite(this.dragStartOffset)) {
                let stepSize = (this.props.stepSize ?? 1) / 10
                let curr = ev.clientX;
                let mm = 100;
                let off = this.dragStartOffset - curr;
                // off = Math.min(mm, Math.max(-mm, off));
                off = off / mm; //-1, 1
                // off = (off + 1)/2;
                // off *= (props.max - props.min) / 2
                off *= ((stepSize) * 100) / 2
                if (ev.shiftKey) off *= 10
                if (ev.altKey) off *= 0.1

                let val = this.dragStartValue - off;
                // val = Math.min(props.max, Math.max(props.min, val)); // todo
                val = Number(val.toFixed(Math.max(1, -Math.log10(stepSize / 10)))); // clip decimal places depending on step size
                this.props.onChange(val, false)
                this.lastValue = val;
            }
        } else {
            this.removeEvents()
            // setDragging(false)
        }
    };

    render() {
        // const [dragging, setDragging] = React.useState(false)

        return (
            <div style={{cursor: 'ew-resize', marginLeft: "6px", marginRight: "6px", marginTop: this.props.small ? "3px" : "6px", marginBottom: this.props.small ? "3px" : "6px"}}
                 onMouseDown={(ev) => {
                     // if(dragging) return
                     this.dragStartOffset = ev.clientX
                     this.dragStartValue = this.props.value
                     ev.stopPropagation()
                     ev.preventDefault()
                     this.cursor = document.documentElement.style.cursor
                     document.documentElement.style.cursor = "ew-resize"
                     document.addEventListener('mousemove', this.mouseMoveEvent)
                     document.addEventListener('mouseup', this.mouseUpEvent)
                     // setDragging(true)
                 }}
            >
                <Icon icon={this.props.icon} size={this.props.size}/>
            </div>
        )
    }
}
