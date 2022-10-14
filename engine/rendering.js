// Static class for holding rendering utility stuff.
class Rendering {
    // Converter functions
    static floatConverter;
    static vector3Converter;
}

class Camera {
    // FIXME : Extend component, move position/rotation to gameObject
    position;
    rotation;
    viewDirection;
    forward;
    worldToViewMatrix;
    // Mutual Settings
    nearPlane = 0.01;
    farPlane = 1000;
    // Perspective Settings
    fieldOfView = 80 * DEG2RAD;
    aspectRatio = Engine.gl.canvas.clientWidth / Engine.gl.canvas.clientHeight;
    projectionMatrix = mat4.create();
    // Orthographic Settings
    _ortho = false;
    // Camera.main is used to render the scene
    static main;
    constructor() {
        this.position = vec3.create();
        this.rotation = vec3.create();
        this.viewDirection = vec3.clone(VECTOR3_FORWARD);
        this.forward = vec3.clone(VECTOR3_FORWARD);
        this.calculateProjectionMatrix();
    }
    // Getters/Setters
    set ortho(state) {
        this._ortho = state;
        this.calculateProjectionMatrix();
    }
    get ortho() {
        return this._ortho;
    }
    getWorldtoViewMatrix() {
        // FIXME : Lazy calculation
        this.calculateWorldToViewMatrix();
        return this.worldToViewMatrix;
    }
    calculateProjectionMatrix() {
        // const projectionMatrix = mat4.create();
        // this.perspectiveMatrix = mat4.create();
        if (this._ortho) {
            mat4.ortho(this.projectionMatrix, -5, 5, -5, 5, this.nearPlane, this.farPlane);
        } else {
            mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspectRatio, this.nearPlane, this.farPlane);
        }
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

//  Holds data for weblGL vertexAttribPointer
//  https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
class ShaderAttribute {
    // Location is set automatically when it is added to a shader object,
    // since location is based on the shader program.
    location;
    constructor(name, valueCount, type, stride, offset) {
        this.name = name;
        this.valueCount = valueCount;
        this.type = type;
        this.stride = stride;
        this.offset = offset;
    }
}

// Wrapper for a gl shader program
class Shader {
    gl;
    name;
    program;
    attributes;
    uniformConverter = {};
    uniformMap = new Map();
    // Default Shaders
    // static defaultShader;
    // static litShader;
    // static unlitShader;

    // static materialMap = new Map();
    // gl - weblGL Context
    // name - (string) ID
    // vertexShaderSource, fragmentShaderSource - (string) GLSL shader code
    // Attributes - Array of ShaderAttributes
    constructor(gl, name, vertexShaderSource, fragmentShaderSource, attributes) {
        this.gl = gl;
        this.name = name;
        this.program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(this.program);
        this.attributes = attributes;
        for (let attribute of attributes) {
            let location = gl.getAttribLocation(this.program, attribute.name);
            if (location < 0) {
                console.warn("Attribute location '" + attribute.name + "' not found when creating shader '" + this.name + "'.");
                continue;
            }
            attribute.location = location;
        }
    }
    // A chacheing version of gl.getUniformLocation().
    uniform(uniformName) {
        if (this.uniformMap.has(uniformName))
            return this.uniformMap.get(uniformName);
        const uniformLocation = this.gl.getUniformLocation(this.program, uniformName);
        if (uniformLocation != null) {
            this.uniformMap.set(uniformName, uniformLocation);
            return uniformLocation;
        }
        console.error("Uniform '" + uniformName + "' not found in shader '" + this.name + "'.");
    }
}

class Material {
    shader;
    applyUniforms;
    uniforms = {};
    // renderers = [];
    static materialMap = new Map();
    // Shader - Shader Class
    // applyUniforms - function, called once before rendering all objects that use this material
    constructor(shader) {
        this.shader = shader;
        this.renderers = [];
        this.registerMaterial(this);
    }
    registerMaterial(material) {
        var shaderEntry;
        if (Material.materialMap.has(material.shader.name)) {
            shaderEntry = Material.materialMap.get(material.shader.name);
        } else {
            shaderEntry = [];
        }
        shaderEntry.push(material);
        Material.materialMap.set(material.shader.name, shaderEntry);
        // console.log(Material.materialMap);
    }
    static getMaterial(material) {
        const shaderGroup = Material.materialMap.get(material.shader.name);
        const mat = shaderGroup[shaderGroup.indexOf(material)];
        return mat;
    }
    // FIXME : get material seems unnessecary??
    static registerRenderer(material, renderer) {
        const mat = Material.getMaterial(material);
        mat.renderers.push(renderer);
    }
}

/**
 * A mesh holds all the data for a 3D model.
 * Only one mesh should exist per model (ie one Cube mesh can be used to render many cubes).
 * If a mesh is updated, call buffer() to send data to webgl.
 * Use MeshRenderer to actually render the model.
 */
class Mesh {
    // webGL Vertex Array Object
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLVertexArrayObject
    vao;
    // Mesh Data
    vertices = [];
    triangles = [];
    uvs = [];
    normals = [];
    colors = [];
    // WebGL buffers
    hasBuffer = false;
    vertexBuffer = null;
    indexBuffer = null;
    triCount = 0;
    // Interleaved data that will get sent to WebGL
    // Call createData to create this from mesh data.
    data = null;
    // Settings
    vertexCount = 0;
    useColors = false;
    // Default Meshes
    static cube;
    static monster;

    static initMeshes() {
        Mesh.cube = objToMesh(cubeModel);
        Mesh.monster = objToMesh(monsterModel);
    }

    // Sends data to WebGL.
    // This should be called any time the mesh data changes.
    buffer() {
        this.createData();
        const gl = Engine.gl;
        // FIXME : Remove this check for performance?
        if (!this.hasBuffer) {
            console.error("Attempted to buffer data to a mesh renderer with no buffer!");
            return;
        }
        if (this.vertices.length > 65535) {
            console.error("Mesh has more than WebGL limit of 65535 vertices!\nThe object will still be rendered, but will appear incorrectly.");
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), gl.STATIC_DRAW);
    }

    // Creates two new webGL buffers, one for vertex data and one for triangle data.
    // Will enable an array of vertex attributes, then store everything in a Vertex Array Object.
    createBuffer(vertexAttributes) {
        const gl = Engine.gl;
        if (vertexAttributes == null) vertexAttributes = Engine.defaultVertexAttributes;
        if (this.hasBuffer) {
            // FIXME : Add name to error messages once this object has more data
            console.error("Mesh renderer requested a buffer when one already exists!");
            return;
        }
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        for (const attribute of vertexAttributes) {
            if (attribute.location < 0) {
                console.warn("Unused shader attribute: " + attribute.name);
                continue;
            }
            gl.enableVertexAttribArray(attribute.location);
            gl.vertexAttribPointer(attribute.location, attribute.valueCount, attribute.type, false, attribute.stride, attribute.offset);
        }
        this.hasBuffer = true;
    }
    deleteBuffer(gl) {
        if (!this.hasBuffer) {
            // FIXME : Add name to error messages once this object has more data
            console.error("Attempted to delete mesh renderer buffer when none exists!");
            return;
        }
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
        this.hasBuffer = false;
    }

    createData() {
        const values = 3;
        const stride = 11;
        this.triCount = this.triangles.length;
        this.data = new Float32Array(Float32Array.BYTES_PER_ELEMENT * this.vertices.length * values);
        for (let i = 0; i < this.vertices.length; i++) {
            this.data[i * stride] = this.vertices[i][0];
            this.data[i * stride + 1] = this.vertices[i][1];
            this.data[i * stride + 2] = this.vertices[i][2];
            this.data[i * stride + 3] = this.uvs[i][0];
            this.data[i * stride + 4] = this.uvs[i][1];
            this.data[i * stride + 5] = this.normals[i][0];
            this.data[i * stride + 6] = this.normals[i][1];
            this.data[i * stride + 7] = this.normals[i][2];
            // this.data[i * stride + 6] = this.normals[i][0];
            // this.data[i * stride + 7] = this.normals[i][1];
            // this.data[i * stride + 8] = this.normals[i][2]; 
            // Color
            // FIXME : colors?
            if (this.useColors) {
                this.data[i * stride + 8] = this.colors[i][0];
                this.data[i * stride + 9] = this.colors[i][1];
                this.data[i * stride + 10] = this.colors[i][2];
            } else {
                this.data[i * stride + 8] = 1;
                this.data[i * stride + 9] = 1;
                this.data[i * stride + 10] = 1;
            }
        }
    }
    // Frees the mesh data from RAM. This can be called after the data has been buffered to openGL to free up some memory.
    freeData() {
        this.vertices = [];
        this.normals = []
        this.uvs = [];
        this.colors = [];
        this.triangles = [];
    }
}

// function meshToData(mesh) {
//     const data = data = new Float32Array(mesh.vertices.length * 3 * 2);
// }

/**
 * Renders a mesh for a given game object.
 */
class MeshRenderer extends Component {
    material;
    gameObject;
    constructor(mesh, material) {
        super();
        this.mesh = mesh;
        this.setMaterial(material);
    }
    applyPerObjectUniforms = function () {
        if (this.gameObject == null) return;
        Engine.gl.uniformMatrix4fv(this.material.shader.uniform("transformMatrix"), false, this.gameObject.matrix);
    };
    render(gl) {
        if (this.gameObject == null) return;
        gl.bindVertexArray(this.mesh.vao);
        gl.drawElements(gl.TRIANGLES, this.mesh.triCount, gl.UNSIGNED_SHORT, 0);
    }
    onAdd = function (gameObject) {

    }
    onRemove = function (gameObject) {

    }
    setMaterial(material) {
        // If this renderer already has a material, unregister this renderer.
        if (this.material != null) {
            Material.unregisterRenderer(this.material, this);
        }
        this.material = material;
        // If the new material isn't null, register this renderer.
        if (this.material == null) return;
        Material.registerRenderer(this.material, this);
    }
}

class Light extends Component {

}

// Handles basic line rendering
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

// Converter functions apply a uniform given a material and a uniform name.
// WebGL will already be using the material's shader when these are called.

Rendering.floatConverter = function (material, uniformName) {
    const value = material.uniforms[uniformName] == null ? 1 : material.uniforms[uniformName];
    Engine.gl.uniform1f(material.shader.uniform(uniformName), value);
}

Rendering.vector3Converter = function (material, uniformName) {
    const vector = material.uniforms[uniformName] == null ? [1, 1, 1] : material.uniforms[uniformName];
    Engine.gl.uniform3f(material.shader.uniform(uniformName), vector[0], vector[1], vector[2]);
}