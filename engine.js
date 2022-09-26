// This code depends on glmatrix, a js library for Vector3 and matrix math;
// https://glmatrix.net/
// Some aliases, for ease of use.
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const vec2 = glMatrix.vec2;
const FLOAT32_SIZE = Float32Array.BYTES_PER_ELEMENT;

// Multiplying a degree by this constant will give the radian equivalent.
const DEG2RAD = Math.PI / 180;

// Basic Vectors
const VECTOR3_UP = vec3.fromValues(0, 1, 0);
const VECTOR3_DOWN = vec3.fromValues(0, -1, 0);
const VECTOR3_FORWARD = vec3.fromValues(0, 0, -1);
const VECTOR3_BACK = vec3.fromValues(0, 0, 1);
const VECTOR3_LEFT = vec3.fromValues(-1, 0, 0);
const VECTOR3_RIGHT = vec3.fromValues(1, 0, 0);
const VECTOR3_ZERO = vec3.fromValues(0, 0, 0);

class Engine {
    shaders = {};
    static canvas;
    static gl;
    static defaultVertexAttributes;
    // constructor(canvas) {
    //     this.canvas = canvas;
    //     this.gl = canvas.getContext("webgl2", { antialias: true, depth: true });
    //     Input.addCanvas(canvas);
    // }
    static init(canvas) {
        Engine.canvas = canvas;
        const gl = canvas.getContext('webgl2', { antialias: true, depth: true })
        Engine.gl = gl;
        gl.enable(gl.CULL_FACE)
        gl.cullFace(gl.BACK);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(144 / 255, 212 / 255, 133 / 255, 1);
        Engine.setupDefaultShaders();
        Camera.main = new Camera();
        Mesh.initMeshes();
        Input.addKeyboardListeners();
        Input.addMouseListeners(canvas);
        window.requestAnimationFrame(Engine.internal_update);
    }
    static setupDefaultShaders() {
        const gl = Engine.gl;
        // Default Mesh Attributes
        const valuesPerVertex = 11;
        const stride = FLOAT32_SIZE * valuesPerVertex;
        const positionAttribute = new ShaderAttribute("vertexPosition", 3, gl.FLOAT, stride, 0);
        const uvAttribute = new ShaderAttribute("vertexUV1", 2, gl.FLOAT, stride, FLOAT32_SIZE * 3);
        const normalAttribute = new ShaderAttribute("vertexNormal", 3, gl.FLOAT, stride, FLOAT32_SIZE * 5);
        const colorAttribute = new ShaderAttribute("vertexColor", 3, gl.FLOAT, stride, FLOAT32_SIZE * 8);
        Engine.defaultVertexAttributes = [positionAttribute, uvAttribute, normalAttribute, colorAttribute];

        // Line Attributes
        const valuesPerLineVertex = 6;
        const lineStride = FLOAT32_SIZE * valuesPerLineVertex;
        const linePositionAttrib = new ShaderAttribute("vertexPosition", 3, gl.FLOAT, lineStride, 0);
        const lineColorAttrib = new ShaderAttribute("vertexColor", 3, gl.FLOAT, lineStride, FLOAT32_SIZE * 3);
        const lineAttributes = [linePositionAttrib, lineColorAttrib];

        // Default Shaders
        var attrib = Engine.defaultVertexAttributes;
        Shader.defaultShader = new Shader(gl, "Default Shader", litVertexSource, litFragmentSource, attrib);
        Shader.simpleLit = new Shader(gl, "Simple Lit", simpleLitVertexSource, simpleLitFragmentSource, attrib);
        Shader.lit = new Shader(gl, "Lit Shader", litVertexSource, litFragmentSource, attrib);
        Shader.unlitShader = new Shader(gl, "Unlit Shader", unlitVertexSource, unlitFragmentSource, attrib);
        Shader.lineShader = new Shader(gl, "Line Shader", lineVertexSource, lineFragmentSource, lineAttributes);

        // Functions that map uniform values to their respective glUniform calls
        // Function name must match the uniform name!
        Shader.unlitShader.uniformConverter.dominatingColor = Rendering.colorConverter;

        // Line VAO Setup
        // FIXME : Move this?
        Line.vao = gl.createVertexArray();
        Line.vertexBuffer = gl.createBuffer();
        gl.bindVertexArray(Line.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, Line.vertexBuffer);
        gl.enableVertexAttribArray(linePositionAttrib.location);
        gl.vertexAttribPointer(linePositionAttrib.location, 3, gl.FLOAT, false, 6 * FLOAT32_SIZE, 0);
        gl.enableVertexAttribArray(lineColorAttrib.location);
        gl.vertexAttribPointer(lineColorAttrib.location, 3, gl.FLOAT, false, 6 * FLOAT32_SIZE, 3 * FLOAT32_SIZE);
    }
    // The engine's internal update loop, called using requestAnimationFrame
    // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
    static internal_update(timestamp) {
        // Update Time.deltaTime
        if (Time._startTime == undefined) {
            Time._startTime = timestamp;
            Time.deltaTime = 0;
            Time.elapsedTime = 0;
        } else {
            Time.deltaTime = (timestamp - Time._previousTime) / 1000;
            Time.elapsedTime = (timestamp - Time._startTime) / 1000;
        }
        Time._previousTime = timestamp;
        // if (running) {
        // Update all game objects
        for (let gameObject of GameObject.gameObjectList) {
            if (typeof gameObject.update === 'function') gameObject.update();
            for (let component of gameObject.components) {
                if (typeof component.update === 'function') {
                    component.update();
                }
            }
        }
        // Render the scene
        Engine.render();
        // Clear single frame key presses
        Input.pressedThisFrame.clear();
        // Request a new animation frame
        window.requestAnimationFrame(Engine.internal_update);
        // }
    }
    static render() {
        // Clear color and depth buffers.    
        const gl = Engine.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Render Lines
        gl.useProgram(Shader.lineShader.program);
        const fullTransform = mat4.create();
        mat4.mul(fullTransform, Camera.main.getProjectionMatrix(), Camera.main.getWorldtoViewMatrix());
        gl.uniformMatrix4fv(Shader.lineShader.uniform("projectionMatrix"), false, fullTransform);
        gl.bindVertexArray(Line.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, Line.vertexBuffer);
        var lineData = Line.data;
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
                    gl.useProgram(material.shader.program);
                    shaderChanged = true;
                }
                // console.log(material.shader.uniformConverter);
                // console.log(Object.entries(material.shader.uniformConverter));
                for (let converter of Object.entries(material.shader.uniformConverter)) {
                    // console.log(converter);
                    if (typeof converter[1] === 'function') {
                        converter[1](material, converter[0]);
                    }
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
    }
}

class Time {
    static _startTime;      // Internal, first timestamp recorded.
    static _previousTime;   // Internal, timestamp of previous frame.
    static deltaTime;       // Seconds since the last frame was rendered.
    static elapsedTime;     // Seconds since engine began running.
}

class GameObject {
    position = vec3.create();
    rotation = vec3.create();
    scale = vec3.create();
    shape;
    components = [];
    static gameObjectList = [];
    constructor() {
        GameObject.gameObjectList.push(this);
    }
    add(component) {
        component.setParent(this);
        this.components.push(component);
        component.onAdd(this);
    }
    remove(component) {
        var index = this.components.indexOf(component);
        this.components.splice(index, 1);
        component.onRemove(this);
    }
    get matrix() {
        // FIXME : Make static
        const fieldOfView = 60 * DEG2RAD;
        const aspect = Engine.gl.canvas.clientWidth / Engine.gl.canvas.clientHeight;
        const zNear = 1;
        const zFar = 1000.0;

        // Create Translation Matrix
        const translationMatrix = mat4.create();
        mat4.translate(translationMatrix, translationMatrix, [this.position[0], this.position[1], this.position[2]]);

        // Create Rotation Matrix
        // FIXME : Rotation can be optimized
        const rotationMatrix = mat4.create();
        mat4.rotateX(rotationMatrix, rotationMatrix, this.rotation[0] * DEG2RAD);
        mat4.rotateY(rotationMatrix, rotationMatrix, this.rotation[1] * DEG2RAD);
        mat4.rotateZ(rotationMatrix, rotationMatrix, this.rotation[2] * DEG2RAD);

        // Create Projection Matrix
        // FIXME : Move to camera
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        // Create a transform matrix that holds all matrices combined.
        const transformMatrix = mat4.create();
        mat4.mul(transformMatrix, projectionMatrix, Camera.main.getWorldtoViewMatrix());
        mat4.mul(transformMatrix, transformMatrix, translationMatrix);
        mat4.mul(transformMatrix, transformMatrix, rotationMatrix);
        return transformMatrix;
    }
    destroy() {
        const index = GameObject.gameObjectList.indexOf(this);
        GameObject.gameObjectList.splice(index, 1);
    }
}

class Component {
    gameObject = null;
    update;
    setParent(parent) {
        this.gameObject = parent;
    }
    onAdd = function (gameObject) {
        // console.error("Component failed to implement onAdd function!");
    }
    get parent() {
        return this.gameObject;
    }
}

// Move to rendering?
// TODO : Extend component, move position/rotation to gameObject
class Camera {
    position;
    rotation;
    viewDirection;
    forward;
    worldToViewMatrix;

    // Camera Settings
    fieldOfView = 60 * DEG2RAD;
    aspect = Engine.gl.canvas.clientWidth / Engine.gl.canvas.clientHeight;
    nearPlane = 0.01;
    farPlane = 1000.0;
    projectionMatrix = mat4.create();
    // perspectiveMatrix = mat4.create();

    // Main Camera
    static main;

    constructor() {
        this.position = vec3.create();
        this.rotation = vec3.create();
        this.viewDirection = vec3.clone(VECTOR3_FORWARD);
        this.forward = vec3.clone(VECTOR3_FORWARD);
        this.calculateProjectionMatrix();
    }
    getWorldtoViewMatrix() {
        // this.calculateWorldtoViewMatrix();
        this.calculateWorldToViewMatrix();
        return this.worldToViewMatrix;
        // const matrix = mat4.create();
        // const lookVector = vec3.create();
        // vec3.add(lookVector, this.position, this.viewDirection);
        // mat4.lookAt(matrix, this.position, lookVector, VECTOR3_UP);
        // return matrix;
    }
    calculateProjectionMatrix() {
        // const projectionMatrix = mat4.create();
        // this.perspectiveMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.nearPlane, this.farPlane);
    }
    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    // OLD_calculateWorldtoViewMatrix() {
    //     this.worldToViewMatrix = mat4.create();
    //     const lookVector = vec3.create();
    //     vec3.add(lookVector, this.position, this.viewDirection);
    //     mat4.lookAt(this.worldToViewMatrix, this.position, lookVector, VECTOR3_UP);
    //     // return worldToViewMatrix;
    // }
    calculateWorldToViewMatrix() {
        this.worldToViewMatrix = mat4.create();
        var localViewDirection = vec3.clone(VECTOR3_FORWARD);
        this.forward = vec3.clone(VECTOR3_FORWARD);
        // console.log(localViewDirection);
        // console.log(this.rotation);
        // this.rotation[1] = 45 * DEG2RAD;
        this.rotation[2] = 0 * DEG2RAD;
        // this.rotation[0] = -45 * DEG2RAD;

        // vec3.rotateX(localViewDirection, localViewDirection, VECTOR3_ZERO, this.rotation[0]);
        vec3.rotateX(localViewDirection, localViewDirection, VECTOR3_ZERO, this.rotation[0]);
        // this.forward = vec3.clone(localViewDirection);
        vec3.rotateY(localViewDirection, localViewDirection, VECTOR3_ZERO, this.rotation[1]);
        vec3.rotateY(this.forward, this.forward, VECTOR3_ZERO, this.rotation[1]);
        this.viewDirection = localViewDirection;

        // vec3.rotateZ(localViewDirection, localViewDirection, VECTOR3_ZERO, this.rotation[2]);
        // vec3.rotateY(this.rotation[1]);

        const lookVector = vec3.create();
        vec3.add(lookVector, this.position, localViewDirection);

        var upVector = vec3.clone(VECTOR3_UP);
        vec3.rotateZ(upVector, upVector, VECTOR3_ZERO, this.rotation[2]);
        vec3.rotateX(upVector, upVector, VECTOR3_ZERO, this.rotation[0]);
        vec3.rotateY(upVector, upVector, VECTOR3_ZERO, this.rotation[1]);

        mat4.lookAt(this.worldToViewMatrix, this.position, lookVector, upVector);
    }
    setPosition(x, y, z) {
        this.position = vec3.fromValues(x, y, z);
    }
    setRotation(x, y, z) {
        this.rotation = vec3.fromValues(x, y, z);
    }
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