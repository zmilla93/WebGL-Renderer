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

var gl;
var shaderProgram;
var cam;
var cameraDeltaX = 0;
var running = true;
var testChunk;

var meshRenderer;
// var simpleMesh;
var cubeMesh;
var sphereRenderer;

class ShaderAttribute{
    // name;
    // location;
    // count;
    // type;
    // stride;
    // offset;
    constructor(name, location, count, type, stride, offset){
        this.name = name;
        this.location = location;
        this.count = count;
        this.type = type;
        this.stride = stride;
        this.offset = offset;
    }
}

class Shader{
    program;
    vertexShader;
    fragmentShader;
}

class Material{
    shader;

}

function main() {
    // Get the WebGL Context from the canvas
    // This contains all of the fun WebGL functions and constants
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
    const canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl2", { antialias: true, depth: true });

    cam = new Camera();
    initGLSettings();
    shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (shaderProgram == null) return;

    const valuesPerVertex = 6;
    const positionLocation = gl.getAttribLocation(shaderProgram, "vertexPosition");
    const colorLocation = gl.getAttribLocation(shaderProgram, "aVertexColor");
    const positionAttribute = {
        location: positionLocation,
        count: 3,
        type: gl.FLOAT,
        stride: Float32Array.BYTES_PER_ELEMENT * valuesPerVertex,
        offset: 0,
    };
    const colorAttribute = {
        location: colorLocation,
        count: 3,
        type: gl.FLOAT,
        stride: Float32Array.BYTES_PER_ELEMENT * valuesPerVertex,
        offset: Float32Array.BYTES_PER_ELEMENT * 3,
    };

    var attributes = [positionAttribute, colorAttribute];





    // NEW MESH
    var mesh = objToMesh(planeModel);
    mesh.createData();
    mesh.createBuffer(gl, [positionAttribute, colorAttribute]);
    mesh.buffer(gl);
    var gameObject = new GameObject();
    gameObject.position[0] = -2;
    gameObject.position[1] = -2;
    gameObject.position[2] = -6;
    gameObject.rotation[0] = 30;
    meshRenderer = new MeshRenderer(gameObject, mesh);

    window.addEventListener('keydown', function (e) {
        if (e.code == 'Space' && e.target == document.body) {
            e.preventDefault();
        }
    });

    // myMeshRenderer.render(gl);

    var sphereMesh = objToMesh(monkeyModel);
    sphereMesh.createData();
    sphereMesh.createBuffer(gl, [positionAttribute, colorAttribute]);
    sphereMesh.buffer(gl);
    var sphere = new GameObject();
    sphere.position[2] = -3;
    sphereRenderer = new MeshRenderer(sphere, sphereMesh);

    // Block Floor
    // var gameObjects = [];
    const count = 20;
    const halfCount = count / 2;
    for (var x = -halfCount; x < halfCount; x++) {
        for (var z = -halfCount; z < halfCount; z++) {
            var gameObject = new GameObject();
            // gameObject.init(gl, cube2);
            gameObject.position[0] = x * 2;
            gameObject.position[1] = -4;
            gameObject.position[2] = -10 - z * 2;
            var renderer = new MeshRenderer(gameObject, sphereMesh)
            gameObject.add(renderer);
        }
    }

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

function update() {
    if (pressedKeys.has('w')) {
        vec3.add(cam.position, cam.position, cam.viewDirection);
        drawScene();
    }
    if (pressedKeys.has('s')) {
        var localBack = vec3.create();
        vec3.rotateY(localBack, cam.viewDirection, ZERO_VECTOR, 180 * DEG2RAD)
        vec3.add(cam.position, cam.position, localBack);
        drawScene();
    }
    if (pressedKeys.has('a')) {
        var localLeft = vec3.create();
        vec3.rotateY(localLeft, cam.viewDirection, ZERO_VECTOR, 90 * DEG2RAD)
        vec3.add(cam.position, cam.position, localLeft);
        drawScene();
    }
    if (pressedKeys.has('d')) {
        var localRight = vec3.create();
        vec3.rotateY(localRight, cam.viewDirection, ZERO_VECTOR, -90 * DEG2RAD)
        vec3.add(cam.position, cam.position, localRight);
        drawScene();
    }
    if (pressedKeys.has('q')) {
        vec3.rotateY(cam.viewDirection, cam.viewDirection, ZERO_VECTOR, 4 * DEG2RAD);
        drawScene();
    }
    if (pressedKeys.has('e')) {
        vec3.rotateY(cam.viewDirection, cam.viewDirection, ZERO_VECTOR, -4 * DEG2RAD);
        drawScene();
    }
    pressedThisFrame.clear();
}

const FLOAT32_SIZE = 4;

function createBuffer(shape) {
    const vertexBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    const positionLocation = gl.getAttribLocation(shaderProgram, "vertexPosition");
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

    const cube = createBuffer(Shapes.oldCube);
    // drawShape(gl, cube);

    // var camRotation = vec3.create();
    var point = vec3.create();
    vec3.add(point, cam.position, cam.viewDirection)
    // vec3.rotateY(cam.viewDirection, cam.viewDirection, cam.position, cameraDeltaX * DEG2RAD)
    // vec3.rotateY(cam.viewDirection, point, cam.position, cameraDeltaX * DEG2RAD)

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

    const cube2 = createBuffer(Shapes.oldCube);
    const cube3 = createBuffer(Shapes.oldCube);


    var go1 = new GameObject();
    go1.init(gl, cube2);
    go1.position[0] = 2;
    go1.position[1] = -4;
    go1.position[2] = -20;
    // renderGameObject(go1, cube2)

    // var shape = new Shape("a");
    var gameObjects = [];
    const count = 20;
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
    meshRenderer.render(gl);

    for(renderer of MeshRenderer.renderList){
        renderer.render(gl);
    }
    // sphereRenderer.render(gl);

}

function objToMesh(obj) {
    var lines = obj.trim().split('\n');
    var verticesRaw = [];
    var uvsRaw = [];
    var normalsRaw = [];
    var vertices = [];
    var uvs = [];
    var normals = [];
    var vertexCount = 0;
    var triangles = [];
    for (var line of lines) {
        var cleanLine = line.trim().replace(/\s+/, " ");
        var tokens = cleanLine.split(" ");
        switch (tokens[0]) {
            case 'o':
                // Mesh Name
                break;
            case 'v':
                // Vertex
                verticesRaw.push(vec3.fromValues(tokens[1], tokens[2], tokens[3]));
                break;
            case 'vt':
                // UVs
                uvsRaw.push(vec3.fromValues(tokens[1], tokens[2], tokens[3]));
                break;
            case 'vn':
                // Normals
                normalsRaw.push(vec3.fromValues(tokens[1], tokens[2], tokens[3]));
                break;
            case 'f':
                // Face
                for (let i = 1; i < tokens.length; i++) {
                    var values = tokens[i].split("/");
                    vertices.push(verticesRaw[values[0] - 1]);
                    uvs.push(uvsRaw[values[1] - 1]);
                    normals.push(normalsRaw[values[2] - 1]);
                }
                switch (tokens.length - 1) {
                    case 3:
                        triangles.push(vertexCount);
                        triangles.push(vertexCount + 1);
                        triangles.push(vertexCount + 2);
                        vertexCount += 3;
                        break;
                    case 4:
                        triangles.push(vertexCount);
                        triangles.push(vertexCount + 1);
                        triangles.push(vertexCount + 2);
                        triangles.push(vertexCount + 2);
                        triangles.push(vertexCount + 3);
                        triangles.push(vertexCount);
                        vertexCount += 4;
                        break;
                    default:
                        console.error("Unhandled Face Vertex Count: " + (tokens.length - 1));
                        break;
                }
                break;
            default:
                break;
        }
    }
    const mesh = new Mesh();
    mesh.vertices = vertices;
    mesh.uvs = uvs;
    mesh.normals = normals;
    mesh.triangles = triangles;
    return mesh;
}

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

    // Delete the shaders, then use the program.
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.useProgram(shaderProgram);
    return shaderProgram;
}

function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource){
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

    // Delete the shaders, then use the program.
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.useProgram(shaderProgram);
    return shaderProgram;
}

// Compile a single shader, returning the shader ID.
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