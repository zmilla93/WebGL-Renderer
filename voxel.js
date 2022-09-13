
const Blocks = Object.freeze({
    Air: Symbol("Air"),
    Stone: Symbol("Stone"),
    Grass: Symbol("Grass"),
});

class Chunk {
    data = []
    static sizeX = 16;
    static sizeY = 16;
    static sizeZ = 16;
    getBlock(x, y, z) {
        return this.data[x + z * Chunk.sizeX + y * Chunk.sizeX * Chunk.sizeZ]
    }
    setBlock(x, y, z, block) {
        this.data[x + z * Chunk.sizeX + y * Chunk.sizeX * Chunk.sizeZ] = block;
    }
}

class Component {
    gameObject = null;
    constructor(gameObject){
        this.gameObject = gameObject;
    }
    setParent(parent) {
        this.gameObject = parent;
    }
    get parent() {
        return this.gameObject;
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
            console.log("Enabling attrib:" + attribute.location + " with offset " + attribute.offset);
            gl.enableVertexAttribArray(attribute.location);
            gl.vertexAttribPointer(attribute.location, attribute.count, attribute.type, false, attribute.stride, attribute.offset);
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
        const arrStride = 6;
        const stride = 6;
        this.data = [];
        this.data = new Float32Array(this.vertices.length * 3 * 2);
        for (let i = 0; i < this.vertices.length; i++) {
            this.data[i * stride] = this.vertices[i][0];
            this.data[i * stride + 1] = this.vertices[i][1];
            this.data[i * stride + 2] = this.vertices[i][2];
            this.data[i * stride + 3] = this.normals[i][0];
            this.data[i * stride + 4] = this.normals[i][1];
            this.data[i * stride + 5] = this.normals[i][2];
            this.vertexCount += 4;
        }
    }
}

/**
 * Renders a mesh for a given game object.
 */
class MeshRenderer extends Component{
    // gameObject;
    mesh;
    static renderList = []
    constructor(gameObject, mesh) {
        super(gameObject);
        // this.gameObject = gameObject; 
        this.mesh = mesh;
        MeshRenderer.renderList.push(this);
    }
    render(gl) {
        // console.log(this.mesh.vertexCount);
        // console.log(this.mesh.vertexBuffer);
        // console.log(this.mesh.data);
        //FIXME : Cache this value!

        const transformMatrixLocation = gl.getUniformLocation(shaderProgram, "transformMatrix");
        gl.uniformMatrix4fv(transformMatrixLocation, false, this.gameObject.matrix);

        gl.bindVertexArray(this.mesh.vao);

        // gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);

        // const positionLocation = gl.getAttribLocation(shaderProgram, "vertexPosition");
        // const colorLocation = gl.getAttribLocation(shaderProgram, "aVertexColor");
        // // gl.enableVertexAttribArray(positionLocation);
        // // gl.enableVertexAttribArray(colorLocation);
        // gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
        // // gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        // gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

        gl.drawElements(gl.TRIANGLES, this.mesh.triangles.length, gl.UNSIGNED_SHORT, 0);
    }


}

function generateChunk(chunk) {
    for (var y = 0; y < Chunk.sizeY; y++) {
        for (var z = 0; z < Chunk.sizeZ; z++) {
            for (var x = 0; x < Chunk.sizeX; x++) {
                chunk.setBlock(x, y, z, Blocks.Stone);
            }
        }
    }
}

function meshFromQuadArray() {

}

function generateMesh(chunk) {
    const mesh = new Mesh();
    var vertexCount = 0;
    // console.log(Shapes.Voxel);
    for (var y = 0; y < Chunk.sizeY; y++) {
        for (var z = 0; z < Chunk.sizeZ; z++) {
            for (var x = 0; x < Chunk.sizeX; x++) {
                var block = chunk.getBlock(x, y, z);
                if (y > 2) continue;
                if (block === Blocks.Stone) {
                    // Add Quad to Mesh
                    for (var i = 0; i < 4; i++) {
                        let offsetPos = vec3.create();
                        vec3.add(offsetPos, Shapes.cube.top[i].position, vec3.fromValues(x, y, z));
                        // console.log(Shapes.cube.top[i].position);
                        // mesh.vertices.push(Shapes.cube.top[i].position);
                        // mesh.vertices.push(Shapes.cube.top[i].position[1] + y);
                        // mesh.vertices.push(Shapes.cube.top[i].position[2] + z);
                        mesh.vertices.push(offsetPos);
                        mesh.colors.push(vec3.fromValues(0, 1, 0));
                    }
                    mesh.triangles.push(vertexCount);
                    mesh.triangles.push(vertexCount + 1);
                    mesh.triangles.push(vertexCount + 2);
                    mesh.triangles.push(vertexCount + 2);
                    mesh.triangles.push(vertexCount + 3);
                    mesh.triangles.push(vertexCount);
                    vertexCount += 4;
                    // Add block to mesh
                }
            }
        }
    }
    mesh.vertexCount = vertexCount;
    return mesh;
}

function go() {
    alert("!");
}

window.onload = go;