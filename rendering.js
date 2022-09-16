
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

class Shader {
    name;
    program;
    attributes;
    uniformMap;
    static materialMap = new Map();
    // gl - weblGL Context
    // program - gl Shader Program
    // Attributes - Array of ShaderAttributes
    // Uniforms - Array of String uniform names
    constructor(gl, name, vertexShaderSource, fragmentShaderSource, attributes, uniforms) {
        this.name = name;
        this.program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
        gl.useProgram(this.program);
        console.log(this.program);
        this.attributes = attributes;
        this.uniformMap = new Map();
        for (let attribute of attributes) {
            let location = gl.getAttribLocation(this.program, attribute.name);
            if (location < 0) {
                console.warn("Attribute location not found '" + attribute.name + "' when creating shader '" + this.name + "'.");
                continue;
            }
            attribute.location = location;
        }
        for (let uniform of uniforms) {
            let location = gl.getUniformLocation(this.program, uniform);
            if (location < 0) {
                console.error("Uniform location not found: " + attribute.name);
                continue;
            }
            this.uniformMap.set(uniform, location);
        }
    }
    // Returns the webGL location of the (string) uniform.
    uniform(uniform) {
        if (this.uniformMap.has(uniform))
            return this.uniformMap.get(uniform);
        console.error("Uniform '" + uniform + "' not found in map for shader '" + this.name + "'. Make sure to register uniform names on shader creation.");
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

        // console.log("NEW MAT");
        // console.log(Material.materialMap);
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
        // console.log("REG");
        const mat = Material.getMaterial(material);

        // console.log(mat);
        // if (mat.renderers == null) mat.renderers = [];
        // mat.renderers = [];
        // console.log(mat.renderers);
        mat.renderers.push(renderer);
    }
    static test() {
        console.log("TEST");
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
    // createBuffer will request two new buffers from webGL.
    // Some initial settings will be set on the buffers.
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

        // const positionLocation = gl.getAttribLocation(shaderProgram, "vertexPosition");
        // const colorLocation = gl.getAttribLocation(shaderProgram, "aVertexColor");
        // gl.enableVertexAttribArray(positionLocation);
        // gl.enableVertexAttribArray(colorLocation);
        // gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
        // // gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        // gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

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
        this.data = [];
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
    // gameObject;
    // mesh;
    material;
    // shader;
    // static renderList = [];
    constructor(mesh, material) {
        // super(gameObject);
        // this.gameObject = gameObject; 
        super();
        this.mesh = mesh;
        this.setMaterial(material);
        // MeshRenderer.renderList.push(this);
    }
    render(gl) {
        if(this.gameObject == null) return;
        // const transformMatrixLocation = gl.getUniformLocation(shaderProgram, "transformMatrix");
        // gl.uniformMatrix4fv(transformMatrixLocation, false, this.gameObject.matrix);
        gl.bindVertexArray(this.mesh.vao);
        gl.drawElements(gl.TRIANGLES, this.mesh.triangles.length, gl.UNSIGNED_SHORT, 0);
    }
    applyPerObjectUniforms = function () {
        if(this.gameObject == null) return;
        // const transformMatrixLocation = gl.getUniformLocation(shaderProgram, "transformMatrix");
        // gl.uniformMatrix4fv(transformMatrixLocation, false, this.gameObject.matrix);
        gl.uniformMatrix4fv(this.material.shader.uniform("transformMatrix"), false, this.gameObject.matrix);
    };
    onAdd = function (gameObject) {
        // console.log("GELLO" + gameObject);
    }
    onRemove = function (gameObject) {

    }
    setMaterial(material) {
        // console.log("SETTING MAT:" + material);
        if (this.material != null) {
            Material.unregisterRenderer(this.material, this);
        }
        this.material = material;
        if (this.material == null) return;
        Material.registerRenderer(this.material, this);
    }
}