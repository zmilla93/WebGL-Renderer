function main() {
    // Get the WebGL Context from the canvas
    // This contains all of the fun WebGL functions and constants
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl", { antialias: false, depth: true });

    // Initalize all shaders
    var shaderProgram = initShaders(gl);

    // Draw the scene
    drawScene(gl, shaderProgram);
}



class Vertex {
    constructor(position, color) {
        this.position = position;
        this.color = color;
    }
}

class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Shape {
    vectors;
    indices;
    vertexCount;
}

const FLOAT32_SIZE = 4;

function drawScene(gl, shaderProgram) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    // gl.depthFunc(gl.LEQUAL);

    const v1 = new Vertex(new Vector(0, 0, 0), new Vector(0, 1, 0));
    const s1 = new Shape();



    const vertexData = [
        new Vertex(new Vector(-1.0, -1.0, +0.0), new Vector(+1.0, +0.0, +0.0)),
        new Vertex(new Vector(+0.0, +1.0, +0.0), new Vector(+1.0, +1.0, +0.0)),
        new Vertex(new Vector(+1.0, -1.0, +0.0), new Vector(+1.0, +0.0, +1.0)),
    ]

    const megaTriVerts = [
        new Vertex(new Vector(-1.0, -1.0, +0.0), new Vector(+1.0, +0.0, +0.0)),
        new Vertex(new Vector(+0.0, +1.0, +0.0), new Vector(+1.0, +1.0, +0.0)),
        new Vertex(new Vector(+1.0, -1.0, +0.0), new Vector(+1.0, +0.0, +1.0)),
        new Vertex(new Vector(-1.0, +1.0, +0.0), new Vector(+0.5, +0.0, +1.0)),
        new Vertex(new Vector(+1.0, +1.0, +0.0), new Vector(+0.0, +0.5, +0.25)),
    ]

    const positions = [
        // new Vertex(new Vector(-1.0, -1.0, +0.0), new Vector(+1.0, +0.0, +0.0)),
        // new Vertex(new Vector(+0.0, +1.0, +0.0), new Vector(+1.0, +0.0, +0.0)),
        // new Vertex(new Vector(+1.0, +1.0, +0.0), new Vector(+1.0, +0.0, +0.0)),

        +0.0, +1.0, +1.0,
        +1.0, +0.0, +0.0,
        +1.0, -1.0, +1.0,
        +0.0, +1.0, +0.0,
        -1.0, -1.0, +1.0,
        +0.0, +0.0, +1.0,

        // +0.0, +1.0, +1.0,
        // +1.0, +0.0, +0.0,
        // +1.0, -1.0, +1.0,
        // +0.0, +1.0, +0.0,
        // -1.0, -1.0, +1.0,
        // +0.0, +0.0, +1.0,
    ];

    const tri = new Shape();
    tri.vertices = shapeToFloatArray(vertexData);
    tri.indices = [0, 1, 2];
    tri.vertexCount = 3;

    const megaTri = new Shape();
    megaTri.vertices = shapeToFloatArray(megaTriVerts);
    megaTri.indices = [0, 1, 3, 1, 2, 4];
    megaTri.vertexCount = 6;

    var data = shapeToFloatArray(vertexData);

    var uniformLocation = gl.getUniformLocation(shaderProgram, "dominatingColor");
    gl.uniform4f(uniformLocation, 0.0, 1.0, 1.0, 1.0);

    // const buffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // gl.enableVertexAttribArray(0);

    // fixme : sizeof float32


    // const indices = [0, 1, 2];
    // const indexBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    // gl.drawArrays(gl.TRIANGLES, 0, 6);
    // gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

    // drawShape(gl, shaderProgram, tri);
    drawShape(gl, shaderProgram, megaTri);

}

function drawShape(gl, shaderProgram, shape) {
    const vertexBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    const positionLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    const colorLocation = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

    console.log(shape.vertices.length);
    gl.drawElements(gl.TRIANGLES, shape.vertexCount, gl.UNSIGNED_SHORT, 0);
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

// Compile all shaders
function initShaders(gl) {
    // Compile Shaders

    // var vertexShaderSource = document.getElementById("fragmentShaderSource").innerHTML;
    // var vertexShaderSource = document.getElementById("vertexShaderSource").contentWindow.document.body.childNodes[0].innerHTML;
    // alert(vertexShaderSource);
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create a shader program,
    // attach the shaders to the program,
    // then link and use the program.
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Failed to initialize shaders: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }
    gl.useProgram(shaderProgram);
    return shaderProgram;
}

// Compiles a single shader, returning the shader ID.
// gl - WebGL Context
// type - Shader Type (Vertex/Fragment)
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