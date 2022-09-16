
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
                console.error("Attribute location not found: " + attribute.name);
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
    constructor(shader, applyUniforms) {
        this.shader = shader;
        this.applyUniforms = applyUniforms;
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