function main(){
    const canvas = document.getElementById("coolCanvas");
    const gl = canvas.getContext("webgl2", { antialias: true, depth: true });
}

window.addEventListener('load', main);