// Hadles keyboard input
// Use Input.isKeyPressed(keyCode) and Input.wasPressedThisFrame(keyCode) to check keyboard state

class Input {
    static pressedThisFrame = new Set();
    static pressedKeys = new Set();
    static isKeyPressed(keyCode) {
        return Input.pressedKeys.has(keyCode);
    }
    static wasPressedThisFrame(keyCode) {
        return Input.pressedThisFrame.has(keyCode);
    }
    static addKeyboardListeners() {
        document.addEventListener("keydown", function (e) {
            console.log(e);
            Input.updateKey(e, true);
        });
        document.addEventListener("keyup", function (e) {
            Input.updateKey(e, false);
        });
        document.addEventListener("mousemove", function (e) {
            // if (canvas == document.activeElement)
            // console.log("mouse");
        });
    }
    static updateKey(e, state) {
        // console.log("key")
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

window.addEventListener('load', Input.addKeyboardListeners);