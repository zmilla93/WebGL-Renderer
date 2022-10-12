
class VoxelMesh {
    static Cube;
    static initMeshes() {
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

class ChunkManager {

}

class Chunk {
    mesh = new Mesh();
    data = []
    static sizeX = 16;
    static sizeY = 16;
    static sizeZ = 16;
    constructor() {
        this.mesh = new Mesh();
        this.mesh.createBuffer();
    }
    getBlock(x, y, z) {
        if (x < 0 || x >= Chunk.sizeX ||
            y < 0 || y >= Chunk.sizeY ||
            z < 0 || z >= Chunk.sizeZ) return null;
        return this.data[x + z * Chunk.sizeX + y * Chunk.sizeX * Chunk.sizeZ]
    }
    setBlock(x, y, z, block) {
        this.data[x + z * Chunk.sizeX + y * Chunk.sizeX * Chunk.sizeZ] = block;
    }
    buildMesh() {

    }
}

function generateChunk(chunk) {
    var perlin = new Perlin();
    perlin.Seed = Math.random() * 99999999;
    // perlin.NoiseQuality = NoiseUtil.NoiseQuality.QUALITY_BEST;
    for (var y = 0; y < Chunk.sizeY; y++) {
        for (var z = 0; z < Chunk.sizeZ; z++) {
            for (var x = 0; x < Chunk.sizeX; x++) {
                const chunkSize = 10;
                var value = perlin.GetValue(x / chunkSize, y / chunkSize, z / chunkSize);
                if (value > 0) chunk.setBlock(x, y, z, Blocks.Stone);
            }
        }
    }
}

function generateMesh(chunk) {
    var vertexCount = 0;
    var triCount = 0;
    for (var y = 0; y < Chunk.sizeY; y++) {
        for (var z = 0; z < Chunk.sizeZ; z++) {
            for (var x = 0; x < Chunk.sizeX; x++) {
                var block = chunk.getBlock(x, y, z);
                if (block === Blocks.Stone) {
                    for (var faceEntry of Object.entries(VoxelMesh.Cube.faces)) {
                        for (let face of faceEntry[1]) {
                            // Check if the neighbor to this face is a solid block.
                            //If so, don't render this face.
                            // FIXME : This calculation is done per face but really only needs to be done once per face entry due to the shared normal.
                            // Could be moved out one loop.
                            var offset = directionToVector(Direction[faceEntry[0]]);
                            var pos = vec3.fromValues(x, y, z);
                            vec3.add(pos, pos, offset);
                            var neighbor = chunk.getBlock(pos[0], pos[1], pos[2]);
                            if (neighbor != null) continue;

                            // Add the face to the chunk mesh.
                            for (var i = 0; i < face.vertexCount; i++) {
                                var offsetPos = vec3.create();
                                vec3.add(offsetPos, face.vertices[i], vec3.fromValues(x, y, z));
                                chunk.mesh.vertices.push(offsetPos);
                                chunk.mesh.uvs.push(face.uvs[i]);
                                chunk.mesh.normals.push(face.normals[i]);
                                chunk.mesh.colors.push(vec3.fromValues(Math.random(), Math.random(), Math.random()));
                            }
                            // Add the triangle data to the chunk mesh
                            // FIXME : Add support for 3 point faces!
                            if (face.vertexCount == 4) {
                                chunk.mesh.triangles.push(triCount);
                                chunk.mesh.triangles.push(triCount + 1);
                                chunk.mesh.triangles.push(triCount + 2);
                                chunk.mesh.triangles.push(triCount + 2);
                                chunk.mesh.triangles.push(triCount + 3);
                                chunk.mesh.triangles.push(triCount);
                                triCount += 4;
                            }
                        }
                    }
                }
            }
        }
    }
    chunk.mesh.useColors = true;
    chunk.mesh.vertexCount = vertexCount;
    chunk.mesh.buffer();
}