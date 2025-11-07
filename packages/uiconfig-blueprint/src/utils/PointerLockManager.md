# PointerLockManager

A utility class for implementing Unity-style cursor wrap-around behavior using the Pointer Lock API. This allows for infinite dragging without cursor constraints.

## Overview

The `PointerLockManager` provides a seamless way to capture the mouse pointer, hide the real cursor, display a fake cursor, and implement cursor wrap-around at screen edges. This is particularly useful for draggable UI elements that need unlimited range of motion.

## Features

- 🔒 **Pointer Lock API integration** - Captures mouse for unlimited movement
- 🎯 **Fake cursor rendering** - Shows a custom cursor while the real one is hidden
- 🔄 **Screen edge wrap-around** - Cursor automatically wraps to opposite edge
- 📍 **Movement tracking** - Provides both movement deltas and absolute cursor position
- 🧹 **Automatic cleanup** - Properly releases pointer lock and cleans up resources

## Installation

The PointerLockManager is part of the internal utils package:

```typescript
import { PointerLockManager } from '../utils/pointerLock';
```

## Basic Usage

### 1. Setup

Create a reference to the element that will request pointer lock:

```typescript
import * as React from 'react';
import { PointerLockManager } from '../utils/pointerLock';

function MyComponent() {
  const pointerLockManagerRef = React.useRef<PointerLockManager | null>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);

  // ... rest of component
}
```

### 2. Initialize on Mouse Down

Request pointer lock when the user starts interacting:

```typescript
const handleMouseDown = (ev: React.MouseEvent) => {
  if (!elementRef.current) return;

  // Create the pointer lock manager
  pointerLockManagerRef.current = new PointerLockManager(
    elementRef.current,
    {
      onMove: handlePointerMove,
      onLockChange: (locked) => {
        if (!locked) {
          cleanup();
        }
      }
    }
  );

  // Request lock at current cursor position
  pointerLockManagerRef.current.requestLock(ev.clientX, ev.clientY);
};
```

### 3. Handle Movement

Implement the movement handler to track cursor changes:

```typescript
const handlePointerMove = (
  movementX: number,
  movementY: number,
  cursorX: number,
  cursorY: number
) => {
  // movementX, movementY: delta movement since last event
  // cursorX, cursorY: absolute fake cursor position on screen

  console.log(`Movement: ${movementX}, ${movementY}`);
  console.log(`Cursor at: ${cursorX}, ${cursorY}`);

  // Apply movement to your logic
  updateValue(movementX);
};
```

### 4. Release Lock

Clean up when interaction ends:

```typescript
const cleanup = () => {
  if (pointerLockManagerRef.current) {
    pointerLockManagerRef.current.releaseLock();
    pointerLockManagerRef.current = null;
  }
};

// Call cleanup on mouse up
onMouseUp={() => {
  cleanup();
}}
```

## Complete Example

Here's a complete example of a draggable number input:

```typescript
import * as React from 'react';
import { PointerLockManager } from '../utils/pointerLock';

interface DraggableNumberInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function DraggableNumberInput({ value, onChange }: DraggableNumberInputProps) {
  const pointerLockManagerRef = React.useRef<PointerLockManager | null>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  const dragStartValueRef = React.useRef(0);
  const accumulatedOffsetRef = React.useRef(0);

  const handlePointerMove = React.useCallback(
    (movementX: number, _movementY: number, _cursorX: number, _cursorY: number) => {
      // Accumulate horizontal movement
      accumulatedOffsetRef.current += movementX;

      // Calculate new value
      const newValue = dragStartValueRef.current + accumulatedOffsetRef.current * 0.1;

      // Update parent
      onChange(newValue);
    },
    [onChange]
  );

  const endDrag = React.useCallback(() => {
    if (pointerLockManagerRef.current) {
      pointerLockManagerRef.current.releaseLock();
      pointerLockManagerRef.current = null;
    }

    document.documentElement.style.cursor = 'auto';
    document.removeEventListener('mouseup', endDrag);
  }, []);

  const startDrag = React.useCallback(
    (ev: React.MouseEvent) => {
      if (!divRef.current) return;

      dragStartValueRef.current = value;
      accumulatedOffsetRef.current = 0;

      // Hide real cursor
      document.documentElement.style.cursor = 'none';

      // Create pointer lock manager
      pointerLockManagerRef.current = new PointerLockManager(divRef.current, {
        onMove: handlePointerMove,
        onLockChange: (locked) => {
          if (!locked) {
            endDrag();
          }
        }
      });

      pointerLockManagerRef.current.requestLock(ev.clientX, ev.clientY);

      this.pointerLockManager = null;
    }

    document.documentElement.style.cursor = 'auto';
    document.removeEventListener('mouseup', this.endDrag);
  };

  render() {
    return (
            <div
                    ref={this.divRef}
    onMouseDown={this.startDrag}
    style={{ cursor: 'ew-resize' }}
  >
    Value: {this.props.value.toFixed(2)}
    </div>
  );
  }
}
```

## API Reference

### Constructor

```typescript
constructor(element: HTMLElement, options: PointerLockOptions)
```

**Parameters:**
- `element`: The HTML element that will request pointer lock
- `options`: Configuration object

### PointerLockOptions

```typescript
interface PointerLockOptions {
  onMove: (movementX: number, movementY: number, cursorX: number, cursorY: number) => void;
  onLockChange?: (locked: boolean) => void;
}
```

**Properties:**
- `onMove`: Callback fired on mouse movement
  - `movementX`: Horizontal movement delta (pixels)
  - `movementY`: Vertical movement delta (pixels)
  - `cursorX`: Absolute X position of fake cursor (pixels)
  - `cursorY`: Absolute Y position of fake cursor (pixels)
- `onLockChange`: Optional callback when lock state changes
  - `locked`: Whether pointer is currently locked

### Methods

#### `requestLock(initialX: number, initialY: number): void`

Requests pointer lock and shows the fake cursor.

**Parameters:**
- `initialX`: Initial X position for fake cursor
- `initialY`: Initial Y position for fake cursor

**Example:**
```typescript
manager.requestLock(event.clientX, event.clientY);
```

#### `releaseLock(): void`

Releases pointer lock and hides the fake cursor. Automatically called when the user presses ESC.

**Example:**
```typescript
manager.releaseLock();
```

#### `isPointerLocked(): boolean`

Returns whether the pointer is currently locked.

**Returns:** `true` if locked, `false` otherwise

**Example:**
```typescript
if (manager.isPointerLocked()) {
  console.log('Pointer is locked');
}
```

## Cursor Wrap-Around Behavior

When the fake cursor reaches the edge of the screen, it automatically wraps to the opposite side:

- **Left edge** → wraps to right edge
- **Right edge** → wraps to left edge
- **Top edge** → wraps to bottom edge
- **Bottom edge** → wraps to top edge

This provides infinite dragging space, similar to Unity's inspector fields.

## Fake Cursor

The fake cursor is a singleton instance shared across all `PointerLockManager` instances. It:

- Appears as a white arrow with black stroke
- Has `pointer-events: none` to not interfere with interactions
- Has maximum z-index (999999) to stay on top
- Is automatically managed (shown/hidden) by the manager

## Best Practices

1. **Always clean up**: Make sure to call `releaseLock()` when done
2. **Listen for ESC**: The browser will release pointer lock when ESC is pressed, handle this in `onLockChange`
3. **Store reference**: Keep the manager instance as a class property
4. **Reset state**: Reset your drag state when pointer lock is released
5. **Hide real cursor**: Set `cursor: 'none'` on a parent element when locking

## Browser Compatibility

The Pointer Lock API is supported in all modern browsers:
- Chrome/Edge 37+
- Firefox 50+
- Safari 10.1+

## Limitations

- User can exit pointer lock by pressing ESC
- Some browsers may show a notification when pointer lock is activated
- Pointer lock can only be requested in response to user interaction (e.g., click)
- Only one element can have pointer lock at a time

## Troubleshooting

### Pointer lock not activating

**Problem:** `requestLock()` is called but nothing happens.

**Solution:** Ensure the call is made in response to a user gesture (like a mouse click).

### Fake cursor not showing

**Problem:** Pointer locks but no cursor appears.

**Solution:** Check that the element is properly mounted in the DOM before requesting lock.

### Lock releases immediately

**Problem:** Pointer lock is released right after requesting.

**Solution:** Check browser console for security errors. Ensure the element is visible and focusable.

### Movement feels wrong

**Problem:** Movement direction or sensitivity is incorrect.

**Solution:** Adjust the movement multiplier in your `onMove` handler. You may need to negate or scale the values.

## See Also

- [Pointer Lock API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API)
- [DraggableIcon Component](../components/DraggableIcon.tsx) - Reference implementation
