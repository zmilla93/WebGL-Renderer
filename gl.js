// // This code depends on glmatrix, a js library for Vector3 and matrix math;
// // https://glmatrix.net/
// // Some aliases, for ease of use.
// const mat4 = glMatrix.mat4;
// const vec3 = glMatrix.vec3;

// // Multiplying a degree by this constant will give the radian equivalent.
// const DEG2RAD = Math.PI / 180;

var rotationX = 0;
var rotationY = 0;
var camRotationY = 0;

// const gl;
// const canvas = document.getElementById("glCanvas");
// var gl = canvas.getContext("webgl", { antialias: true, depth: true });

var gl;
var shaderProgram;
var cam;
var cameraDeltaX = 0;
var running = true;
var testChunk;

const keyMap = new Set();

function main() {
    // Get the WebGL Context from the canvas
    // This contains all of the fun WebGL functions and constants
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
    const canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl", { antialias: true, depth: true });

    // Keyboard calbacks
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
    canvas.onfocus = function () {
        console.log("focus");
    }
    setupControls();

    cam = new Camera();
    // Initalize shaders
    // var shaderProgram = initShaders(gl);
    initGLSettings();
    shaderProgram = initShaders(gl);
    if (shaderProgram == null) return;

    // Draw the scene
    // testChunk = new Chunk();
    // console.log(testChunk);
    drawScene(gl, shaderProgram);

    // window.requestAnimationFrame(draw);
    setInterval(update, 1000 / 60);
}

function draw() {
    console.log("draw");
    if (running) {
        window.requestAnimationFrame(draw);
    }
}

function updateKey(key, state) {
    if (state) {
        keyMap.add(key);
    } else {
        if (keyMap.has(key)) {
            keyMap.delete(key);
        }
    }
}

function update() {
    if (keyMap.has('w')) {
        console.log("w");
        vec3.add(cam.position, cam.position, cam.viewDirection);
        drawScene();
    }
    if (keyMap.has('s')) {
        var localBack = vec3.create();
        // vec3.rotateY()
        vec3.add(cam.position, cam.position, BACK_VECTOR);
        drawScene();
    }
    if (keyMap.has('a')) {
        vec3.add(cam.position, cam.position, LEFT_VECTOR);
        drawScene();
    }
    if (keyMap.has('d')) {
        vec3.add(cam.position, cam.position, RIGHT_VECTOR);
        drawScene();
    }
    if (keyMap.has('q')) {
        vec3.rotateY(cam.viewDirection, cam.viewDirection, ZERO_VECTOR, 4 * DEG2RAD);
        drawScene();
    }
    if (keyMap.has('e')) {
        vec3.rotateY(cam.viewDirection, cam.viewDirection, ZERO_VECTOR, -4 * DEG2RAD);
        drawScene();
    }
}

function setupControls() {
    var rotationXSlider = document.getElementById("rotationXSlider");
    var rotationYSlider = document.getElementById("rotationYSlider");
    var camRotationYSlider = document.getElementById("camRotationYSlider");
    rotationXSlider.oninput = function () {
        rotationX = this.value;
        drawScene(gl, shaderProgram);
    }
    rotationYSlider.oninput = function () {
        rotationY = this.value;
        drawScene(gl, shaderProgram);
    }
    camRotationYSlider.oninput = function () {
        camRotationY = this.value;
        drawScene(gl, shaderProgram);
    }
}
// class Vertex {
//     constructor(position, color) {
//         this.position = position;
//         this.color = color;
//     }
// }

// class Vector3 {
//     constructor(x, y, z) {
//         this.x = x;
//         this.y = y;
//         this.z = z;
//     }
// }

// class Shape {
//     vertices;
//     indices;
//     vertexCount;
//     constructor(vertexData, indices) {
//         this.vertices = shapeToFloatArray(vertexData);
//         this.vertexCount = indices.length;
//         this.indices = indices;
//     }
// }

const FLOAT32_SIZE = 4;

function createBuffer(shape) {
    const vertexBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    const positionLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    const colorLocation = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // fixme : should shape indices be already converted???
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);
    const buffer = {
        shape: shape,
        indexBuffer: indexBuffer,
        verexBuffer: vertexBuffer,
    }
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    return buffer;
}

function initGLSettings() {
    // gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(50 / 255, 115 / 255, 168 / 255, 1);
    // gl.clearDepth(1.0);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var uniformLocation = gl.getUniformLocation(shaderProgram, "dominatingColor");
    gl.uniform4f(uniformLocation, 0.0, 1.0, 1.0, 1.0);

    const fieldOfView = 60 * DEG2RAD;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 1000.0;

    var translationMatrix = mat4.create();
    var projectionMatrix = mat4.create();
    var transformMatrix = mat4.create();

    mat4.translate(translationMatrix, translationMatrix, [-0.0, 0.0, -6.0]);
    var rotationMatrix = mat4.create();
    var rotationAxis = mat4.create();

    rotationAxis[1] = 1;
    mat4.rotateX(rotationMatrix, rotationMatrix, rotationX * DEG2RAD);
    mat4.rotateY(rotationMatrix, rotationMatrix, rotationY * DEG2RAD);

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);


    mat4.mul(transformMatrix, projectionMatrix, translationMatrix);
    mat4.mul(transformMatrix, transformMatrix, rotationMatrix);

    const transformMatrixLocation = gl.getUniformLocation(shaderProgram, "transformMatrix");
    gl.uniformMatrix4fv(transformMatrixLocation, false, transformMatrix);

    // drawShape(gl, shaderProgram, megaTri);

    const cube = createBuffer(Shapes.cube);
    // drawShape(gl, cube);

    // var camRotation = vec3.create();
    var point = vec3.create();
    vec3.add(point, cam.position, cam.viewDirection)
    // vec3.rotateY(cam.viewDirection, cam.viewDirection, cam.position, cameraDeltaX * DEG2RAD)
    // vec3.rotateY(cam.viewDirection, point, cam.position, cameraDeltaX * DEG2RAD)
    // console.log(cam.viewDirection);

    // CUBE 2
    translationMatrix = mat4.create();
    projectionMatrix = mat4.create();
    transformMatrix = mat4.create();
    rotationMatrix = mat4.create();
    rotationAxis = mat4.create();

    mat4.translate(translationMatrix, translationMatrix, [-2.0, 2.0, -6.0]);
    rotationAxis.y = 1;
    mat4.rotateX(rotationMatrix, rotationMatrix, 45 * DEG2RAD);
    mat4.rotateY(rotationMatrix, rotationMatrix, 45 * DEG2RAD);

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);


    // console.log(cam);
    mat4.mul(transformMatrix, projectionMatrix, cam.getWorldtoViewMatrix());
    mat4.mul(transformMatrix, transformMatrix, translationMatrix);
    // mat4.mul(transformMatrix, transformMatrix, cam.getWorldtoViewMatrix());
    mat4.mul(transformMatrix, transformMatrix, rotationMatrix);

    gl.uniformMatrix4fv(transformMatrixLocation, false, transformMatrix);



    const cube2 = createBuffer(Shapes.cube);
    const cube3 = createBuffer(Shapes.cube);


    // const cam = new Camera();
    // console.log(cam);

    drawShape(gl, cube2);

    var go1 = new GameObject();
    go1.init(gl, cube2);
    go1.position[0] = 2;
    go1.position[1] = -4;
    go1.position[2] = -20;
    renderGameObject(go1, cube2)

    // var shape = new Shape("a");
    var gameObjects = [];
    const count = 100;
    const halfCount = count / 2;
    for (var x = -halfCount; x < halfCount; x++) {
        for (var z = -halfCount; z < halfCount; z++) {
            var gameObject = new GameObject();
            gameObject.init(gl, cube2);
            gameObject.position[0] = x * 2;
            gameObject.position[1] = -5;
            gameObject.position[2] = -10 - z * 2;
            // gameObject.rotation[1] = 25;
            renderGameObject(gameObject, cube2);
        }
    }


}

// function drawShape(gl, shaderProgram, shape) {
//     const vertexBuffer = gl.createBuffer();
//     const indexBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

//     // const positionLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
//     // const colorLocation = gl.getAttribLocation(shaderProgram, "aVertexColor");
//     // gl.enableVertexAttribArray(positionLocation);
//     // gl.enableVertexAttribArray(colorLocation);
//     // gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
//     // gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

//     gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);
//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

//     gl.drawElements(gl.TRIANGLES, shape.vertexCount, gl.UNSIGNED_SHORT, 0);
// }

function drawShape(gl, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
    gl.drawElements(gl.TRIANGLES, buffer.shape.vertexCount, gl.UNSIGNED_SHORT, 0);
    // gl.drawElements(gl.LINE_STRIP, buffer.shape.vertexCount, gl.UNSIGNED_SHORT, 0);
}

function renderGameObject(gameObject, buffer) {
    // FIXME : cache this
    const transformMatrixLocation = gl.getUniformLocation(shaderProgram, "transformMatrix");
    gl.uniformMatrix4fv(transformMatrixLocation, false, gameObject.matrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
    gl.drawElements(gl.TRIANGLES, buffer.shape.vertexCount, gl.UNSIGNED_SHORT, 0);
}


function initShaders(gl) {
    // Compile Shaders
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (vertexShader == null || fragmentShader == null) return;

    // Create a shader program,
    // attach the shaders to the program,
    // then link the program.
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Failed to initialize shaders: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }

    // Delete the shaders, then use the program
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.useProgram(shaderProgram);
    return shaderProgram;
}

// Compiles a single shader, returning the shader ID.
// gl - WebGL Context
// type - Shader Type (gl.VERTEX_SHADER, gl.FRAGMENT_SHADER)
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