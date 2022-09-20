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
const UP_VECTOR = vec3.fromValues(0, 1, 0);
const DOWN_VECTOR = vec3.fromValues(0, 1, 0);
const FORWARD_VECTOR = vec3.fromValues(0, 0, -1);
const BACK_VECTOR = vec3.fromValues(0, 0, 1);
const LEFT_VECTOR = vec3.fromValues(-1, 0, 0);
const RIGHT_VECTOR = vec3.fromValues(1, 0, 0);
const ZERO_VECTOR = vec3.fromValues(0, 0, 0);

class Engine {

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
    // constructor(gameObject) {
    //     this.gameObject = gameObject;
    // }
    setParent(parent) {
        this.gameObject = parent;
    }
    onAdd = function (gameObject) {
        console.error("Component failed to implement onAdd function!");
    }
    get parent() {
        return this.gameObject;
    }
}

class Camera {
    position;
    viewDirection;
    constructor() {
        this.position = vec3.create();
        this.viewDirection = vec3.create();
        this.viewDirection[2] = -1;
    }
    getWorldtoViewMatrix() {
        const matrix = mat4.create();
        const lookVector = vec3.create();
        vec3.add(lookVector, this.position, this.viewDirection);
        mat4.lookAt(matrix, this.position, lookVector, UP_VECTOR);
        return matrix;
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