// This code depends on glmatrix, a js library for linear algebra.
// https://glmatrix.net/
// Some aliases, for ease of use.
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;
const FLOAT32_SIZE = Float32Array.BYTES_PER_ELEMENT;

// Conversion constants for degrees and radians.
// 180 * DEG2RAD = ~3.14;
// 3.14 * RAD2DEG = ~180;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 1 / (Math.PI / 180);

// Basic Vectors
const VECTOR3_UP = vec3.fromValues(0, 1, 0);
const VECTOR3_DOWN = vec3.fromValues(0, -1, 0);
const VECTOR3_FORWARD = vec3.fromValues(0, 0, -1);
const VECTOR3_BACK = vec3.fromValues(0, 0, 1);
const VECTOR3_LEFT = vec3.fromValues(-1, 0, 0);
const VECTOR3_RIGHT = vec3.fromValues(1, 0, 0);
const VECTOR3_ZERO = vec3.fromValues(0, 0, 0);
const QUATERNION_IDENTITY = quat.create();

const Direction = Object.freeze({
    Up: Symbol("Up"),
    Down: Symbol("Down"),
    Forward: Symbol("Forward"),
    Right: Symbol("Right"),
    Back: Symbol("Back"),
    Left: Symbol("Left"),
    Unknown: Symbol("Unknown"),
});

function invertDirection(direction) {
    switch (direction) {
        case Direction.Up:
            return Direction.Down;
        case Direction.Down:
            return Direction.Up;
        case Direction.Forward:
            return Direction.Back;
        case Direction.Right:
            return Direction.Left;
        case Direction.Back:
            return Direction.Forward;
        case Direction.Left:
            return Direction.Right;
        default:
            console.error("Bad direction (invert): " + direction);
            return VECTOR3_ZERO;
    }
}

function directionToVector(direction) {
    switch (direction) {
        case Direction.Up:
            return VECTOR3_UP;
        case Direction.Down:
            return VECTOR3_DOWN;
        case Direction.Forward:
            return VECTOR3_FORWARD;
        case Direction.Right:
            return VECTOR3_RIGHT;
        case Direction.Back:
            return VECTOR3_BACK;
        case Direction.Left:
            return VECTOR3_LEFT;
        default:
            console.error("Bad direction: " + direction);
            return VECTOR3_ZERO;
    }
}

class Engine {
    shaders = {};
    static canvas;
    static gl;
    static defaultVertexAttributes;
    static maxActionsPerFrame = 1;
    static actionQueue = [];
    static init(canvas) {
        Engine.canvas = canvas;
        const gl = canvas.getContext('webgl2', { antialias: true, depth: true })
        Engine.gl = gl;
        gl.enable(gl.CULL_FACE)
        gl.cullFace(gl.BACK);
        gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.LEQUAL);
        // gl.depthMask(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.enable(gl.BLEND);
        // gl.clearColor(144 / 255, 212 / 255, 133 / 255, 1);
        gl.clearColor(106 / 255, 204 / 255, 181 / 255, 1);
        Engine.setupDefaultShaders();
        Camera.main = new Camera();
        Mesh.initMeshes();
        VoxelMesh.initMeshes();
        Input.addKeyboardListeners();
        Input.addMouseListeners(canvas);
        window.requestAnimationFrame(Engine.internal_update);
    }
    static updateCamera() {
        const color = Camera.main.color;
        Engine.gl.clearColor(color[0], color[1], color[2], 1);
    }
    static setupDefaultShaders() {
        const gl = Engine.gl;
        gl.enable(gl.DEPTH_TEST);
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
        Shader.defaultShader = new Shader("Default Shader", litVertexSource, litFragmentSource);
        Shader.simpleLit = new Shader("Simple Lit", simpleLitVertexSource, simpleLitFragmentSource);
        Shader.lit = new Shader("Lit Shader", litVertexSource, litFragmentSource);
        Shader.unlitShader = new Shader("Unlit Shader", unlitVertexSource, unlitFragmentSource);
        Shader.lineShader = new Shader("Line Shader", lineVertexSource, lineFragmentSource, lineAttributes);

        // Functions that map uniform values to their respective glUniform calls
        // Function name must match the uniform name!

        // Uniform Converters
        Shader.simpleLit.uniformConverter.viewDistance = Rendering.floatConverter;
        // Shader.simpleLit.uniformDefault.viewDistance = 400;
        Shader.simpleLit.uniformConverter.sunlightIntensity = Rendering.floatConverter;
        Shader.simpleLit.uniformConverter.sunlightColor = Rendering.vector3Converter;
        Shader.simpleLit.uniformConverter.sunlightAngle = Rendering.vector3Converter;
        Shader.simpleLit.uniformConverter.ambientLight = Rendering.vector3Converter;
        Shader.simpleLit.uniformConverter.skyColor = Rendering.vector3Converter;
        Shader.unlitShader.uniformConverter.dominatingColor = Rendering.vector3Converter;

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
        // Update all game objects
        if (Engine.actionQueue.length > 0) {
            for (var i = 0; i < Engine.maxActionsPerFrame; i++) {
                const action = Engine.actionQueue.shift();
                action();
                if (Engine.actionQueue.length == 0) break;
            }

        }
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

                // Apply per material uniforms
                if (material.texture != null) {
                    // FIXME : Texture.texture is really bad!! LOL
                    Engine.gl.bindTexture(gl.TEXTURE_2D, material.texture.texture);
                } else {
                    Engine.gl.bindTexture(gl.TEXTURE_2D, null);
                }
                for (let converter of Object.entries(material.shader.uniformConverter)) {
                    if (typeof converter[1] === 'function') {
                        converter[1](material, converter[0]);
                    }
                }
                // Loop through all renderers that use this material and render them.
                material.renderers.forEach((renderer) => {
                    renderer.applyPerObjectUniforms();
                    renderer.render(gl);
                });
            });
        });
    }
    // Queues a function to be run at a later time. One action from the queue is run per frame.
    static queueAction(action) {
        if (typeof action === "function") Engine.actionQueue.push(action);
        else console.error("Attempted to queue something that isn't a function!");
    }
}

// FIXME:
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

class Time {
    static _startTime;      // Internal, first timestamp recorded.
    static _previousTime;   // Internal, timestamp of previous frame.
    static deltaTime;       // Seconds since the last frame was rendered.
    static elapsedTime;     // Seconds since engine began running.
}

class GameObject {
    position = vec3.create();
    rotation = vec3.create();
    _rotationQuaternion = quat.create();
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
    setRotation(x, y, z) {
        quat.fromEuler(this._rotationQuaternion, x, y, z);
    }
    getRotationMatrix() {
        var rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, this._rotationQuaternion);
        return rotationMatrix;
    }
    get matrix() {
        // Create Translation Matrix
        const translationMatrix = mat4.create();
        mat4.translate(translationMatrix, translationMatrix, [this.position[0], this.position[1], this.position[2]]);
        // Create Rotation Matrix
        const rotationMatrix = this.getRotationMatrix();
        // Create a transform matrix that holds all matrices combined.
        const transformMatrix = mat4.create();
        mat4.mul(transformMatrix, Camera.main.getProjectionMatrix(), Camera.main.getWorldtoViewMatrix());
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

function lerp(a, b, t) {
    // return (1 - t) * a + t * b;
    return a + t * (b - a);
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