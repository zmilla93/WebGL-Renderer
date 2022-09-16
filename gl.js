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

function main() {
    // Get the WebGL Context from the canvas
    // This contains all of the fun WebGL functions and constants
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
    const canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl2", { antialias: true, depth: true });

    var l1 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, 5), vec3.fromValues(1, 1, 0));
    var l2 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, -5), vec3.fromValues(0, 1, 0));
    var l3 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, -5), vec3.fromValues(0, 1, 1));
    // var l4 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, 5), vec3.fromValues(0, 0, 1));
    var l4 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, 5), vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0));

    // l3.destroy();
    // l1.destroy();

    cam = new Camera();
    cam.position[2] = 20;
    cam.position[1] = 3;

    initGLSettings();
    shaderProgram = createShaderProgram(gl, simpleLitVertexSource, simpleLitFragmentSource);
    const testShaderProgram = createShaderProgram(gl, simpleLitVertexSource, simpleLitFragmentSource);
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

    const uniforms = ["transformMatrix", "transformationMatrix", "ambientLight", "sunlightAngle", "sunlightIntensity"];

    var defaultShader = new Shader(gl, "Default Shader", litVertexSource, litFragmentSource, attributes, uniforms);
    var testShader = new Shader(gl, "Test Shader", litVertexSource, litFragmentSource, attributes, uniforms);

    const unlitUniforms = ["transformMatrix", "dominatingColor"];
    var unlitShader = new Shader(gl, "Unlit Shader", unlitVertexSource, unlitFragmentSource, attributes, unlitUniforms);
    gl.uniform3f(unlitShader.uniform("dominatingColor"), 1, 0, 0);


    gl.useProgram(defaultShader.program);

    var defaultMaterial = new Material(defaultShader, function () {

    });
    var testMaterial = new Material(defaultShader, function () {

    });
    var unlitMaterial = new Material(unlitShader, function () {
        gl.uniform3f(unlitShader.uniform("dominatingColor"), 0, 0.5, 0.31);
    });
    var greenMaterial = new Material(unlitShader, function () {
        gl.uniform3f(unlitShader.uniform("dominatingColor"), 0, 1, 0);
    });
    var coralMaterial = new Material(unlitShader, function () {
        gl.uniform3f(unlitShader.uniform("dominatingColor"), 1, 0.5, 0.31);
    });

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
    sphereRenderer = new MeshRenderer(sphereMesh, defaultMaterial);
    sphere.add(sphereRenderer);

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
            var renderer = new MeshRenderer(cubeMesh, defaultMaterial);
            gameObject.add(renderer);
        }
    }

    // TEST CUBE
    var cube1 = new GameObject();
    var cubeRenderer = new MeshRenderer(cubeMesh, greenMaterial);
    cube1.add(cubeRenderer);
    cube1.position[1] = 5;

    var cube2 = new GameObject();
    var cubeRenderer2 = new MeshRenderer(cubeMesh, unlitMaterial);
    cube2.add(cubeRenderer2);
    cube2.position[0] = 1;
    cube2.position[1] = 5;

    // var testCube2

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

    console.log(Material.materialMap);
    drawScene(gl, shaderProgram);

    // console.log(Material.materialMap);

    // window.requestAnimationFrame(draw);
    setInterval(update, 1000 / 60);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // var uniformLocation = gl.getUniformLocation(shaderProgram, "dominatingColor");
    // gl.uniform4f(uniformLocation, 0.0, 1.0, 1.0, 1.0);

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
    // mat4.mul(fullTransform, fullTransform, cam.getWorldtoViewMatrix());
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

    // Loop through the material map.
    // This is a map where shaderName = [Array of materials using that shader]
    Material.materialMap.forEach((materialGroup) => {
        var shaderChanged = false;
        materialGroup.forEach((material) => {
            // Set the shader using the first element in the array,
            // since by design all elements in the array must use the same shader.
            if (!shaderChanged) {
                // console.log("CHANGE SHADER:");
                // console.log(material.shader);
                gl.useProgram(material.shader.program);
                shaderChanged = true;
            }
            if (typeof material.applyPerMaterialUniforms === 'function')
                material.applyPerMaterialUniforms();
            // Loop through all renderers that use this material and render them.
            material.renderers.forEach((renderer) => {
                renderer.applyPerObjectUniforms();
                renderer.render(gl);
            });
        });
    });

    gl.useProgram(shaderProgram);

    // for (renderer of MeshRenderer.renderList) {
    //     renderer.render(gl);
    // }

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