
class VoxelMesh {
    static Cube;
    static initMeshes() {
        console.log("GOOOO")
        VoxelMesh.Cube = objToVoxelMesh(cubeModel);
    }
    faces = {
        Up: [],
        Down: [],
        Forward: [],
        Right: [],
        Back: [],
        Left: [],
        Unknown: [],
    };
    constructor(data) {

    }
}

function getFacingDirection(normal) {
    if (normal[1] == 0 && normal[2] == 0) {
        if (normal[0] == 1) {
            return Direction.Right;
        } else if (normal[0] == -1) {
            return Direction.Left;
        }
    }
    if (normal[0] == 0 && normal[2] == 0) {
        if (normal[1] == 1) {
            return Direction.Up;
        } else if (normal[1] == -1) {
            return Direction.Down;
        }
    }
    if (normal[0] == 0 && normal[1] == 0) {
        if (normal[2] == 1) {
            return Direction.Back;
        } else if (normal[2] == -1) {
            return Direction.Forward;
        }
    }
    return Direction.Unknown;
}

const Blocks = Object.freeze({
    Air: Symbol("Air"),
    Stone: Symbol("Stone"),
    Grass: Symbol("Grass"),
});

class Chunk {
    mesh = new Mesh();
    data = []
    static sizeX = 16;
    static sizeY = 16;
    static sizeZ = 16;
    constructor() {
        this.mesh = new Mesh();
        this.mesh.createBuffer(Engine.defaultVertexAttributes);
    }
    getBlock(x, y, z) {
        return this.data[x + z * Chunk.sizeX + y * Chunk.sizeX * Chunk.sizeZ]
    }
    setBlock(x, y, z, block) {
        this.data[x + z * Chunk.sizeX + y * Chunk.sizeX * Chunk.sizeZ] = block;
    }
    buildMesh() {

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

function generateMesh(chunk) {
    // const mesh = new Mesh();
    var vertexCount = 0;
    var triCount = 0;
    // console.log(Shapes.Voxel);
    for (var y = 0; y < Chunk.sizeY; y++) {
        for (var z = 0; z < Chunk.sizeZ; z++) {
            for (var x = 0; x < Chunk.sizeX; x++) {
                var block = chunk.getBlock(x, y, z);
                if (y > 2) continue;
                if (block === Blocks.Stone) {
                    // Add Quad to Mesh
                    // for (var i = 0; i < 4; i++) {
                    //     let offsetPos = vec3.create();
                    //     vec3.add(offsetPos, Shapes.cube.top[i].position, vec3.fromValues(x, y, z));
                    //     // console.log(Shapes.cube.top[i].position);
                    //     // mesh.vertices.push(Shapes.cube.top[i].position);
                    //     // mesh.vertices.push(Shapes.cube.top[i].position[1] + y);
                    //     // mesh.vertices.push(Shapes.cube.top[i].position[2] + z);
                    //     mesh.vertices.push(offsetPos);
                    //     mesh.colors.push(vec3.fromValues(0, 1, 0));
                    //     mesh.normals.push(vec3.fromValues(0, 1, 0));
                    // }
                    // mesh.triangles.push(vertexCount);
                    // mesh.triangles.push(vertexCount + 1);
                    // mesh.triangles.push(vertexCount + 2);
                    // mesh.triangles.push(vertexCount + 2);
                    // mesh.triangles.push(vertexCount + 3);
                    // mesh.triangles.push(vertexCount);
                    // vertexCount += 4;

                    // for()

                    // Add block to mesh
                    
                    for (var face of VoxelMesh.Cube.faces.Up) {
                        for (var i = 0; i < face.vertexCount; i++) {
                            var offset = vec3.create();
                            const move = vec3.fromValues(x, y, z);
                            // console.log(vec3.fromValues(x, y, z));
                            // console.log(face.vertices[i]);
                            vec3.add(offset, face.vertices[i], vec3.fromValues(x, y, z));
                            // vec3.add(offset, offset, vec3.fromValues(Math.random() * 10, 0, 0));
                            // console.log("off:" + offset);
                            const v = 10;
                            var rand = vec3.fromValues(Math.random() * v, Math.random() * v, Math.random() * v);
                            // chunk.mesh.vertices.push(offset);
                            // chunk.mesh.vertices.push(offset);
                            // console.log("!" + rand);
                            chunk.mesh.vertices.push(offset);
                            chunk.mesh.uvs.push(face.uvs[i]);
                            chunk.mesh.normals.push(face.normals[i]);
                        }
                        if (face.vertexCount == 4) {
                            // console.log("####")
                            chunk.mesh.triangles.push(triCount);
                            chunk.mesh.triangles.push(triCount + 1);
                            chunk.mesh.triangles.push(triCount + 2);
                            chunk.mesh.triangles.push(triCount + 2);
                            chunk.mesh.triangles.push(triCount + 3);
                            chunk.mesh.triangles.push(triCount);
                            triCount += 4;
                        }
                        // console.log(face);
                    }
                    // mesh.vertices.push()

                    // Add block to mesh
                }
            }
        }
    }
    chunk.mesh.vertexCount = vertexCount;
    chunk.mesh.createData();
    chunk.mesh.buffer();

    // return mesh;
}