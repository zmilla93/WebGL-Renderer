
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

class Mesh {
    vertices;
    triangles;
    uvs;
    normals;
    colors = [];
    useNormals = false;
    useUVs = false;
    useColor = false;
    // vertexAttributes;
    indexBuffer = null;
    vertexBuffer = null;
    vertexCount = 0;
    hasBuffer = false;
    data = null;
    constructor() {
        this.vertices = [];
        this.triangles = [];
    }
    //
    buffer(gl) {
        // FIXME : Remove this check for performance?
        if (!this.hasBuffer) {
            console.error("Attempted to buffer data to a mesh renderer with no buffer!");
            return;
        }

        this.data = new Float32Array(this.vertices.length * 3 + this.colors.length * 3);
        // console.log(this.vertices);
        for (let i = 0; i < this.vertices.length; i++) {
            // this.data[i * 3] = this.vertices[i];
            // this.data[i * 2 + 1] = this.colors[i];
        }
        // console.log(this.vertices);
        // console.log(this.data);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }
    // createBuffer will request two new buffers from webGL.
    // Some initial settings will be set on the buffers.
    createBuffer(gl, vertexAttributes) {
        if (this.hasBuffer) {
            // FIXME : Add name to error messages once this object has more data
            console.error("Mesh renderer requested a buffer when one already exists!");
            return;
        }
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
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
}


class MeshRenderer {
    gameObject;
    mesh;
    constructor(gameObject, mesh) {
        this.gameObject = gameObject;
        this.mesh = mesh;
    }
    render(gl) {
        // console.log(this.mesh.vertexCount);
        // console.log(this.mesh.vertexBuffer);
        // console.log(this.mesh.data);
        //FIXME : Cache this value!
        const transformMatrixLocation = gl.getUniformLocation(shaderProgram, "transformMatrix");
        gl.uniformMatrix4fv(transformMatrixLocation, false, this.gameObject.matrix);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.mesh.data, gl.UNSIGNED_SHORT, 0);
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
    console.log(Shapes.Voxel);
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