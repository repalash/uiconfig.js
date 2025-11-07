// Pointer Lock API utilities for cursor wrap-around behavior

class FakeCursor {
    private element: HTMLDivElement | null = null;
    private x = 0;
    private y = 0;
    private visible = false;

    constructor() {
        if (typeof document !== 'undefined') {
            this.createCursorElement();
        }
    }

    private createCursorElement() {
        this.element = document.createElement('div');
        this.element.style.position = 'fixed';
        this.element.style.width = '16px';
        this.element.style.height = '16px';
        this.element.style.transform = 'translate(calc(-50% + 1px), calc(-50% + 1px))';
        this.element.style.pointerEvents = 'none';
        this.element.style.zIndex = '999999';
        this.element.style.display = 'none';
        this.element.innerHTML = `
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1_176)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 5.9907V5.9957L5.997 11.9917L5.998 7.9927H7.997H10.017V11.9927L15.997 5.9917L10.017 -0.00730079L10.018 4.0117L7.997 4.0137H5.997L5.998 -0.00830078L0 5.9907ZM1.411 5.9937L4.998 2.4057L4.997 4.9927H8.497H11.018V2.4077L14.583 5.9937L11.019 9.5787L11.018 6.9937H8.497L4.998 6.9927L4.997 9.5787L1.411 5.9937Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.4971 6.9932H11.0181V9.5792L14.5831 5.9932L11.0181 2.4082V5.0132H8.4971H4.9971V2.4062L1.4111 5.9932L4.9971 9.5792V6.9922L8.4971 6.9932Z" fill="black"/>
</g>
<defs>
<clipPath id="clip0_1_176">
<rect width="16" height="12" fill="white"/>
</clipPath>
</defs>
</svg>
        `;
        document.body.appendChild(this.element);
    }

    show() {
        if (this.element) {
            this.element.style.display = 'block';
            this.visible = true;
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.visible = false;
        }
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        if (this.element) {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    isVisible() {
        return this.visible;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
    }
}

// Singleton instance
let fakeCursorInstance: FakeCursor | null = null;

export function getFakeCursor(): FakeCursor {
    if (!fakeCursorInstance) {
        fakeCursorInstance = new FakeCursor();
    }
    return fakeCursorInstance;
}

export function destroyFakeCursor() {
    if (fakeCursorInstance) {
        fakeCursorInstance.destroy();
        fakeCursorInstance = null;
    }
}

export interface PointerLockOptions {
    onMove: (movementX: number, movementY: number, cursorX: number, cursorY: number) => void;
    onLockChange?: (locked: boolean) => void;
}

export class PointerLockManager {
    private element: HTMLElement;
    private fakeCursor: FakeCursor;
    private options: PointerLockOptions;
    private isLocked = false;
    private cursorX = 0;
    private cursorY = 0;

    constructor(element: HTMLElement, options: PointerLockOptions) {
        this.element = element;
        this.options = options;
        this.fakeCursor = getFakeCursor();
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
    }

    requestLock(initialX: number, initialY: number) {
        this.cursorX = initialX;
        this.cursorY = initialY;
        this.fakeCursor.setPosition(initialX, initialY);
        this.fakeCursor.show();

        this.element.requestPointerLock();

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    }

    releaseLock() {
        if (this.isLocked) {
            document.exitPointerLock();
        }
        this.cleanup();
    }

    private cleanup() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
        this.fakeCursor.hide();
        this.isLocked = false;
    }

    private handlePointerLockChange() {
        this.isLocked = document.pointerLockElement === this.element;

        if (!this.isLocked) {
            this.cleanup();
        }

        if (this.options.onLockChange) {
            this.options.onLockChange(this.isLocked);
        }
    }

    private handleMouseMove(ev: MouseEvent) {
        if (!this.isLocked) return;

        const movementX = ev.movementX || 0;
        const movementY = ev.movementY || 0;

        // Update fake cursor position
        this.cursorX += movementX;
        this.cursorY += movementY;

        // Wrap around screen edges
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (this.cursorX < 0) {
            this.cursorX = screenWidth - 1;
        } else if (this.cursorX >= screenWidth) {
            this.cursorX = 0;
        }

        if (this.cursorY < 0) {
            this.cursorY = screenHeight - 1;
        } else if (this.cursorY >= screenHeight) {
            this.cursorY = 0;
        }

        this.fakeCursor.setPosition(this.cursorX, this.cursorY);
        this.options.onMove(movementX, movementY, this.cursorX, this.cursorY);
    }

    isPointerLocked() {
        return this.isLocked;
    }
}

