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
    _color = [128 / 255, 255 / 255, 128 / 255];
    // Mutual Settings
    nearPlane = 0.01;
    farPlane = 1000;
    // Perspective Settings
    fieldOfView = 80 * DEG2RAD;
    aspectRatio = Engine.gl.canvas.clientWidth / Engine.gl.canvas.clientHeight;
    projectionMatrix = mat4.create();
    // Orthographic Settings
    _ortho = false;
    width = 20;
    height = 20;
    // Camera.main is used to render the scene
    static _main;
    static get main() {
        return Camera._main;
    };
    static set main(camera) {
        Camera._main = camera;
        Camera._main.updateMainCamera();
    }
    constructor() {
        this.position = vec3.fromValues(0, 5, 20);
        this.rotation = vec3.create();
        this.viewDirection = vec3.clone(VECTOR3_FORWARD);
        this.forward = vec3.clone(VECTOR3_FORWARD);
        this.calculateProjectionMatrix();
    }
    isMainCamera() {
        return this == Camera._main;
    }
    // Getters/Setters
    set ortho(state) {
        this._ortho = state;
        this.calculateProjectionMatrix();
    }
    get ortho() {
        return this._ortho;
    }
    set color(color) {
        this._color = color;
        this.updateMainCamera();
    }
    get color() {
        return this._color;
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
            mat4.ortho(this.projectionMatrix, -this.width, this.width, -this.height, this.height, this.nearPlane, this.farPlane);
        } else {
            mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspectRatio, this.nearPlane, this.farPlane);
        }
    }
    getProjectionMatrix() {
        return this.projectionMatrix;
    }
    updateAspectRatio() {
        this.aspectRatio = Engine.canvas.clientWidth / Engine.canvas.clientHeight;
        this.calculateProjectionMatrix();
    }
    updateMainCamera() {
        if (this.isMainCamera()) {
            Engine.gl.clearColor(this.color[0], this.color[1], this.color[2], 1);
        }
    }
    calculateWorldToViewMatrix() {
        this.worldToViewMatrix = mat4.create();
        let localViewDirection = vec3.clone(VECTOR3_FORWARD);
        this.forward = vec3.clone(VECTOR3_FORWARD);
        // this.rotation[2] = 0 * DEG2RAD;

        // Convert rotation to radians
        let rotationRad = vec3.clone(this.rotation);
        rotationRad[0] *= DEG2RAD;
        rotationRad[1] *= DEG2RAD;
        rotationRad[2] *= DEG2RAD;

        // Apply rotation
        vec3.rotateX(localViewDirection, localViewDirection, VECTOR3_ZERO, rotationRad[0]);
        vec3.rotateY(localViewDirection, localViewDirection, VECTOR3_ZERO, rotationRad[1]);
        vec3.rotateY(this.forward, this.forward, VECTOR3_ZERO, rotationRad[1]);
        this.viewDirection = localViewDirection;

        // vec3.rotateZ(localViewDirection, localViewDirection, VECTOR3_ZERO, this.rotation[2]);
        // vec3.rotateY(this.rotation[1]);

        let lookVector = vec3.create();
        vec3.add(lookVector, this.position, localViewDirection);

        let upVector = vec3.clone(VECTOR3_UP);
        vec3.rotateZ(upVector, upVector, VECTOR3_ZERO, rotationRad[2]);
        vec3.rotateX(upVector, upVector, VECTOR3_ZERO, rotationRad[0]);
        vec3.rotateY(upVector, upVector, VECTOR3_ZERO, rotationRad[1]);

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
    name;
    program;
    attributes;
    uniformConverter = {};
    uniformMap = new Map();
    missingUniforms = new Set();
    // name - (string) ID
    // vertexShaderSource, fragmentShaderSource - (string) GLSL shader code
    // Attributes - Array of ShaderAttributes
    constructor(name, vertexShaderSource, fragmentShaderSource, attributes = Engine.defaultVertexAttributes) {
        this.name = name;
        this.program = createShaderProgram(vertexShaderSource, fragmentShaderSource);
        Engine.gl.useProgram(this.program);
        this.attributes = attributes;
        for (let attribute of attributes) {
            let location = Engine.gl.getAttribLocation(this.program, attribute.name);
            if (location < 0) {
                console.warn("Attribute location '" + attribute.name + "' not found when creating shader '" + this.name + "'.");
                continue;
            }
            attribute.location = location;
        }
    }
    static list() {
        let results = [];
        let ignore = ["length", "name", "prototype"];
        for (let o of Object.getOwnPropertyNames(Shader)) {
            if (typeof Shader[o] === 'function') continue;
            if (ignore.includes(o)) continue;
            results.push(o);
        }
        return results;
    }
    // A chacheing version of gl.getUniformLocation().
    uniform(uniformName) {
        if (this.uniformMap.has(uniformName))
            return this.uniformMap.get(uniformName);
        const uniformLocation = Engine.gl.getUniformLocation(this.program, uniformName);
        if (uniformLocation != null) {
            this.uniformMap.set(uniformName, uniformLocation);
            return uniformLocation;
        }
        // If the uniform can't be found, report an error and add it to a set to avoid repeated errors.
        let missingName = this.name + ":" + uniformName;
        if (!this.missingUniforms.has(missingName)) {
            this.missingUniforms.add(missingName);
            console.error("Uniform '" + uniformName + "' not found in shader '" + this.name + "'.");
        }
    }
}

class LitShader extends Shader {
    constructor(name, vertexShaderSource, fragmentShaderSource, lightCount = 4, attributes = Engine.defaultVertexAttributes) {
        super(name, vertexShaderSource, fragmentShaderSource, attributes);
        this.setupCommon();
        this.setupDirectionalLighting();
        this.setupPointLighting(lightCount);
    }
    setupCommon() {
        this.uniformConverter.objectColor = Rendering.vector3Converter;
        this.uniformConverter.albedo = Rendering.vector3Converter;
        this.uniformConverter.cameraPos = Rendering.vector3Converter;
        this.uniformConverter.specularStrength = Rendering.floatConverter;
        this.uniformConverter.useDiffuseTexture = Rendering.boolConverter;
        this.uniformConverter.useSpecularTexture = Rendering.boolConverter;
        this.uniformConverter.useEmissionTexture = Rendering.boolConverter;
        // this.uniformConverter.useNormalTexture = Rendering.boolConverter;
        this.uniformConverter.diffuseSampler = Rendering.intConverter;
        this.uniformConverter.normalSampler = Rendering.intConverter;
        this.uniformConverter.specularSampler = Rendering.intConverter;
        this.uniformConverter.emissionSampler = Rendering.intConverter;
    }
    setupDirectionalLighting() {
        this.uniformConverter.useDirectionalLight = Rendering.boolConverter;
        this.uniformConverter["directionalLight.direction"] = Rendering.vector3Converter;
        this.uniformConverter["directionalLight.ambient"] = Rendering.vector3Converter;
        this.uniformConverter["directionalLight.ambientIntensity"] = Rendering.floatConverter;
        this.uniformConverter["directionalLight.diffuse"] = Rendering.vector3Converter;
        this.uniformConverter["directionalLight.specular"] = Rendering.vector3Converter;
    }
    setupPointLighting(lightCount) {
        for (let i = 0; i < lightCount; i++) {
            let curLight = "pointLight[" + i + "].";
            this.uniformConverter["usePointLight[" + i + "]"] = Rendering.boolConverter;
            this.uniformConverter[curLight + "position"] = Rendering.vector3Converter;
            this.uniformConverter[curLight + "ambient"] = Rendering.vector3Converter;
            this.uniformConverter[curLight + "ambientIntensity"] = Rendering.floatConverter;
            this.uniformConverter[curLight + "diffuse"] = Rendering.vector3Converter;
            this.uniformConverter[curLight + "specular"] = Rendering.vector3Converter;
            this.uniformConverter[curLight + "constant"] = Rendering.floatConverter;
            this.uniformConverter[curLight + "linear"] = Rendering.floatConverter;
            this.uniformConverter[curLight + "quadratic"] = Rendering.floatConverter;
        }
    }
}

class Material {
    _shader;
    _renderers = [];
    _texture;
    _directionalLight;
    _pointLight = [];
    color = [1, 1, 1];
    static materialMap = new Map();
    static MAX_POINT_LIGHTS = 4;
    // Shader - Shader Class
    constructor(shader) {
        this._shader = shader;
        // Sets the index for texture sampling.
        this.diffuseSampler = 0;
        this.normalSampler = 1;
        this.specularSampler = 2;
        this.emissionSampler = 3;
        // Don't use textures by default.
        this.useDiffuseTexture = false;
        this.useSpecularTexture = false;
        this.useNormalTexture = false;
        this.useEmissionTexture = false;

        this.hasSpecularTexture = false;
        this.hasNormalTexture = false;
        this.hasEmissionTexture = false;

        this.useDirectionalLight = false;
        // FIXME : Should be a better way to initialize this
        for (let i = 0; i < Material.MAX_POINT_LIGHTS; i++) {
            this["usePointLight[" + i + "]"] = false;
        }
        Material.registerMaterial(this);
    }
    setDirectionalLight(light) {
        this._directionalLight = light;
    }
    setPointLight(index, light) {
        this._pointLight[index] = light;
    }
    applyDirectionalLightUniforms() {
        let light = this._directionalLight;
        this.useDirectionalLight = this._directionalLight != null && this._directionalLight.enabled;
        if (light != null) {
            this["directionalLight.direction"] = light.direction;
            this["directionalLight.diffuse"] = light.diffuse;
            this["directionalLight.ambient"] = light.ambient;
            this["directionalLight.ambientIntensity"] = light.ambientIntensity;
            this["directionalLight.specular"] = light.specular;
        }
    }
    applyPointLightUniforms() {
        for (let i = 0; i < Material.MAX_POINT_LIGHTS; i++) {
            var light = this._pointLight[i];
            let lightPrefix = "pointLight[" + i + "].";
            let usePointLightKey = "usePointLight[" + i + "]";
            if (light != null) {
                this[lightPrefix + "position"] = light.position;
                this[lightPrefix + "diffuse"] = light.diffuse;
                this[lightPrefix + "ambient"] = light.ambient;
                this[lightPrefix + "ambientIntensity"] = light.ambientIntensity;
                this[lightPrefix + "specular"] = light.specular;
                this[lightPrefix + "constant"] = light.constant;
                this[lightPrefix + "linear"] = light.linear;
                this[lightPrefix + "quadratic"] = light.quadratic;
                this[usePointLightKey] = light.gameObject.enabled;
            } else {
                this[usePointLightKey] = false;
            }
        }
    }
    static registerMaterial(material) {
        var shaderEntry;
        if (Material.materialMap.has(material._shader.name)) {
            shaderEntry = Material.materialMap.get(material._shader.name);
        } else {
            shaderEntry = [];
        }
        shaderEntry.push(material);
        Material.materialMap.set(material._shader.name, shaderEntry);
    }
    set texture(texture) {
        this._texture = texture;
        if (texture == null) {
            this.useDiffuseTexture = false;
            this.useNormalTexture = false;
            this.hasNormalTexture = false
            this.useSpecularTexture = false;
            this.hasSpecularTexture = false;
            this.useEmissionTexture = false;
            this.hasEmissionTexture = false;
        } else {
            this.useDiffuseTexture = texture.diffuse != null;
            this.useNormalTexture = texture.normal != null;
            this.hasNormalTexture = texture.normal != null;
            this.useSpecularTexture = texture.specular != null;
            this.hasSpecularTexture = texture.specular != null;
            this.useEmissionTexture = texture.emission != null;
            this.hasEmissionTexture = texture.emission != null;
        }
    }
    // FIXME : get material seems unnessecary??
    static getMaterial(material) {
        const shaderGroup = Material.materialMap.get(material._shader.name);
        const mat = shaderGroup[shaderGroup.indexOf(material)];
        return mat;
    }
    static registerRenderer(material, renderer) {
        const mat = Material.getMaterial(material);
        mat._renderers.push(renderer);
    }
}

const TextureWrap = Object.freeze({
    Clamp: Symbol("Clamp"),
    Wrap: Symbol("Wrap"),
});

const TextureFilter = Object.freeze({
    Nearest: Symbol("Nearest"),
    Linear: Symbol("Linear"),
});

class Texture {
    _texture; // WebGL Texture
    diffuse;
    normal;
    specular;
    emission;
    static placeholderColor = [255, 5, 150];
    static placeholderTexture; // 1x1 pixel Magenta texture that displays when target texture is missing.
    constructor(diffuse, normal, specular, emission, textureFilter = TextureFilter.Linear, textureWrap = TextureWrap.Wrap) {
        if (diffuse == null) return;
        // Default values for textures
        const gl = Engine.gl;
        const levelOfDetail = 0; // Should always be 0
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const border = 0; // Should always be 0
        const type = gl.UNSIGNED_BYTE;
        // Create a gl texture and bind it
        this.diffuse = Texture.createGLTexture(gl.TEXTURE0, diffuse, textureFilter, textureWrap);
        if (normal != null) {
            this.normal = Texture.createGLTexture(gl.TEXTURE1, normal, textureFilter, textureWrap);
        }
        if (specular != null) {
            this.specular = Texture.createGLTexture(gl.TEXTURE2, specular, textureFilter, textureWrap);
        }
        if (emission != null) {
            this.emission = Texture.createGLTexture(gl.TEXTURE3, emission, textureFilter, textureWrap);
        }
    }
    // Creates a 1x1 texture to be used when a texture is missing.
    static createPlaceholderTexture() {
        const gl = Engine.gl;
        const pixel = new Uint8Array([Texture.placeholderColor[0], Texture.placeholderColor[1], Texture.placeholderColor[2], 255]);
        const format = gl.RGBA;
        const size = 1;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, size, size, 0, format, gl.UNSIGNED_BYTE, pixel);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D);
        Texture.placeholderTexture = new Texture();
        Texture.placeholderTexture.diffuse = texture;
    }
    static createGLTexture(activeTexture, image, textureFilter, textureWrap) {
        const gl = Engine.gl;
        const levelOfDetail = 0; // Should always be 0
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const border = 0; // Should always be 0
        const type = gl.UNSIGNED_BYTE;
        gl.activeTexture(activeTexture);
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        try {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flips the texture vertically.
            gl.texImage2D(gl.TEXTURE_2D, levelOfDetail, internalFormat, image.width, image.height, border, srcFormat, type, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        } catch (error) {
            // If creating the texture fails, delete the glTexture and return.
            console.error("Failed to create glTexture using '" + image.id + "' " + image.toString() + ". Textures cannot be used in an offline enviroment.");
            gl.deleteTexture(texture);
            texture = null;
        }
        switch (textureWrap) {
            case TextureWrap.Clamp:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                break;
            case TextureWrap.Wrap:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                break;
        }
        // Set texture fitler mode
        switch (textureFilter) {
            case TextureFilter.Nearest:
                // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                break;
            case TextureFilter.Linear:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                break;
        }
        return texture;
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
    trianglesWireframe = [];
    uvs = [];
    normals = [];
    colors = [];
    // WebGL buffers
    hasBuffer = false;
    vertexBuffer = null;
    indexBuffer = null;
    triCount = 0;
    lineCount = 0;
    // Interleaved data that will get sent to WebGL
    // Call createData to create this from mesh data.
    data = null;
    // Settings
    vertexCount = 0;
    useColors = false;
    wireframe = false;
    // Default Meshes
    static cube;
    static monster;
    static initMeshes() {
        Mesh.icoSphere = objToMesh(icoSphereModel);
        Mesh.icoSphere2 = objToMesh(icoSphere2Model);
        Mesh.icoSmooth = objToMesh(icoSmoothModel);
        Mesh.sphere = objToMesh(sphereModel);
        Mesh.smoothSphere = objToMesh(smoothSphereModel);
        Mesh.cube = objToMesh(cubeModel);
        Mesh.cubeWire = objToMesh(cubeModel, true);
        Mesh.monster = objToMesh(monsterModel);
        Mesh.monkey = objToMesh(monkeyModel);
        Mesh.cone = objToMesh(coneTModel);
        Mesh.quad = objToMesh(quadTModel);
    }
    static list() {
        let results = [];
        let ignore = ["length", "name", "prototype"];
        for (let o of Object.getOwnPropertyNames(Mesh)) {
            if (typeof Mesh[o] === 'function') continue;
            if (ignore.includes(o)) continue;
            results.push(o);
        }
        return results;
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
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), gl.STATIC_DRAW);
        var triData = this.wireframe ? new Uint16Array(this.trianglesWireframe) : new Uint16Array(this.triangles);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triData, gl.STATIC_DRAW);
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
        // this.data = [];
        const values = 3;
        const stride = 11;
        // this.triCount = this.wireframe ? this.trianglesWireframe.length : this.triangles.length;
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
    setWireframe(state) {
        this.wireframe = state;
        const gl = Engine.gl;
        gl.bindVertexArray(this.vao);
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.triangles), gl.STATIC_DRAW);
        var triData = this.wireframe ? new Uint16Array(this.trianglesWireframe) : new Uint16Array(this.triangles);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triData, gl.STATIC_DRAW);
    }
    // Frees all mesh data from RAM.
    // If you want to be able to toggle wireframe, call freeVertexData instead!
    freeData() {
        this.freeVertexData();
        this.triangles = [];
        this.trianglesWireframe = [];
    }
    // Frees most mesh data from RAM, but keeps triangle data to be able to toggle wireframe.
    freeVertexData() {
        this.vertices = [];
        this.normals = []
        this.uvs = [];
        this.colors = [];
    }
}

/**
 * Renders a mesh for a given game object.
 */
class MeshRenderer extends Component {
    material;
    constructor(mesh, material) {
        super();
        this.mesh = mesh;
        this.setMaterial(material);
    }
    applyPerObjectUniforms = function () {
        if (this.gameObject == null || !this.gameObject.enabled) return;
        let gl = Engine.gl;
        gl.uniformMatrix4fv(this.material._shader.uniform("transformMatrix"), false, this.gameObject.matrix);
        let color = this.gameObject.color == null ? this.material.color : this.gameObject.color;
        gl.uniform3f(this.material._shader.uniform("objectColor"), color[0], color[1], color[2]);
        if (this.material._shader instanceof LitShader) {
            // FIXME : Camera pos could be moved to a per material uniform
            let camPos = Camera.main.position;
            gl.uniformMatrix4fv(this.material._shader.uniform("modelMatrix"), false, this.gameObject.getModelMatrix());
            gl.uniform3f(this.material._shader.uniform("cameraPos"), camPos[0], camPos[1], camPos[2]);
        }
    };
    render(gl) {
        if (this.gameObject == null || !this.gameObject.enabled) return;
        gl.bindVertexArray(this.mesh.vao);
        if (this.mesh.wireframe) {
            // console.log(this.mesh.triCount);
            gl.drawElements(gl.LINES, this.mesh.lineCount, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawElements(gl.TRIANGLES, this.mesh.triCount, gl.UNSIGNED_SHORT, 0);
        }

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

class DirectionalLight {
    direction = [0.5, -1, 0.5];
    ambient = [1, 1, 1];
    ambientIntensity = 0.2;
    diffuse = [1, 1, 1];
    specular = [1, 1, 1];
    enabled = true;
    set color(color) {
        this.ambient = color;
        this.diffuse = color;
        this.specular = color;
    }
    get color() {
        return this.diffuse;
    }
}

class PointLight extends Component {
    // position = [0, 0, 0];
    // Colors
    ambient = [1, 1, 1];
    ambientIntensity = 0.2;
    diffuse = [1, 1, 1];
    specular = [1, 1, 1];
    // Attenuation values - Default is range 50
    constant = 1;
    linear = 0.09;
    quadratic = 0.032;
    static DEFAULT_SCALE = 0.05;
    static material;
    set position(position) {
        if (this.gameObject == null) {
            console.error("Attempted to change position of a point light, but it isn't attached to a game object!");
            return;
        }
        this.gameObject.position = position;
    }
    get position() {
        if (this.gameObject == null) {
            console.error("Attempted to read position of a point light, but it isn't attached to a game object!");
            return;
        }
        return this.gameObject.position;
    }
    set color(color) {
        this.diffuse = color;
        this.specular = color;
        if (this.gameObject != null) this.gameObject.color = color;
        else console.error("Attempted to set color of a point light, but it isn't attached to a game object!");
    }
    set enabled(state) {
        this.gameObject.enabled = state;
    }
    get enabled() {
        return this.gameObject.enabled;
    }
    static create() {
        if (PointLight.material == null) PointLight.material = new Material(Shader.unlitShader);
        let gameObject = new GameObject();
        let light = new PointLight();
        gameObject.add(light);
        gameObject.add(new MeshRenderer(Mesh.sphere, PointLight.material));
        gameObject.scale = [PointLight.DEFAULT_SCALE, PointLight.DEFAULT_SCALE, PointLight.DEFAULT_SCALE];
        return light;
    }
}

// Handles basic line rendering
class Line {
    static lineList = [];
    static dataChanged = false;
    constructor(v1, v2, color1, color2) {
        this.v1 = v1;
        this.v2 = v2;
        this.color1 = color1;
        this.color2 = color2 == null ? color1 : color2;
        Line.lineList.push(this);
        Line.dataChanged = true;
    }
    destroy() {
        Line.lineList.splice(Line.lineList.indexOf(this), 1);
        Line.dataChanged = true;
    }
    static get data() {
        // FIXME : This gets called every frame. Result should be cached and only regenerated when data actually changes.
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
function createShaderProgram(vertexShaderSource, fragmentShaderSource) {
    const gl = Engine.gl;
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

Rendering.boolConverter = function (material, uniformName) {
    let value = material[uniformName] == null ? 1 : material[uniformName];
    if (value == true || value > 0) value = 1;
    else value = 0;
    Engine.gl.uniform1i(material._shader.uniform(uniformName), value);
}

Rendering.intConverter = function (material, uniformName) {
    const value = material[uniformName] == null ? 1 : material[uniformName];
    Engine.gl.uniform1i(material._shader.uniform(uniformName), value);
}

Rendering.floatConverter = function (material, uniformName) {
    const value = material[uniformName] == null ? 1 : material[uniformName];
    Engine.gl.uniform1f(material._shader.uniform(uniformName), value);
}

Rendering.vector3Converter = function (material, uniformName) {
    const vector = material[uniformName] == null ? [1, 1, 1] : material[uniformName];
    Engine.gl.uniform3f(material._shader.uniform(uniformName), vector[0], vector[1], vector[2]);
}

Rendering.matrix4Converter = function (material, uniformName) {
    const matrix = material[uniformName] == null ? [1, 1, 1] : material[uniformName];
    // console.log(matrix);
    Engine.gl.uniformMatrix4fv(material._shader.uniform(uniformName), false, matrix);
}