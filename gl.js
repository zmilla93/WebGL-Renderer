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
var lineShader;
var cam;
var cameraDeltaX = 0;
var running = true;
var testChunk;

var meshRenderer;
var lineVAO;
// var simpleMesh;
// var cubeMesh;
var sphereRenderer;

const FLOAT32_SIZE = Float32Array.BYTES_PER_ELEMENT;

class ShaderAttribute {
    //  Holds data for weblGL vertexAttribPointer
    //  https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
    //  Location is set when it is added ot a shader object.
    location;
    constructor(name, valueCount, type, stride, offset) {
        this.name = name;
        this.valueCount = valueCount;
        this.type = type;
        this.stride = stride;
        this.offset = offset;
    }
}

class Shader {
    name;
    program;
    attributes;
    uniformMap;
    // gl - weblGL Context
    // program - gl Shader Program
    // Attributes - Array of ShaderAttributes
    // Uniforms - Array of String uniform names
    constructor(gl, name, program, attributes, uniforms) {
        this.name = name;
        this.program = program;
        this.attributes = attributes;
        this.uniformMap = new Map();
        for (let attribute of attributes) {
            let location = gl.getAttribLocation(program, attribute.name);
            if (location < 0) {
                console.error("Attribute location not found: " + attribute.name);
                continue;
            }
            attribute.location = location;
        }
        for (let uniform of uniforms) {
            let location = gl.getUniformLocation(program, uniform);
            if (location < 0) {
                console.error("Uniform location not found: " + attribute.name);
                continue;
            }
            this.uniformMap.set(uniform, location);
        }
    }
    // Returns the webGL location of the (string) uniform.
    uniform(uniform) {
        if (this.uniformMap.has(uniform))
            return this.uniformMap.get(uniform);
        console.error("Uniform '" + uniform + "' not found in map for shader '" + this.name + "'. Make sure to register uniform names on shader creation.");

    }
}

class Material {
    shader;
    applyUniforms;
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

    var l1 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, 5), vec3.fromValues(1, 1, 0));
    var l2 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, -5), vec3.fromValues(0, 1, 0));
    var l3 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, -5), vec3.fromValues(0, 1, 1));
    var l4 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, 5), vec3.fromValues(0, 0, 1));

    cam = new Camera();
    cam.position[2] = 20;
    cam.position[1] = 3;

    initGLSettings();
    shaderProgram = createShaderProgram(gl, litVertexSource, litFragmentSource);
    lineShader = createShaderProgram(gl, lineVertexSource, lineFragmentSource);
    if (shaderProgram == null) return;
    if (lineShader == null) return;
    gl.useProgram(shaderProgram);

    const valuesPerVertex = 11;
    const stride = FLOAT32_SIZE * valuesPerVertex;
    const positionAttribute = new ShaderAttribute("vertexPosition", 3, gl.FLOAT, stride, 0);
    const uvAttribute = new ShaderAttribute("vertexUV1", 2, gl.FLOAT, stride, FLOAT32_SIZE * 3);
    const normalAttribute = new ShaderAttribute("vertexNormal", 3, gl.FLOAT, stride, FLOAT32_SIZE * 5);
    const colorAttribute = new ShaderAttribute("vertexColor", 3, gl.FLOAT, stride, FLOAT32_SIZE * 8);

    var attributes = [positionAttribute, uvAttribute, normalAttribute, colorAttribute];

    const uniforms = ["transformationMatrix", "ambientLight", "sunlightAngle", "sunlightIntensity"];

    var defaultShader = new Shader(gl, "Default Shader", shaderProgram, attributes, uniforms);

    var defaultMaterial = new Material(defaultShader, function () {

    });
    // defaultMaterial.applyUniforms = function () {
    //     var shader =
    //         defaultMaterial.shader.uniform("")
    // }

    var sunAngle = vec3.fromValues(0.5, 1, 0.25);
    vec3.normalize(sunAngle, sunAngle);

    gl.uniform3f(defaultShader.uniform("sunlightAngle"), sunAngle[0], sunAngle[1], sunAngle[2]);
    gl.uniform3f(defaultShader.uniform("ambientLight"), 0.2, 0.2, 0.2);
    gl.uniform1f(defaultShader.uniform("sunlightIntensity"), 6);


    // BLOCK MESH
    var cubeMesh = objToMesh(cubeModel);
    cubeMesh.createData();
    cubeMesh.createBuffer(gl, attributes);
    cubeMesh.buffer(gl);

    // PLANE MESH
    var mesh = objToMesh(planeModel);
    mesh.createData();
    mesh.createBuffer(gl, attributes);
    mesh.buffer(gl);

    // TEXTURE SETUP
    // const texture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // const level = 0;
    // const internalFormat = gl.RGBA;
    // const width = 1;
    // const height = 1;
    // const border = 0;
    // const srcFormat = gl.RGBA;
    // const srcType = gl.UNSIGNED_BYTE;
    // const pixel = new Uint8Array([0, 0, 255, 255]);
    // gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
    // const image = new Image();
    // image.onload = function () {
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    //     gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    //     gl.generateMipmap(gl.TEXTURE_2D);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //     drawScene();
    // }
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    // if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    //     console.log("pow2");
    //     gl.generateMipmap(gl.TEXTURE_2D);
    // } else {
    //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // }
    // image.src = "textures/bedrock.png";
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // MOKEY 
    var sphereMesh = objToMesh(sphereModel);
    sphereMesh.createData();
    sphereMesh.createBuffer(gl, attributes);
    sphereMesh.buffer(gl);
    var sphere = new GameObject();
    sphere.position[0] = 10;
    sphere.position[1] = 10;
    sphere.position[2] = 10;
    sphere.rotation[0] = 90;
    sphereRenderer = new MeshRenderer(sphere, sphereMesh);

    // Block Floor
    const count = 20;
    const halfCount = count / 2;
    const spacing = 1;
    for (var x = -halfCount; x < halfCount; x++) {
        for (var z = -halfCount; z < halfCount; z++) {
            var gameObject = new GameObject();
            // gameObject.init(gl, cube2);
            gameObject.position[0] = x * spacing;
            gameObject.position[1] = 0;
            gameObject.position[2] = z * spacing;
            var renderer = new MeshRenderer(gameObject, cubeMesh)
            gameObject.add(renderer);
        }
    }

    // TEST CUBE
    var cubeGO = new GameObject();
    var cubeRenderer = new MeshRenderer(cubeGO, cubeMesh);
    // cubeGO.position[0] = 2;
    // cubeGO.position[2] = 1;

    // LINE SETUP

    const valuesPerLineVertex = 6;

    const lineVertexPos = gl.getAttribLocation(lineShader, "vertexPosition");
    const lineColorPos = gl.getAttribLocation(lineShader, "vertexColor");
    lineVAO = gl.createVertexArray();
    gl.bindVertexArray(lineVAO);
    const lineBuffer = gl.createBuffer();
    const lineData = [
        0, 0, 0,
        1, 0, 0,
        10, 10, 10,
        1, 0, 0,
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.useProgram(lineShader);
    // gl.bufferData(lineData);
    // gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineData), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(lineVertexPos);
    const linePositionAttrib = {
        name: "vertexPosition",
        location: lineVertexPos,
        count: 3,
        type: gl.FLOAT,
        stride: Float32Array.BYTES_PER_ELEMENT * valuesPerLineVertex,
        offset: 0,
    };
    const lineColorAttrib = {
        name: "vertexPosition",
        location: lineVertexPos,
        count: 3,
        type: gl.FLOAT,
        stride: Float32Array.BYTES_PER_ELEMENT * valuesPerLineVertex,
        offset: 0,
    };
    // console.log(lineVertexPos);
    gl.enableVertexAttribArray(lineVertexPos);
    gl.vertexAttribPointer(lineVertexPos, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(lineColorPos);
    gl.vertexAttribPointer(lineColorPos, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.useProgram(shaderProgram);

    // gl.polygonMode(gl.LINE)
    // gl.wireframe(true)
    createGrid();

    drawScene(gl, shaderProgram);

    // window.requestAnimationFrame(draw);
    setInterval(update, 1000 / 60);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var uniformLocation = gl.getUniformLocation(shaderProgram, "dominatingColor");
    gl.uniform4f(uniformLocation, 0.0, 1.0, 1.0, 1.0);

    // DRAW LINES
    gl.useProgram(lineShader);
    const fieldOfView = 60 * DEG2RAD;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 1;
    const zFar = 1000.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    const fullTransform = mat4.create();
    mat4.mul(fullTransform, projectionMatrix, cam.getWorldtoViewMatrix());
    // mat4.mul(fullTransform, fullTransform, cam.getWorldtoViewMatrix());d

    // const transformMatrix = mat4.create();
    // mat4.mul(transformMatrix, )
    const projectionMatrixLocation = gl.getUniformLocation(lineShader, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLocation, false, fullTransform);

    gl.bindVertexArray(lineVAO);
    var lineData = Line.data;
    // gl.lineWidth(10);
    gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.LINES, 0, Line.lineList.length * 2);

    // console.log(Line.data);
    for (line of Line.lineList) {

    }

    gl.useProgram(shaderProgram);

    for (renderer of MeshRenderer.renderList) {
        renderer.render(gl);
    }

}

function isPowerOf2(value) {
    return value & (value - 1) === 0;
}

function createGrid() {
    const gridRadius = 20;
    const gridStep = 1;
    const color = vec3.fromValues(70 / 255, 70 / 255, 70 / 255);
    // const color = vec3.fromValues(1, 0, 0);
    for (let i = -gridRadius * gridStep; i <= gridRadius * gridStep; i += gridStep) {
        var line = new Line(vec3.fromValues(-gridRadius, 0, i), vec3.fromValues(gridRadius, 0, i), color)
    }
    for (let i = -gridRadius * gridStep; i <= gridRadius * gridStep; i += gridStep) {
        var line = new Line(vec3.fromValues(i, 0, -gridRadius), vec3.fromValues(i, 0, gridRadius), color)
    }
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
    gl.clearColor(144 / 255, 212 / 255, 133 / 255, 1);
    // gl.clearDepth(1.0);
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
                uvsRaw.push(vec2.fromValues(tokens[1], tokens[2]));
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

// Creates a shader program from a given vertex and fragment shader.
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

    // Delete the shaders (not needed after linking), then use the program.
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
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
        alert(`Error compiling shader (` + glValue(type) + `): ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function glValue(value) {
    switch (value) {
        case 5126:
            return "gl.FLOAT";
        case 35632:
            return "FRAGMENT_SHADER";
        case 35633:
            return "VERTEX_SHADER";
        default:
            return "Unknown GL Value: " + value;
    }
}

window.onload = main;