// This code depends on glmatrix, a js library for Vector3 and matrix math;
// https://glmatrix.net/
// Some aliases, for ease of use.
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

// Multiplying a degree by this constant will give the radian equivalent.
const DEG2RAD = Math.PI / 180;

const UP_VECTOR = vec3.create();
UP_VECTOR.y = 1;

class Vertex {
    constructor(position, color) {
        this.position = position;
        this.color = color;
    }
}

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Shape {
    vertices;
    indices;
    vertexCount;
    constructor(vertexData, indices) {
        this.vertices = shapeToFloatArray(vertexData);
        this.vertexCount = indices.length;
        this.indices = indices;
    }
}

class Camera {
    position;
    viewDirection;
    constructor() {
        this.position = vec3.create();
        this.viewDirection = vec3.create();
        this.viewDirection.z = -1;
    }
    getWorldtoViewMatrix() {
        const matrix = mat4.create();
        // const upVector = vec3.create();
        // upVector.y = 1;
        const lookVector = vec3.create();
        vec3.add(lookVector, this.position, this.viewDirection);
        mat4.lookAt(matrix, this.position, lookVector, UP_VECTOR);
        return matrix;
    }
}

function shapeToFloatArray(vertexData) {
    const entriesPerVertex = 6;
    const entryCount = vertexData.length * entriesPerVertex;
    const array = new Float32Array(entryCount);
    for (var i = 0; i < vertexData.length; i++) {
        const index = i * entriesPerVertex;
        array[index] = vertexData[i].position.x;
        array[index + 1] = vertexData[i].position.y;
        array[index + 2] = vertexData[i].position.z;
        array[index + 3] = vertexData[i].color.x;
        array[index + 4] = vertexData[i].color.y;
        array[index + 5] = vertexData[i].color.z;
    }
    return array;
}