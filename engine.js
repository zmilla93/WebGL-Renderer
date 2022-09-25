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
    static defaultVertexAttributes;
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2", { antialias: true, depth: true });
        Input.addCanvas(canvas);
    }
    static setupDefaultShaders() {
        // Default Mesh Attributes
        const valuesPerVertex = 11;
        const stride = FLOAT32_SIZE * valuesPerVertex;
        const positionAttribute = new ShaderAttribute("vertexPosition", 3, gl.FLOAT, stride, 0);
        const uvAttribute = new ShaderAttribute("vertexUV1", 2, gl.FLOAT, stride, FLOAT32_SIZE * 3);
        const normalAttribute = new ShaderAttribute("vertexNormal", 3, gl.FLOAT, stride, FLOAT32_SIZE * 5);
        const colorAttribute = new ShaderAttribute("vertexColor", 3, gl.FLOAT, stride, FLOAT32_SIZE * 8);
        Engine.defaultVertexAttributes = [positionAttribute, uvAttribute, normalAttribute, colorAttribute];

        // Default Shaders
        Shader.defaultShader = new Shader(gl, "Default Shader",
            litVertexSource, litFragmentSource, Engine.defaultVertexAttributes);
        // var defaultShader2 = new Shader(gl, "Default Shader", litVertexSource, litFragmentSource, attributes);
        // var testShader = new Shader(gl, "Test Shader", litVertexSource, litFragmentSource, attributes);
        Shader.unlitShader = new Shader(gl, "Unlit Shader",
            unlitVertexSource, unlitFragmentSource, Engine.defaultVertexAttributes);
        // gl.uniform3f(unlitShader.uniform("dominatingColor"), 1, 0, 0);
        // var defaultMaterial = new Material(this.shaders.defaultShader);

        // const dominatingColor = unlitShader.uniform("dominatingColor");
        // var unlitMaterial = new Material(unlitShader, function () {
        //     gl.uniform3f(dominatingColor, 0, 0.5, 0.31);
        // });
        // var greenMaterial = new Material(unlitShader, function () {
        //     gl.uniform3f(dominatingColor, 0, 1, 0);
        // });
        // var coralMaterial = new Material(unlitShader, function () {
        //     gl.uniform3f(dominatingColor, 1, 0.5, 0.31);
        // });
    }

    static render() {

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
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
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
        mat4.mul(transformMatrix, projectionMatrix, cam.getWorldtoViewMatrix());
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
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    zNear = 0.01;
    zFar = 1000.0;
    projectionMatrix = mat4.create();
    perspectiveMatrix = mat4.create();

    // Main Camera
    static main;

    constructor() {
        this.position = vec3.create();
        this.rotation = vec3.create();
        this.viewDirection = vec3.clone(VECTOR3_FORWARD);
        this.forward = vec3.clone(VECTOR3_FORWARD);
    }
    getWorldtoViewMatrix() {
        // this.calculateWorldtoViewMatrix();
        this.newCalc();
        return this.worldToViewMatrix;
        // const matrix = mat4.create();
        // const lookVector = vec3.create();
        // vec3.add(lookVector, this.position, this.viewDirection);
        // mat4.lookAt(matrix, this.position, lookVector, VECTOR3_UP);
        // return matrix;
    }
    calculateProjectionMatrix() {
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    }
    getPerspectiveMatrix() {
        return this.perspectiveMatrix;
    }

    OLD_calculateWorldtoViewMatrix() {
        this.worldToViewMatrix = mat4.create();
        const lookVector = vec3.create();
        vec3.add(lookVector, this.position, this.viewDirection);
        mat4.lookAt(this.worldToViewMatrix, this.position, lookVector, VECTOR3_UP);
        // return worldToViewMatrix;
    }
    newCalc() {
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

class Line {
    static lineList = [];
    constructor(v1, v2, color1, color2) {
        this.v1 = v1;
        this.v2 = v2;
        this.color1 = color1;
        this.color2 = color2 == null ? color1 : color2;
        Line.lineList.push(this);
    }
    destroy() {
        Line.lineList.splice(Line.lineList.indexOf(this), 1);
    }
    static get data() {
        const stride = 12;
        const data = new Float32Array(stride * Line.lineList.length);
        for (let i = 0; i < Line.lineList.length; i++) {
            var line = Line.lineList[i]
            data[i * stride] = line.v1[0];
            data[i * stride + 1] = line.v1[1];
            data[i * stride + 2] = line.v1[2];
            data[i * stride + 3] = line.color1[0];
            data[i * stride + 4] = line.color1[1];
            data[i * stride + 5] = line.color1[2];
            data[i * stride + 6] = line.v2[0];
            data[i * stride + 7] = line.v2[1];
            data[i * stride + 8] = line.v2[2];
            data[i * stride + 9] = line.color2[0];
            data[i * stride + 10] = line.color2[1];
            data[i * stride + 11] = line.color2[2];
        }
        return data;
    }
}