
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
    static seed;
    gameObject = null;
    mesh = new Mesh();
    data = []
    static sizeX = 16;
    static sizeY = 16;
    static sizeZ = 16;
    chunkX;
    chunkY;
    chunkZ;
    constructor(x, y, z) {
        this.chunkX = x;
        this.chunkY = y;
        this.chunkZ = z;
        // this.mesh = new Mesh();
        // this.mesh.createBuffer();
    }
    createGameObject(material) {
        this.gameObject = new GameObject();
        this.gameObject.position = [this.chunkX * Chunk.sizeX, this.chunkY * Chunk.sizeY, this.chunkZ * Chunk.sizeZ];
        this.mesh = new Mesh();
        this.gameObject.add(new MeshRenderer(this.mesh, material));
        this.mesh.createBuffer();
    }
    destroyGameObject() {
        // TODO
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

    generateChunk() {
        var perlin = new Perlin();
        noise.seed(Chunk.seed);
        perlin.Seed = Chunk.seed;
        perlin.NoiseQuality = NoiseUtil.NoiseQuality.QUALITY_FAST;
        for (var y = 0; y < Chunk.sizeY; y++) {
            for (var z = 0; z < Chunk.sizeZ; z++) {
                for (var x = 0; x < Chunk.sizeX; x++) {
                    // FIXME : Currently the chunk size influnces the noise
                    // Could make noise size independent, but needs some extra math.
                    var sampleX = this.chunkX + x / Chunk.sizeX;
                    var sampleY = this.chunkY + y / Chunk.sizeY;
                    var sampleZ = this.chunkZ + z / Chunk.sizeZ;
                    var value = perlin.GetValue(sampleX, sampleY, sampleZ);
                    if (y < 2 || value > 0.25) this.setBlock(x, y, z, Blocks.Stone);
                }
            }
        }
    }

    generateMesh() {
        var vertexCount = 0;
        var triCount = 0;
        this.mesh.vertices = [];
        this.mesh.uvs = [];
        this.mesh.colors = [];
        this.mesh.triangles = [];
        for (var y = 0; y < Chunk.sizeY; y++) {
            for (var z = 0; z < Chunk.sizeZ; z++) {
                for (var x = 0; x < Chunk.sizeX; x++) {
                    var block = this.getBlock(x, y, z);
                    if (block === Blocks.Stone) {
                        triCount = this.addVoxelToMesh(triCount, x, y, z);
                    }
                }
            }
        }
        this.mesh.useColors = true;
        this.mesh.vertexCount = vertexCount;
        this.mesh.buffer();
    }

    addVoxelToMesh(triCount, x, y, z) {
        for (var faceEntry of Object.entries(VoxelMesh.Cube.faces)) {
            for (let face of faceEntry[1]) {
                // Check if the neighbor to this face is a solid block.
                // If so, don't render this face.
                // FIXME : This calculation is done per face but really only needs to be done once per face entry due to the shared normal.
                // Could be moved out one loop. Only complex models will benefit from this optimization anyway.
                var offset = directionToVector(Direction[faceEntry[0]]);
                var pos = vec3.fromValues(x, y, z);
                vec3.add(pos, pos, offset);
                var neighbor = this.getBlock(pos[0], pos[1], pos[2]);
                if (neighbor != null) continue;

                // Add the face to the chunk mesh.
                for (var i = 0; i < face.vertexCount; i++) {
                    var offsetPos = vec3.create();
                    vec3.add(offsetPos, face.vertices[i], vec3.fromValues(x, y, z));
                    this.mesh.vertices.push(offsetPos);
                    this.mesh.uvs.push(face.uvs[i]);
                    this.mesh.normals.push(face.normals[i]);
                    var color = vec3.fromValues(Math.random(), Math.random(), Math.random());
                    if (this.chunkX >= 0) color[0] = 1;
                    if (this.chunkZ >= 0) color[1] = 1;
                    this.mesh.colors.push(color);
                }
                // Add the triangle data to the chunk mesh
                // FIXME : Add support for 3 point faces!
                if (face.vertexCount == 4) {
                    this.mesh.triangles.push(triCount);
                    this.mesh.triangles.push(triCount + 1);
                    this.mesh.triangles.push(triCount + 2);
                    this.mesh.triangles.push(triCount + 2);
                    this.mesh.triangles.push(triCount + 3);
                    this.mesh.triangles.push(triCount);
                    triCount += 4;
                }
            }
        }
        return triCount;
    }
}