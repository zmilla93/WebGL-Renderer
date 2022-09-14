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

class ShaderAttribute {
    // name;
    // location;
    // count;
    // type;
    // stride;
    // offset;
    constructor(name, location, count, type, stride, offset) {
        this.name = name;
        this.location = location;
        this.count = count;
        this.type = type;
        this.stride = stride;
        this.offset = offset;
    }
}

class Shader {
    // program;
    // attributes;
    // uniforms;
    constructor(program, attributes, uniforms) {
        this.program = program;
        this.attributes = attributes;
        this.uniforms = uniforms;
    }
}

class Material {
    shader;
    settings;
}

class Engine {
    static test;
}

function main() {
    // Get the WebGL Context from the canvas
    // This contains all of the fun WebGL functions and constants
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
    const canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl2", { antialias: true, depth: true });

    cam = new Camera();

    Engine.test = function () {
        // alert("!");
    }

    Engine.test();

    initGLSettings();
    shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (shaderProgram == null) return;

    const valuesPerVertex = 9;
    const positionLocation = gl.getAttribLocation(shaderProgram, "vertexPosition");
    const colorLocation = gl.getAttribLocation(shaderProgram, "vertexColor");
    const normalLocation = gl.getAttribLocation(shaderProgram, "vertexNormal");
    const positionAttribute = {
        name: "vertexPosition",
        location: positionLocation,
        count: 3,
        type: gl.FLOAT,
        stride: Float32Array.BYTES_PER_ELEMENT * valuesPerVertex,
        offset: 0,
    };
    // const normalAttribute = {
    //     name:"aVertexColor",
    //     location: colorLocation,
    //     count: 3,
    //     type: gl.FLOAT,
    //     stride: Float32Array.BYTES_PER_ELEMENT * valuesPerVertex,
    //     offset: Float32Array.BYTES_PER_ELEMENT * 3,
    // };
    const normalAttribute = {
        name: "vertexNormal",
        location: normalLocation,
        count: 3,
        type: gl.FLOAT,
        stride: Float32Array.BYTES_PER_ELEMENT * valuesPerVertex,
        offset: Float32Array.BYTES_PER_ELEMENT * 3,
    };
    // };
    const colorAttribute = {
        name: "vertexColor",
        location: colorLocation,
        count: 3,
        type: gl.FLOAT,
        stride: Float32Array.BYTES_PER_ELEMENT * valuesPerVertex,
        offset: Float32Array.BYTES_PER_ELEMENT * 6,
    };
    const transformMatrixLocation = gl.getUniformLocation(shaderProgram, "transformMatrix");
    const ambientLightLocation = gl.getUniformLocation(shaderProgram, "ambientLight");
    const sunlightAngleLocation = gl.getUniformLocation(shaderProgram, "sunlightAngle");
    const sunlightIntensityLocation = gl.getUniformLocation(shaderProgram, "sunlightIntensity");

    var sunAngle = vec3.fromValues(0, 1, 0);
    // vec3.rotateX(sunAngle, sunAngle, ZERO_VECTOR, 45 * DEG2RAD);
    vec3.rotateZ(sunAngle, sunAngle, ZERO_VECTOR, -45 * DEG2RAD);
    // vec3.rotateY(sunAngle, sunAngle, ZERO_VECTOR, 45 * DEG2RAD);

    console.log(sunAngle);

    // gl.uniform3f(sunlightAngleLocation, false, 0, 1, 0);
    // gl.uniform3f(sunlightAngleLocation, false, 0,0,0);
    // gl.uniform3f(sunlightAngleLocation, false, sunAngle.x, sunAngle.y, sunAngle.z);
    gl.uniform3f(sunlightAngleLocation, sunAngle[0], sunAngle[1], sunAngle[2]);
    // gl.uniform3f(sunlightAngleLocation, false, 1, 1, 1);
    gl.uniform3f(ambientLightLocation, 0.2, 0.2, 0.2);
    gl.uniform1f(sunlightIntensityLocation, 6);


    // gl.uniformMatrix4fv(transformMatrixLocation, false, this.gameObject.matrix);
    const uniforms = {
        transformMatrix: transformMatrixLocation,
    }
    // gl.uniformMatrix4fv(transformMatrixLocation, false, this.gameObject.matrix);

    var attributes = [positionAttribute, normalAttribute, colorAttribute];
    var defaultShader = new Shader(shaderProgram, attributes);

    // BLOCK MESH
    var blockMesh = objToMesh(cubeModel);
    blockMesh.createData();
    blockMesh.createBuffer(gl, attributes);
    blockMesh.buffer(gl);

    // PLANE MESH
    var mesh = objToMesh(planeModel);
    mesh.createData();
    mesh.createBuffer(gl, attributes);
    mesh.buffer(gl);

    // PLANE OBJECT
    // var gameObject = new GameObject();
    // gameObject.position[0] = -2;
    // gameObject.position[1] = -2;
    // gameObject.position[2] = -6;
    // gameObject.rotation[0] = 30;
    // meshRenderer = new MeshRenderer(gameObject, mesh);

    // MOKEY 
    var sphereMesh = objToMesh(monkeyModel);
    sphereMesh.createData();
    sphereMesh.createBuffer(gl, attributes);
    sphereMesh.buffer(gl);
    var sphere = new GameObject();
    sphere.position[2] = -3;
    sphereRenderer = new MeshRenderer(sphere, sphereMesh);

    // Block Floor
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

    for (renderer of MeshRenderer.renderList) {
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

function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
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