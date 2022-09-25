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

var deltaTime;
var start;

function main() {
    // Get the WebGL Context from the canvas
    // This contains all of the fun WebGL functions and constants
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
    const canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl2", { antialias: true, depth: true });

    Input.addKeyboardListeners();
    Input.addMouseListeners(canvas);

    cam = new Camera();
    Camera.main = cam;
    cam.position[2] = 20;
    cam.position[1] = 3;

    initGLSettings();
    shaderProgram = createShaderProgram(gl, simpleLitVertexSource, simpleLitFragmentSource);
    const testShaderProgram = createShaderProgram(gl, simpleLitVertexSource, simpleLitFragmentSource);

    // Line Shader
    lineShader = createShaderProgram(gl, lineVertexSource, lineFragmentSource);
    if (shaderProgram == null) return;
    if (lineShader == null) return;
    gl.useProgram(shaderProgram);

    Engine.setupDefaultShaders();


    // const valuesPerVertex = 11;
    // const stride = FLOAT32_SIZE * valuesPerVertex;
    // const positionAttribute = new ShaderAttribute("vertexPosition", 3, gl.FLOAT, stride, 0);
    // const uvAttribute = new ShaderAttribute("vertexUV1", 2, gl.FLOAT, stride, FLOAT32_SIZE * 3);
    // const normalAttribute = new ShaderAttribute("vertexNormal", 3, gl.FLOAT, stride, FLOAT32_SIZE * 5);
    // const colorAttribute = new ShaderAttribute("vertexColor", 3, gl.FLOAT, stride, FLOAT32_SIZE * 8);
    // var attributes = [positionAttribute, uvAttribute, normalAttribute, colorAttribute];
    // // var defaultShader = new Shader(gl, "Default Shader", litVertexSource, litFragmentSource, attributes);
    // var defaultShader2 = new Shader(gl, "Default Shader", litVertexSource, litFragmentSource, attributes);
    // var testShader = new Shader(gl, "Test Shader", litVertexSource, litFragmentSource, attributes);
    // // var unlitShader = new Shader(gl, "Unlit Shader", unlitVertexSource, unlitFragmentSource, attributes);

    
    // gl.uniform3f(Shader.unlitShader.uniform("dominatingColor"), 1, 0, 0);

    var defaultMaterial = new Material(Shader.defaultShader);

    const dominatingColor = Shader.unlitShader.uniform("dominatingColor");
    var unlitMaterial = new Material(Shader.unlitShader, function () {
        gl.uniform3f(dominatingColor, 0, 0.5, 0.31);
    });
    var greenMaterial = new Material(Shader.unlitShader, function () {
        gl.uniform3f(dominatingColor, 0, 1, 0);
    });
    var coralMaterial = new Material(Shader.unlitShader, function () {
        gl.uniform3f(dominatingColor, 1, 0.5, 0.31);
    });

    var sunAngle = vec3.fromValues(0.5, 1, 0.25);
    // vec3.normalize(sunAngle, sunAngle);
    // gl.useProgram(defaultShader.program);
    // gl.uniform3f(defaultShader.uniform("sunlightAngle"), sunAngle[0], sunAngle[1], sunAngle[2]);
    // gl.uniform3f(defaultShader.uniform("ambientLight"), 0.2, 0.2, 0.2);
    // gl.uniform1f(defaultShader.uniform("sunlightIntensity"), 6);

    // TEMP : Default Shader Lighting
    gl.useProgram(Shader.defaultShader.program);
    gl.uniform3f(Shader.defaultShader.uniform("sunlightAngle"), sunAngle[0], sunAngle[1], sunAngle[2]);
    gl.uniform3f(Shader.defaultShader.uniform("ambientLight"), 0.2, 0.2, 0.2);
    gl.uniform1f(Shader.defaultShader.uniform("sunlightIntensity"), 6);

    // BLOCK MESH
    var cubeMesh = objToMesh(cubeModel);
    cubeMesh.createData();
    cubeMesh.createBuffer(gl, Engine.defaultVertexAttributes);
    cubeMesh.buffer(gl);

    var monsterMesh = objToMesh(monsterModel);
    monsterMesh.createData();
    monsterMesh.createBuffer(gl,  Engine.defaultVertexAttributes);
    monsterMesh.buffer(gl);

    // PLANE MESH
    var mesh = objToMesh(planeModel);
    mesh.createData();
    mesh.createBuffer(gl,  Engine.defaultVertexAttributes);
    mesh.buffer(gl);

    // MOKEY 
    var sphereMesh = objToMesh(sphereModel);
    sphereMesh.createData();
    sphereMesh.createBuffer(gl,  Engine.defaultVertexAttributes);
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
    // for (var x = -halfCount; x < halfCount; x++) {
    //     for (var z = -halfCount; z < halfCount; z++) {
    //         var gameObject = new GameObject();
    //         // gameObject.init(gl, cube2);
    //         gameObject.position[0] = x * spacing;
    //         gameObject.position[1] = 0;
    //         gameObject.position[2] = z * spacing;
    //         var renderer = new MeshRenderer(cubeMesh, defaultMaterial);
    //         gameObject.add(renderer);
    //     }
    // }

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

    // MONSTER GAME OBJECT
    var monster = new GameObject();
    var monsterRenderer = new MeshRenderer(monsterMesh, defaultMaterial);
    monster.add(monsterRenderer);


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
    // gl.useProgram(shaderProgram);


    // Example Lines
    var l1 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, 5), vec3.fromValues(1, 1, 0));
    var l2 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, -5), vec3.fromValues(0, 1, 0));
    var l3 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, -5), vec3.fromValues(0, 1, 1));
    var l4 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, 5), vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0));

    var camControllerObj = new GameObject();
    var camController = new SimpleCameraController();
    camControllerObj.add(camController);


    createGrid();

    // drawScene(gl, shaderProgram);

    window.requestAnimationFrame(draw);

    // canvas.onfocus = function () {
    //     canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    //     canvas.requestPointerLock();
    //     if (document.pointerLockElement === canvas ||
    //         document.mozPointerLockElement === canvas) {
    //         console.log('The pointer lock status is now locked');
    //     } else {
    //         console.log('The pointer lock status is now unlocked');
    //     }
    // }


    // setInterval(update, 1000 / 60);
}

function createDefaultShaders() {

}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // var uniformLocation = gl.getUniformLocation(shaderProgram, "dominatingColor");
    // gl.uniform4f(uniformLocation, 0.0, 1.0, 1.0, 1.0);

    // DRAW LINES
    gl.useProgram(lineShader);
    const fieldOfView = 60 * DEG2RAD;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.01;
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

    var gameObject = GameObject.gameObjectList[0];
    gameObject.update = function () {
        gameObject.position[1] = 3 + Math.cos(Time.elapsedTime * 4) * 2;
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

var previousTime = 0;
var elapsedTime = 0;

function draw(timestamp) {
    // console.log(timestamp);
    if (Time._startTime == undefined) {
        Time._startTime = timestamp;
        Time.deltaTime = 0;
        Time.elapsedTime = 0;
    } else {
        Time.deltaTime = (timestamp - Time._previousTime) / 1000;
        Time.elapsedTime = (timestamp - Time._startTime) / 1000;
    }
    Time._previousTime = timestamp;
    if (running) {
        window.requestAnimationFrame(draw);
        for (gameObject of GameObject.gameObjectList) {
            if (typeof gameObject.update === 'function') gameObject.update();
            for (component of gameObject.components) {
                if (typeof component.update === 'function') {
                    component.update();
                }
            }
        }
        update();
        Input.pressedThisFrame.clear();
        // drawScene();
    }
}

function update() {
    // console.log(elapsedTime);
    // var gameObject = GameObject.gameObjectList[0];
    // gameObject.position[1] = 3 + Math.cos(Time.elapsedTime / 250) * 2;
    // pollInput();


    drawScene();
}

function pollInput() {
    const walkSpeed = 5;
    const runSpeed = 10;
    const speed = Input.isKeyPressed('ShiftLeft') || Input.isKeyPressed('ShiftRight') ? runSpeed : walkSpeed;
    // console.log(Time.deltaTime);
    // console.log(cam.viewDirection);
    // console.log(cam.position);
    if (Input.isKeyPressed('KeyW')) {
        var scaled = vec3.clone(cam.forward);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
        drawScene();
    }
    if (Input.isKeyPressed('KeyS')) {
        var localBack = vec3.create();
        vec3.rotateY(localBack, cam.forward, VECTOR3_ZERO, 180 * DEG2RAD)
        var scaled = vec3.clone(localBack);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
        drawScene();
    }
    if (Input.isKeyPressed('KeyA')) {
        var localLeft = vec3.create();
        vec3.rotateY(localLeft, cam.forward, VECTOR3_ZERO, 90 * DEG2RAD)
        var scaled = vec3.clone(localLeft);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
        drawScene();
    }
    if (Input.isKeyPressed('KeyD')) {
        var localRight = vec3.create();
        vec3.rotateY(localRight, cam.forward, VECTOR3_ZERO, -90 * DEG2RAD);
        var scaled = vec3.clone(localRight);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
        drawScene();
    }
    if (Input.isKeyPressed('Space')) {
        var scaled = vec3.clone(VECTOR3_UP);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
        drawScene();
    }
    if (Input.isKeyPressed('ControlLeft')) {
        var scaled = vec3.clone(VECTOR3_DOWN);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
        drawScene();
    }
    if (Input.isKeyPressed('KeyQ')) {
        var rotationY = cam.rotation[1];
        rotationY += 90 * DEG2RAD * Time.deltaTime;
        cam.setRotation(cam.rotation[0], rotationY, cam.rotation[2]);
    }
    if (Input.isKeyPressed('KeyE')) {
        var rotationY = cam.rotation[1];
        rotationY -= 90 * DEG2RAD * Time.deltaTime;
        cam.setRotation(cam.rotation[0], rotationY, cam.rotation[2]);
    }
    if (Input.isKeyPressed('KeyZ')) {
        var rotationX = cam.rotation[0];
        rotationX += 90 * DEG2RAD * Time.deltaTime;
        cam.setRotation(rotationX, cam.rotation[1], 0);
    }
    if (Input.isKeyPressed('KeyX')) {
        var rotationX = cam.rotation[0];
        rotationX -= 90 * DEG2RAD * Time.deltaTime;
        cam.setRotation(rotationX, cam.rotation[1], 0);
    }
    if (Input.wasPressedThisFrame('KeyV')) {
        // console.log("W");
        cam.setRotation(cam.rotation[0], cam.rotation[1], 45);
    }
}

function initGLSettings() {
    gl.enable(gl.CULL_FACE)
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

function objToVoxelModel(obj) {
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
                    console.log(normalsRaw[values[2] - 1]);
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

window.addEventListener('load', main);