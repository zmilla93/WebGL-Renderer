var rotationX = 0;
var rotationY = 0;
var camRotationY = 0;

var gl;
// var shaderProgram;
var lineShader;
// var cam;
var cameraDeltaX = 0;
var running = true;
var testChunk;

var meshRenderer;
// var lineVAO;
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
    Engine.init(canvas);
    gl = canvas.getContext("webgl2", { antialias: true, depth: true });

    // Input.addKeyboardListeners();
    // Input.addMouseListeners(canvas);

    // cam = new Camera();
    // Camera.main = cam;
    // cam = Camera.main;
    Camera.main.position[2] = 3;
    Camera.main.position[1] = 1.5;

    initGLSettings();
    // shaderProgram = createShaderProgram(gl, simpleLitVertexSource, simpleLitFragmentSource);
    const testShaderProgram = createShaderProgram(gl, simpleLitVertexSource, simpleLitFragmentSource);

    // Line Shader
    lineShader = createShaderProgram(gl, lineVertexSource, lineFragmentSource);
    // if (shaderProgram == null) return;
    if (lineShader == null) return;
    // gl.useProgram(shaderProgram);

    // gl.uniform3f(Shader.unlitShader.uniform("dominatingColor"), 1, 0, 0);    
    // Engine.gl.useProgram(Shader.defaultShader.program);
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

    var simpleMat = new Material(Shader.simpleLit);

    var sunAngle = vec3.fromValues(0.5, 1, 0.25);

    // TEMP : Default Shader Lighting
    gl.useProgram(Shader.defaultShader.program);
    const l = 0.5;
    gl.uniform3f(Shader.defaultShader.uniform("ambientLight"), l, l, l);
    gl.uniform3f(Shader.defaultShader.uniform("sunlightAngle"), sunAngle[0], sunAngle[1], sunAngle[2]);
    gl.uniform3f(Shader.defaultShader.uniform("ambientLight"), 0.2, 0.2, 0.2);
    gl.uniform1f(Shader.defaultShader.uniform("sunlightIntensity"), 6);

    gl.useProgram(Shader.simpleLit.program);
    const a = 0.2;
    gl.uniform3f(Shader.simpleLit.uniform("sunlightColor"), .8, .8, .8);
    // gl.uniform3f(Shader.simpleLit.uniform("sunlightColor"), 0.1, 0.1, 0.1);
    gl.uniform3f(Shader.simpleLit.uniform("ambientLight"), 0.2, 0.2, 0.2);
    gl.uniform3f(Shader.simpleLit.uniform("sunlightAngle"), sunAngle[0], sunAngle[1], sunAngle[2]);
    gl.uniform1f(Shader.simpleLit.uniform("sunlightIntensity"), 0.8);

    var mesh = objToMesh(planeModel);

    // MOKEY 
    var sphereMesh = objToMesh(sphereModel);

    // sphereMesh.createData();
    // sphereMesh.createBuffer(gl,  Engine.defaultVertexAttributes);
    // sphereMesh.buffer(gl);
    var sphere = new GameObject();
    sphere.position[0] = 10;
    sphere.position[1] = 10;
    sphere.position[2] = 10;
    sphere.rotation[0] = 90;
    sphereRenderer = new MeshRenderer(sphereMesh, defaultMaterial);
    sphere.add(sphereRenderer);
    var gameObject = GameObject.gameObjectList[0];
    gameObject.update = function () {
        gameObject.position[1] = 3 + Math.cos(Time.elapsedTime * 4) * 2;
    }

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
    var cubeRenderer = new MeshRenderer(Mesh.cube, coralMaterial);
    cube1.add(cubeRenderer);
    cube1.position[1] = 5;

    var cube2 = new GameObject();
    var cubeRenderer2 = new MeshRenderer(Mesh.cube, unlitMaterial);
    cube2.add(cubeRenderer2);
    cube2.position[0] = 1;
    cube2.position[1] = 5;

    // MONSTER GAME OBJECT
    var monster = new GameObject();
    var monsterRenderer = new MeshRenderer(Mesh.monster, defaultMaterial);
    monster.add(monsterRenderer);

    var monster2 = new GameObject();
    monster2.position[0] = 2;
    monster2.add(new MeshRenderer(Mesh.monster, simpleMat));


    // Example Lines
    var l1 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, 5), vec3.fromValues(1, 1, 0));
    var l2 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, -5), vec3.fromValues(0, 1, 0));
    var l3 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(5, 5, -5), vec3.fromValues(0, 1, 1));
    var l4 = new Line(vec3.fromValues(0, 0, 0), vec3.fromValues(-5, 5, 5), vec3.fromValues(0, 0, 1), vec3.fromValues(1, 0, 0));

    var camControllerObj = new GameObject();
    var camController = new SimpleCameraController();
    camControllerObj.add(camController)

    createGrid();

    // window.requestAnimationFrame(draw);
}


// function drawScene() {
//     var cam = Camera.main;
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     // var uniformLocation = gl.getUniformLocation(shaderProgram, "dominatingColor");
//     // gl.uniform4f(uniformLocation, 0.0, 1.0, 1.0, 1.0);

//     // DRAW LINES
//     gl.useProgram(Shader.lineShader.program);
//     const fullTransform = mat4.create();
//     mat4.mul(fullTransform, cam.getProjectionMatrix(), cam.getWorldtoViewMatrix());
//     gl.uniformMatrix4fv(Shader.lineShader.uniform("projectionMatrix"), false, fullTransform);
//     gl.bindVertexArray(Line.vao);
//     gl.bindBuffer(gl.ARRAY_BUFFER, Line.vertexBuffer);
//     var lineData = Line.data;
//     gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);
//     gl.drawArrays(gl.LINES, 0, Line.lineList.length * 2);

//     // Loop through the material map.
//     // This is a map where shaderName = [Array of materials using that shader]
//     Material.materialMap.forEach((materialGroup) => {
//         var shaderChanged = false;
//         materialGroup.forEach((material) => {
//             // Set the shader using the first element in the array,
//             // since by design all elements in the array must use the same shader.
//             if (!shaderChanged) {
//                 // console.log("CHANGE SHADER:");
//                 // console.log(material.shader);
//                 gl.useProgram(material.shader.program);
//                 shaderChanged = true;
//             }
//             if (typeof material.applyPerMaterialUniforms === 'function')
//                 material.applyPerMaterialUniforms();
//             // Loop through all renderers that use this material and render them.
//             material.renderers.forEach((renderer) => {
//                 renderer.applyPerObjectUniforms();
//                 renderer.render(gl);
//             });
//         });
//     });
// }

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

function pollInput() {
    const walkSpeed = 5;
    const runSpeed = 10;
    const speed = Input.isKeyPressed('ShiftLeft') || Input.isKeyPressed('ShiftRight') ? runSpeed : walkSpeed;
    // console.log(Time.deltaTime);
    // console.log(cam.viewDirection);
    // console.log(cam.position);
    var cam = Camera.main;
    if (Input.isKeyPressed('KeyW')) {
        var scaled = vec3.clone(cam.forward);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
    }
    if (Input.isKeyPressed('KeyS')) {
        var localBack = vec3.create();
        vec3.rotateY(localBack, cam.forward, VECTOR3_ZERO, 180 * DEG2RAD)
        var scaled = vec3.clone(localBack);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
    }
    if (Input.isKeyPressed('KeyA')) {
        var localLeft = vec3.create();
        vec3.rotateY(localLeft, cam.forward, VECTOR3_ZERO, 90 * DEG2RAD)
        var scaled = vec3.clone(localLeft);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
    }
    if (Input.isKeyPressed('KeyD')) {
        var localRight = vec3.create();
        vec3.rotateY(localRight, cam.forward, VECTOR3_ZERO, -90 * DEG2RAD);
        var scaled = vec3.clone(localRight);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
    }
    if (Input.isKeyPressed('Space')) {
        var scaled = vec3.clone(VECTOR3_UP);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
    }
    if (Input.isKeyPressed('ControlLeft')) {
        var scaled = vec3.clone(VECTOR3_DOWN);
        vec3.scale(scaled, scaled, Time.deltaTime * speed);
        vec3.add(cam.position, cam.position, scaled);
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

window.addEventListener('load', main);