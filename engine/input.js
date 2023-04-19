/**
 * Handles mouse and keyboard inputs.
 * 
 * Keyboard Inputs:
 * 
 * Input.isKeyPressed(keycode)
 * Input.wasPressedThisFrame(keycode)
 * 
 * Mouse Inputs:
 * 
 * Input.mousePressed(button)
 * Input.mousePressedThisFrame(button)
 * Input.deltaX
 * Input.deltaY
 * Input.dragX
 * Input.dragY
 */

class Input {
    static canvas;
    static pressedThisFrame = new Set();
    static pressedKeys = new Set();
    static canvasList = [];
    static pressedMouseButtons = new Set();
    static pressedMouseButtonsThisFrame = new Set();
    static deltaX = 0;
    static deltaY = 0;
    static dragX = 0;
    static dragY = 0;
    static scroll = 0;
    static scrollNormalized = 0;
    static canvasRect;
    static isKeyPressed(keyCode) {
        return Input.pressedKeys.has(keyCode);
    }
    static wasPressedThisFrame(keyCode) {
        return Input.pressedThisFrame.has(keyCode);
    }
    static mousePressedThisFrame(button) {
        return Input.pressedMouseButtonsThisFrame.has(button);
    }
    static mousePressed(button) {
        return Input.pressedMouseButtons.has(button);
    }
    static mousePressedThisFrame(button) {
        return Input.pressedMouseButtonsThisFrame.has(button);
    }
    static updateCanvasRect() {
        Input.canvasRect = Engine.canvas.getBoundingClientRect();
    }
    // This is called at the end of the engine event loop every frame
    static clearPressedThisFrame() {
        Input.pressedThisFrame.clear();
        Input.pressedMouseButtonsThisFrame.clear();
        Input.deltaX = 0;
        Input.deltaY = 0;
        Input.dragX = 0;
        Input.dragY = 0;
        Input.scroll = 0;
        Input.scrollNormalized = 0;
    }
    static addCanvas(canvas) {
        Input.canvasList.push(canvas);
    }
    static preventDefaults() {
        window.bind('keydown', 'ctrl+s', function (e) {
            e.preventDefault();
            alert('Ctrl+S');
            return false;
        });
    }
    static addKeyboardListeners() {
        document.addEventListener("keydown", function (e) {
            if (e.code == "Space") e.preventDefault();
            // FIXME : Only prevent default if canvas is focused
            // e.preventDefault();
            if (document.activeElement === Engine.canvas) {
                if (e.code != "F5") {
                    e.preventDefault();
                }
            }
            Input.updateKey(e, true);
        });
        document.addEventListener("keyup", function (e) {
            Input.updateKey(e, false);
        });
    }
    static addMouseListeners() {
        document.addEventListener("mousedown", function (e) {
            if (!isPointWithinRect(e.clientX, e.clientY, Input.canvasRect)) return;
            Input.pressedMouseButtons.add(e.button);
            Input.pressedMouseButtonsThisFrame.add(e.button);
        });
        document.addEventListener("mouseup", function (e) {
            Input.pressedMouseButtons.delete(e.button);
        });
        document.addEventListener("mousemove", function (e) {
            // Delta X & Y
            if (!isPointWithinRect(e.clientX, e.clientY, Input.canvasRect)) return;
            Input.deltaX = e.movementX;
            Input.deltaY = e.movementY;
            // Drag X & Y
            if (Input.pressedMouseButtons.has(0)
                || Input.pressedMouseButtons.has(1)
                || Input.pressedMouseButtons.has(2)
            ) {
                Input.dragX = e.movementX;
                Input.dragY = e.movementY;
            }
        });
        document.addEventListener("wheel", function (e) {
            if (!isPointWithinRect(e.clientX, e.clientY, Input.canvasRect)) return;
            Input.scroll = e.deltaY;
            Input.scrollNormalized = e.deltaY / Math.abs(e.deltaY);
        });
    }
    static updateKey(e, state) {
        if (state) {
            Input.pressedKeys.add(e.code);
            Input.pressedThisFrame.add(e.code);
        } else {
            if (Input.pressedKeys.has(e.code)) {
                Input.pressedKeys.delete(e.code);
            }
        }
    }
}