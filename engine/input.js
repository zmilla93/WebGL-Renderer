// Hadles keyboard input
// Use Input.isKeyPressed(keyCode) and Input.wasPressedThisFrame(keyCode) to check keyboard state

class Input {
    static pressedThisFrame = new Set();
    static pressedKeys = new Set();
    static canvasList = [];
    static isKeyPressed(keyCode) {
        return Input.pressedKeys.has(keyCode);
    }
    static wasPressedThisFrame(keyCode) {
        return Input.pressedThisFrame.has(keyCode);
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

    static addMouseListeners(canvas) {
        canvas.addEventListener("mousedown", function (e) {

        });
        document.addEventListener("mouseup", function (e) {
            
        });
        document.addEventListener("mousemove", function (e) {
 
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

// window.addEventListener('load', new function(){
//     Input.addKeyboardListeners();
// });