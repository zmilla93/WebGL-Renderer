// This file handles everything related inputs.
// This includes mouse, keyboard, and HTML controls.

const pressedThisFrame = new Set();
const pressedKeys = new Set();

function addKeyboardListeners() {
    document.addEventListener("keydown", function (e) {
        updateKey(e.key, true);
    })
    document.addEventListener("keyup", function (e) {
        updateKey(e.key, false);
    })
    document.addEventListener("mousemove", function (e) {
        // if (canvas == document.activeElement)
        // console.log("mouse");
    })
    // canvas.onfocus = function () {
    //     console.log("focus");
    // }
    
    // Ignore default spacebar scroll
    // window.addEventListener('keydown', function (e) {
    //     if (e.code == 'Space' && e.target == document.body) {
    //         e.preventDefault();
    //     }
    // });
}

function updateKey(key, state) {
    // console.log("key")
    if (state) {
        pressedKeys.add(key);
        pressedThisFrame.add(key);
    } else {
        if (pressedKeys.has(key)) {
            pressedKeys.delete(key);
        }
    }
}

window.addEventListener('load', addKeyboardListeners)

// window.onload = hmmm;