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
    _color = [1, 1, 1];
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
    updateMainCamera() {
        if (this.isMainCamera()) {
            Engine.gl.clearColor(this.color[0], this.color[1], this.color[2], 1);
        }
    }
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
    name;
    program;
    attributes;
    uniformConverter = {};
    uniformMap = new Map();

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
        // console.error("Uniform '" + uniformName + "' not found in shader '" + this.name + "'.");
    }
}

class Material {
    _shader;
    _renderers = [];
    // uniform = {};
    // _texture;
    _directionalLight;
    static materialMap = new Map();
    // Shader - Shader Class
    constructor(shader) {
        this._shader = shader;
        this.diffuseSampler = 0;
        this.normalSampler = 1;
        this.specularSampler = 2;

        this.useDiffuseTexture = false;
        this.useSpecularTexture = false;
        this.useNormalTexture = false;

        Material.registerMaterial(this);
    }
    setDirectionalLight(directionalLight){
        this._directionalLight = directionalLight;
        this["directionalLight.direction"] = directionalLight.direction;
        this["directionalLight.diffuse"] = directionalLight.diffuse;
        this["directionalLight.ambient"] = directionalLight.ambient;
        this["directionalLight.specular"] = directionalLight.specular;
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
    // set texture(tex){
    //     this.texture = tex;
    //     this.useTexture = tex != null;
    // }
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
    specular
    static placeholderColor = [255, 5, 150];
    static placeholderTexture; // 1x1 pixel Magenta texture that displays when target texture is missing.
    constructor(diffuse, normal, specular, textureFilter = TextureFilter.Linear, textureWrap = TextureWrap.Wrap) {
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
        // this.diffuse = gl.createTexture();
        // gl.bindTexture(gl.TEXTURE_2D, this.diffuse);
        // // Attempt to send the texture to webGL.
        // try {
        //     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flips the texture vertically.
        //     gl.texImage2D(gl.TEXTURE_2D, levelOfDetail, internalFormat, diffuse.width, diffuse.height, border, srcFormat, type, diffuse);
        //     gl.generateMipmap(gl.TEXTURE_2D);
        // } catch (error) {
        //     // If creating the texture fails, delete the glTexture and return.
        //     console.error("Failed to create glTexture using '" + diffuse.id + "' " + diffuse + ". Textures cannot be used in an offline enviroment. See github repo for info to locally host using python.");
        //     gl.deleteTexture(this.diffuse);
        //     this.diffuse = null;
        //     return;
        // }
        // // Set texture wrap mode
        // switch (textureWrap) {
        //     case TextureWrap.Clamp:
        //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //         break;
        //     case TextureWrap.Wrap:
        //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        //         break;
        // }
        // // Set texture fitler mode
        // switch (textureFilter) {
        //     case TextureFilter.Nearest:
        //         // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //         break;
        //     case TextureFilter.Linear:
        //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //         break;
        // }
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
            console.error("Failed to create glTexture using '" + image.id + "' " + image + ". Textures cannot be used in an offline enviroment. See github repo for info to locally host using python.");
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
        Mesh.monster2 = objToMesh(monsterSmoothModel);
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
        Engine.gl.uniformMatrix4fv(this.material._shader.uniform("transformMatrix"), false, this.gameObject.matrix);
        Engine.gl.uniformMatrix4fv(this.material._shader.uniform("modelMatrix"), false, this.gameObject.getModelMatrix());
        // FIXME : Camera pos could be moved to a per material uniform
        let camPos = Camera.main.position;
        Engine.gl.uniform3f(this.material._shader.uniform("cameraPos"), camPos[0], camPos[1], camPos[2]);
    };
    render(gl) {
        if (this.gameObject == null) return;
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

class DirectionalLight{
    direction;
    ambient;
    diffuse;
    specular;
}

class PointLight{
    direction;
    constant;
    linear;
    quadratic;
    ambient;
    diffuse;
    specular;
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