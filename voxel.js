
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
        return data[x + z * sizeX + y * sizeX * sizeZ]
    }
    setBlock(x, y, z, block) {
        data[x + z * sizeX + y * sizeX * sizeZ] = block;
    }
}

class Mesh {
    vertices;
    triangles;
    uvs;
    normals;
    constructor(){

    }
}

function generateChunk(chunk) {
    for (var y = 0; y < sizeY; y++) {
        for (var z = 0; z < sizeZ; z++) {
            for (var x = 0; x < sizeX; x++) {
                chunk.setBlock(x, y, z, Blocks.Stone);
            }
        }
    }
}

function generateMesh(chunk) {
    for (var y = 0; y < sizeY; y++) {
        for (var z = 0; z < sizeZ; z++) {
            for (var x = 0; x < sizeX; x++) {
                var block = chunk.getBlock(x, y, z);
                if (block === Blocks.Stone) {
                    
                    
                }
            }
        }
    }
}

function go(){
    alert("!");
}

window.onload = go;