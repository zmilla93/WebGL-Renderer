
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
                        mesh.normals.push(vec3.fromValues(0, 1, 0));
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