// This file handles everything related inputs.
// This includes mouse, keyboard, and HTML controls.

const pressedThisFrame = new Set();
const pressedKeys = new Set();

function main(){
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
}

function updateKey(key, state) {
    if (state) {
        pressedKeys.add(key);
        pressedThisFrame.add(key);
    } else {
        if (pressedKeys.has(key)) {
            pressedKeys.delete(key);
        }
    }
}

window.onload = main;