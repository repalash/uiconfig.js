import * as React from "react";
import {Icon, IconName, MaybeElement} from "@blueprintjs/core";
import {PointerLockManager} from "../utils/pointerLock";

// todo: bounds and stepsize
// todo use the old version in safari etc that change the page height on pointer lock
export class DraggableIcon extends React.Component<{ icon: IconName | MaybeElement, size?: number, value: number, stepSize?: number, small?: boolean, disabled?: boolean, onChange: (v: number, last?: boolean) => void }> {
    private cursor = 'auto'
    private dragStartValue = -Infinity
    private lastValue = -Infinity
    private pointerLockManager: PointerLockManager | null = null
    private divRef = React.createRef<HTMLDivElement>()
    private removeEvents = () => {
        if (isFinite(this.lastValue) && !this.props.disabled) this.props.onChange(this.lastValue)
        this.lastValue = -Infinity
        this.dragStartValue = -Infinity

        if (this.pointerLockManager) {
            this.pointerLockManager.releaseLock()
            this.pointerLockManager = null
        }

        document.documentElement.style.cursor = this.cursor
        // setDragging(false)
    };

    private handlePointerMove = (movementX: number, _movementY: number, _cursorX: number, _cursorY: number) => {
        if (isFinite(this.dragStartValue)) {
            let stepSize = (this.props.stepSize ?? 1) / 10

            // Use movementX for horizontal dragging
            let off = -movementX; // Negative because we want right movement to increase value

            // Scale the movement
            off *= stepSize;

            // Apply modifiers - these need to be checked differently in pointer lock
            // We'll accumulate the offset instead
            if (!this.accumulatedOffset) this.accumulatedOffset = 0;
            this.accumulatedOffset += off;

            let val = this.dragStartValue + this.accumulatedOffset;
            // val = Math.min(props.max, Math.max(props.min, val)); // todo
            val = Number(val.toFixed(Math.max(1, -Math.log10(stepSize / 10)))); // clip decimal places depending on step size

            if(!this.props.disabled) this.props.onChange(val, false)
            this.lastValue = val;
        }
    };

    private accumulatedOffset = 0;

    render() {
        // const [dragging, setDragging] = React.useState(false)

        return (
            <div
                ref={this.divRef}
                style={{cursor: !this.props.disabled ? 'ew-resize': 'auto', marginLeft: "6px", marginRight: "6px", marginTop: this.props.small ? "3px" : "6px", marginBottom: this.props.small ? "3px" : "6px"}}
                onMouseDown={(ev) => {
                    // if(dragging) return
                    if(this.props.disabled) return
                    if (!this.divRef.current) return;

                    this.dragStartValue = this.props.value
                    this.accumulatedOffset = 0

                    this.cursor = document.documentElement.style.cursor
                    document.documentElement.style.cursor = "none"

                    // Create pointer lock manager
                    this.pointerLockManager = new PointerLockManager(this.divRef.current, {
                        onMove: this.handlePointerMove,
                        onLockChange: (locked) => {
                            if (!locked) {
                                this.removeEvents();
                            }
                        }
                    });

                    this.pointerLockManager.requestLock(ev.clientX, ev.clientY);
                    ev.stopPropagation()
                    ev.preventDefault()

                    // Add mouseup listener to release lock
                    const handleMouseUp = () => {
                        this.removeEvents();
                        document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mouseup', handleMouseUp);

                    // setDragging(true)
                }}
            >
                <Icon icon={this.props.icon} size={this.props.size} aria-disabled={this.props.disabled} />
            </div>
        )
    }
}
