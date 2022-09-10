function main() {
    // Get the WebGL Context from the canvas
    // This contains all of the fun WebGL functions and constants
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl", { antialias: false, depth: true });

    // Initalize all shaders
    initShaders(gl);

    // Draw the scene
    drawScene(gl);

    console.log(gl.FLOAT);
}

class Vertex{
    constructor(position, color){
        this.position = position;
        this.color = color;
    }
}

class Vector{
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    // gl.depthFunc(gl.LEQUAL);

    const v1 = new Vertex(new Vector(0,0,0), new Vector(0,1,0));
    console.log(v1);

    const positions = [
        +0.0, +1.0,
        +1.0, +0.0, +0.0,
        +1.0, -1.0,
        +0.0, +1.0, +0.0,
        -1.0, -1.0,
        +0.0, +0.0, +1.0,

        +0.0, +1.0,
        +1.0, +0.0, +0.0,
        +1.0, -1.0,
        +0.0, +1.0, +0.0,
        -1.0, -1.0,
        +0.0, +0.0, +1.0,
    ];

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);

    // fixme : sizeof float32
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 5 * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

    const indices = [0, 1, 2];
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    // gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

}

// Compile all shaders
function initShaders(gl) {
    // Compile Shaders

    // var vertexShaderSource = document.getElementById("fragmentShaderSource").innerHTML;
    // var vertexShaderSource = document.getElementById("vertexShaderSource").contentWindow.document.body.childNodes[0].innerHTML;
    alert(vertexShaderSource);
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create a shader program,
    // attach the shaders to the program,
    // then link and use the program.
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Failed to initialize shaders: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }
    gl.useProgram(shaderProgram);
    return shaderProgram;
}

// Compiles a single shader, returning the shader ID.
// gl - WebGL Context
// type - Shader Type (Vertex/Fragment)
// shaderSource - Shader source code (string)
function compileShader(gl, type, shaderSource) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`Error compiling shader: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

window.onload = main;