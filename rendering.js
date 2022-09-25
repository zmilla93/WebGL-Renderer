
//  Holds data for weblGL vertexAttribPointer
//  https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
class ShaderAttribute {
    // Location is set when it is added to a shader object,
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
    uniformMap = new Map();
    // Default Shaders
    static defaultShader;
    static litShader;
    static unlitShader;

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
        const uniformLocation = gl.getUniformLocation(this.program, uniformName);
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
    // renderers = [];
    static materialMap = new Map();
    // Shader - Shader Class
    // applyUniforms - function, called once before rendering all objects that use this material
    constructor(shader, applyPerMaterialUniforms) {
        this.shader = shader;
        this.applyPerMaterialUniforms = applyPerMaterialUniforms;
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
    vertices = [];
    triangles = [];
    uvs = [];
    normals = [];
    colors = [];
    indexBuffer = null;
    vertexBuffer = null;
    vao;
    vertexCount = 0;
    hasBuffer = false;
    data = null;
    buffer(gl) {
        // FIXME : Remove this check for performance?
        if (!this.hasBuffer) {
            console.error("Attempted to buffer data to a mesh renderer with no buffer!");
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), gl.STATIC_DRAW);
    }
    // Creates two new webGL buffers, one for vertex data and one for triangle data.
    // Will enable an array of vertex attributes, then store everything in a Vertex Array Object.
    createBuffer(gl, vertexAttributes) {
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
    createDataOld() {
        this.data = new Float32Array(this.vertices.length * 3 + this.colors.length * 3);
        for (let i = 0; i < this.vertices.length; i++) {
            this.data[i * 3] = this.vertices[i];
            this.data[i * 2 + 1] = this.colors[i];
        }
    }
    createData() {
        const values = 3;
        const stride = 11;
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
            this.data[i * stride + 8] = 1;
            this.data[i * stride + 9] = 1;
            this.data[i * stride + 10] = 1;
        }
    }
}

function meshToData(mesh) {
    const data = data = new Float32Array(mesh.vertices.length * 3 * 2);
}

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
        gl.uniformMatrix4fv(this.material.shader.uniform("transformMatrix"), false, this.gameObject.matrix);
    };
    render(gl) {
        if (this.gameObject == null) return;
        gl.bindVertexArray(this.mesh.vao);
        gl.drawElements(gl.TRIANGLES, this.mesh.triangles.length, gl.UNSIGNED_SHORT, 0);
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