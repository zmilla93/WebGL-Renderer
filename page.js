let canvas;
let aboutDialog;
let showAboutDialog = false;

function run() {
    // Hide loading dialog once page is loaded
    let loadingDialog = document.getElementById("loadingDialog");
    loadingDialog.style.display = "none";

    // Get references to canvas & about dialog
    canvas = document.getElementById("glCanvas");
    aboutDialog = document.getElementById("aboutDialog");
    aboutDialog.style.overflow = "auto";

    // Add on click event to about button
    let aboutButton = document.getElementById("aboutButton");
    aboutButton.onclick = function () {
        showAboutDialog = !showAboutDialog;
        adjustAboutDialogVisibility();
    }

    // About back & close buttons
    let aboutBackButton = document.getElementById("aboutBackButton");
    let aboutCloseButton = document.getElementById("aboutCloseButton");
    aboutBackButton.onclick = hideAboutDialog;
    aboutCloseButton.onclick = hideAboutDialog;
}

function hideAboutDialog(){
    showAboutDialog = false;
    adjustAboutDialogVisibility();
}

function adjustAboutDialogVisibility() {
    // Canvas is hidden to prevent it from polling mouse inputs while about dialog is showing
    if (showAboutDialog) {
        canvas.style.display = "none";
        aboutDialog.style.visibility = "visible";
    } else {
        canvas.style.display = "block";
        aboutDialog.style.visibility = "hidden";
    }
}

window.addEventListener('load', run); let