
// Stores the faces of a mesh based on where they align to a block boundry to allow for easy face culling.
// A VoxelMesh is meant to be used to build a Mesh dynamically.
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
    Dirt: Symbol("Dirt"),
    Grass: Symbol("Grass"),
    Log: Symbol("Log"),
    Wood: Symbol("Wood"),
    Sand: Symbol("Sand"),
    Water: Symbol("Water"),
    Glass: Symbol("Glass"),
});

class Chunk {
    static seed;
    gameObject = null;
    mesh = new Mesh();
    data = []
    neighborChunks = {};
    hasGeneratedMesh = false;
    static CHUNK_SIZE = 16;
    static CHUNK_COUNT_Y = 0;;
    static sizeX = Chunk.CHUNK_SIZE;
    static sizeY = Chunk.CHUNK_SIZE;
    static sizeZ = Chunk.CHUNK_SIZE;
    static blockColors = {
        Grass: [68 / 255, 130 / 255, 33 / 255],
        Stone: [117 / 255, 127 / 255, 143 / 255],
        Dirt: [79 / 255, 58 / 255, 11 / 255],
        Sand: [199 / 255, 193 / 255, 74 / 255],
        Wood: [222 / 255, 170 / 255, 80 / 255],
        Log: [54 / 255, 38 / 255, 11 / 255],
        Water: [83 / 255, 152 / 255, 237 / 255],
    };
    // NOTE: World height currently needs to be set manually!
    static worldHeight = Chunk.sizeY;
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
    localChunkPosToWorldPos(localPosX, localPosY, localPosZ) {
        var pos = vec3.fromValues(localPosX, localPosY, localPosZ);
        pos[0] += this.chunkX * Chunk.sizeX;
        pos[1] += this.chunkY * Chunk.sizeY;
        pos[2] += this.chunkZ * Chunk.sizeZ;
        return pos;
    }
    createGameObject(material) {
        this.gameObject = new GameObject();
        this.gameObject.position = [this.chunkX * Chunk.sizeX, this.chunkY * Chunk.sizeY, this.chunkZ * Chunk.sizeZ];
        this.mesh = new Mesh();
        this.gameObject.add(new MeshRenderer(this.mesh, material));
        this.mesh.createBuffer();
        this.isReadyForMeshing();
    }
    destroyGameObject() {
        // TODO
    }
    isReadyForMeshing() {
        return Object.keys(this.neighborChunks).length == 6;
    }
    findNeighbors() {
        if (this.chunkY == 0) {
            // console.log("LOWER");
            this.neighborChunks[symbolToString(Direction.Down)] = { dummy: true };
        }
        if (this.chunkY == Chunk.CHUNK_COUNT_Y) {
            // console.log("upper");
            this.neighborChunks[symbolToString(Direction.Up)] = { dummy: true };
        }
        for (var direction of Object.values(Direction)) {
            if (direction == Direction.Unknown || direction == null) continue;
            var offset = directionToVector(direction);
            var chunkIndex = vec3.fromValues(this.chunkX, this.chunkY, this.chunkZ);
            var neighborIndex = vec3.create();
            vec3.add(neighborIndex, chunkIndex, offset);
            // console.log("CHUNKDATA");
            // console.log(chunkIndex);
            // console.log(neighborIndex);
            var neighborChunk = ChunkManager.getChunkByIndex(neighborIndex[0], neighborIndex[1], neighborIndex[2]);
            if (neighborChunk != null) {
                this.neighborChunks[symbolToString(direction)] = neighborChunk;
                // console.log(this.neighborChunks);
            }
        }
    }
    informNeighbors() {
        for (var direction of Object.values(Direction)) {
            if (direction == Direction.Unknown || direction == null) continue;
            // console.log(direction);
            var offset = directionToVector(direction);
            var chunkIndex = vec3.fromValues(this.chunkX, this.chunkY, this.chunkZ);
            var neighborIndex = vec3.create();
            vec3.add(neighborIndex, chunkIndex, offset);
            var neighborChunk = ChunkManager.getChunkByIndex(neighborIndex[0], neighborIndex[1], neighborIndex[2]);
            if (neighborChunk != null) {
                // console.log("INFORMED!!");
                // console.log("invert:");
                // console.log(direction);
                // console.log(invertDirection(direction));
                // console.log(symbolToString(invertDirection(direction)));
                neighborChunk.neighborChunks[symbolToString(invertDirection(direction))] = this;
                // neighborChunk.neighborChunks[symbolToString(direction)] = this;
                // console.log(this.neighborChunks);
                neighborChunk.tryGenerateMesh();
            }
        }
    }
    // get worldHeight(){
    //     return Chunk.CHUNK_COUNT_Y * Chunk.sizeY;
    // }
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
        var biomePerlin = new Perlin();
        biomePerlin.Seed = 123;

        const floor = 4;

        var biomeP = new Perlin();
        biomeP.Seed = Chunk.seed;
        biomeP.Frequency = 0.25;
        biomeP.Persistence = 0.25;
        biomeP.NoiseQuality = NoiseUtil.NoiseQuality.QUALITY_FAST;

        var plainsP = new Perlin();
        plainsP.Seed = Chunk.seed + 1;
        plainsP.Frequency = 0.25;
        plainsP.Persistence = 0.25;
        plainsP.NoiseQuality = NoiseUtil.NoiseQuality.QUALITY_FAST;

        var rockyP = new Perlin();
        rockyP.Seed = Chunk.seed + 2;
        rockyP.Frequency = 0.25;
        rockyP.Persistence = 0.4;
        rockyP.Lacunarity = 2;
        rockyP.NoiseQuality = NoiseUtil.NoiseQuality.QUALITY_FAST;

        const OCEAN_LOWER_THRESHOLD = -0.25;
        const PLAINS_LOWER_THRESHOLD = -0.25;
        const PLAINS_UPPER_THRESHOLD = 0.0;
        const MOUNTAIN_LOWER_THRESHOLD = 0.25;
        const MOUNTAIN_UPPER_THRESHOLD = 0.25;


        for (var y = 0; y < Chunk.sizeY; y++) {
            for (var z = 0; z < Chunk.sizeZ; z++) {
                for (var x = 0; x < Chunk.sizeX; x++) {
                    const worldX = this.chunkX * Chunk.sizeX + x;
                    const worldY = this.chunkY * Chunk.sizeY + y;
                    const worldZ = this.chunkZ * Chunk.sizeZ + z;
                    // FIXME : Currently the chunk size influnces the noise.
                    // Could make noise size independent, but needs some extra math.
                    var sampleX = this.chunkX + x / Chunk.sizeX;
                    var sampleY = this.chunkY + y / Chunk.sizeY;
                    var sampleZ = this.chunkZ + z / Chunk.sizeZ;

                    // const biomeSample = biomeP.GetValue(sampleX, 0, sampleZ);
                    const biomeSample = NoiseSample.SampleBiome(sampleX, 0, sampleZ);
                    const plainSample = NoiseSample.SamplePlains(sampleX, sampleY, sampleZ, worldY);
                    const rockySample = NoiseSample.SampleRocky(sampleX, sampleY, sampleZ, worldY);

                    // TEMP : SOLID BIOME
                    // var value = NoiseSample.SampleRocky(sampleX, sampleY, sampleZ, worldY);
                    // this.setBlock(x, y, z, NoiseSample.checkBlock(value, worldY));
                    // continue;

                    if (biomeSample <= PLAINS_LOWER_THRESHOLD) {
                        // var value = NoiseSample.SamplePlains(sampleX, sampleX, sampleZ, worldY);
                        this.setBlock(x, y, z, NoiseSample.checkBlock(plainSample, worldY));
                    } else if (biomeSample > PLAINS_LOWER_THRESHOLD && biomeSample <= MOUNTAIN_LOWER_THRESHOLD) {
                        // Normalize the sample to 0-1 range. This depends on starting range.
                        var normalSample = (biomeSample + 0.25) * 2;
                        var magic = normalizeRange(PLAINS_LOWER_THRESHOLD, PLAINS_UPPER_THRESHOLD);
                        // var normalSample = biomeSample * magic;
                        // if(plainSample == 0) console.log("ERR");
                        var value = lerp(plainSample, rockySample, normalSample);
                        // var value = plainSample < rockySample ? lerp(plainSample, rockySample, normalSample) :  lerp(rockySample, plainSample, normalSample);
                        var block = NoiseSample.checkBlock(value, worldY);
                        if (block != null) {
                            block = Blocks.Dirt;
                            if (normalSample <= 0) block = Blocks.Sand;
                        }
                        this.setBlock(x, y, z, block);
                    } else {
                        // Rocky Biome
                        // var value = NoiseSample.SampleRocky(sampleX, sampleY, sampleZ, worldY);
                        this.setBlock(x, y, z, NoiseSample.checkBlock(rockySample, worldY));
                    }
                }
            }
        }
    }
    generatePhase2() {
        for (var y = 0; y < Chunk.sizeY; y++) {
            for (var z = 0; z < Chunk.sizeZ; z++) {
                for (var x = 0; x < Chunk.sizeX; x++) {
                    const worldX = this.chunkX * Chunk.sizeX + x;
                    const worldY = this.chunkY * Chunk.sizeY + y;
                    const worldZ = this.chunkZ * Chunk.sizeZ + z;

                    // if(ChunkManager.getBlock(worldX, worldY, worldZ) == Blocks.Stone){
                    //     this.setBlock(x,y,z, Blocks.Sand);
                    // }

                    if (this.getBlock(x, y, z) == Blocks.Grass) {

                        // if (this.getBlock(x, y + 1, z) == null) {
                        // if (ChunkManager.getBlock(worldX, worldY + 1, worldZ) == null) {
                        //     this.setBlock(x, y, z, Blocks.Water);
                        // }
                    }
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
                    if (block != null && block != Blocks.Air) {
                        triCount = this.addVoxelToMesh(triCount, x, y, z, block);
                    }
                }
            }
        }
        this.mesh.useColors = true;
        this.mesh.vertexCount = triCount;
        // this.mesh.vertexCount = vertexCount;
        // this.mesh.vertexCount = this.mesh.vertices.length;
        this.mesh.buffer();
        this.hasGeneratedMesh = true;
    }

    tryGenerateMesh() {
        // console.log("L:" + Object.keys(this.neighborChunks).length);
        if (Object.keys(this.neighborChunks).length >= 0 && !this.hasGeneratedMesh) {
            // console.log("ChunkIndex:" + this.chunkX + ", " + this.chunkY + ", " + this.chunkZ);
            // console.log(Object.keys(this.neighborChunks).length);
            // console.log(Object.keys(this.neighborChunks));
            // console.log(this.neighborChunks);
            this.generateMesh();
        }
    }

    addVoxelToMesh(triCount, x, y, z, block) {
        for (var faceEntry of Object.entries(VoxelMesh.Cube.faces)) {
            const s = 20;
            var p = Math.random() / s;
            for (let face of faceEntry[1]) {
                // Check if the neighbor to this face is a solid block.
                // If so, don't render this face.
                // FIXME : This calculation is done per face but really only needs to be done once per face entry due to the shared normal.
                // Could be moved out one loop. Only complex models will benefit from this optimization anyway.
                var offset = directionToVector(Direction[faceEntry[0]]);
                var pos = vec3.fromValues(x, y, z);
                vec3.add(pos, pos, offset);
                var neighbor = this.getBlock(pos[0], pos[1], pos[2]);
                // TEMP -- OCCLUDE BOTTOM CROSS CHUNK
                if (pos[1] < 0) {
                    var worldPos = this.localChunkPosToWorldPos(pos[0], pos[1], pos[2]);
                    worldPos[1] -= 1;
                    neighbor = ChunkManager.getBlock(worldPos[0], worldPos[1], worldPos[2]);
                }
                if (neighbor != null) continue;

                // Add the face to the chunk mesh.
                for (var i = 0; i < face.vertexCount; i++) {
                    var offsetPos = vec3.create();
                    vec3.add(offsetPos, face.vertices[i], vec3.fromValues(x, y, z));
                    this.mesh.vertices.push(offsetPos);
                    this.mesh.uvs.push(face.uvs[i]);
                    this.mesh.normals.push(face.normals[i]);
                    var rngColor = vec3.fromValues(Math.random(), Math.random(), Math.random());
                    // var c = Chunk.blockColors[symbolToString(block)];

                    var c = Chunk.blockColors[symbolToString(block)];
                    var color = vec3.create();
                    vec3.copy(color, c);
                    // if (this.chunkZ >= 4) color[2] = 1;

                    var p1 = Math.random() / s;
                    var p2 = Math.random() / s;
                    var p3 = Math.random() / s;
                    // color[0] += p1;
                    // color[1] += p2;
                    // color[2] += p3;
                    color[0] += p;
                    color[1] += p;
                    color[2] += p;
                    this.mesh.colors.push(color);
                }
                // Add the triangle data to the chunk mesh
                // FIXME : Add support for 3 point faces!
                if (face.vertexCount == 4) {
                    if (this.mesh.wireframe) {
                        this.mesh.trianglesWireframe.push(triCount);
                        this.mesh.trianglesWireframe.push(triCount + 1);
                        this.mesh.trianglesWireframe.push(triCount + 1);
                        this.mesh.trianglesWireframe.push(triCount + 2);
                        this.mesh.trianglesWireframe.push(triCount + 2);
                        this.mesh.trianglesWireframe.push(triCount + 0);
                        this.mesh.trianglesWireframe.push(triCount + 1);
                        this.mesh.trianglesWireframe.push(triCount + 3);
                        this.mesh.trianglesWireframe.push(triCount + 3);
                        this.mesh.trianglesWireframe.push(triCount);
                        this.mesh.trianglesWireframe.push(triCount);
                        this.mesh.trianglesWireframe.push(triCount + 2);
                        this.mesh.lineCount += 12;
                    } else {
                        this.mesh.triangles.push(triCount);
                        this.mesh.triangles.push(triCount + 1);
                        this.mesh.triangles.push(triCount + 2);
                        this.mesh.triangles.push(triCount + 2);
                        this.mesh.triangles.push(triCount + 3);
                        this.mesh.triangles.push(triCount);
                    }
                    triCount += 4;
                }
            }
        }
        return triCount;
    }
}

class ChunkManager {
    static chunkMap = new Map();
    static worldPosToChunkIndex(worldX, worldY, worldZ) {
        var indexX = Math.floor(worldX / Chunk.sizeX);
        var indexY = Math.floor(worldY / Chunk.sizeY);
        var indexZ = Math.floor(worldZ / Chunk.sizeZ);
        return vec3.fromValues(indexX, indexY, indexZ);
    }
    static worldPosToLocalChunkCoords(worldX, worldY, worldZ) {
        var offsetX = Math.floor(worldX / Chunk.sizeX) * Chunk.sizeX;
        var offsetY = Math.floor(worldY / Chunk.sizeY) * Chunk.sizeY;
        var offsetZ = Math.floor(worldZ / Chunk.sizeZ) * Chunk.sizeZ;
        // console.log(worldX);
        // console.log(offsetX);
        var localX = worldX - offsetX;
        var localY = worldY - offsetY;
        var localZ = worldZ - offsetZ;
        return vec3.fromValues(localX, localY, localZ);
    }
    static getChunkByIndex(indexX, indexY, indexZ) {
        return ChunkManager.chunkMap.get(indexX + "," + indexY + "," + indexZ);
    }
    static getChunk(worldX, worldY, worldZ) {
        const chunkIndex = this.worldPosToChunkIndex(worldX, worldY, worldZ);
        return ChunkManager.getChunkByIndex(chunkIndex[0], chunkIndex[1], chunkIndex[2]);
    }
    static getBlock(x, y, z) {
        const chunk = ChunkManager.getChunk(x, y, z);
        if (chunk == null) return null;
        const localPos = this.worldPosToLocalChunkCoords(x, y, z);
        return chunk.getBlock(localPos[0], localPos[1], localPos[2]);
    }
}

function normalizeRange(lower, upper) {
    var lowerFix = -lower;
    var upperFix = 1 / (upper + lowerFix);
    // value = -lower;
    return upperFix;
}

// Noise Sampling
class NoiseSample {
    static PlainsPerlin = new Perlin();
    static RockyPerlin = new Perlin();
    static BiomePerlin = new Perlin();
    static FLOOR = 4;
    static init(seed) {
        NoiseSample.BiomePerlin.Seed = seed;
        NoiseSample.BiomePerlin.Frequency = 0.1;
        NoiseSample.BiomePerlin.Persistence = 0.25;
        NoiseSample.BiomePerlin.Lacunarity = 2;
        NoiseSample.BiomePerlin.NoiseQuality = NoiseUtil.NoiseQuality.QUALITY_FAST;

        NoiseSample.PlainsPerlin.Seed = seed + 1;
        NoiseSample.PlainsPerlin.Frequency = 0.25;
        NoiseSample.PlainsPerlin.Persistence = 0.25;
        NoiseSample.PlainsPerlin.Lacunarity = 2;
        NoiseSample.PlainsPerlin.NoiseQuality = NoiseUtil.NoiseQuality.QUALITY_FAST;

        NoiseSample.RockyPerlin.Seed = seed + 2;
        NoiseSample.RockyPerlin.Frequency = 0.25;
        NoiseSample.RockyPerlin.Persistence = 0.4;
        NoiseSample.RockyPerlin.Lacunarity = 2;
        NoiseSample.RockyPerlin.NoiseQuality = NoiseUtil.NoiseQuality.QUALITY_FAST;
    }
    static SampleBiome(sampleX, sampleY, sampleZ) {
        var value = NoiseSample.BiomePerlin.GetValue(sampleX, sampleY, sampleZ);
        return value;
    }
    static SamplePlains(sampleX, sampleY, sampleZ, worldY) {
        const HEIGHT_BIAS_INTENSITY = 10;
        var heightBias = worldY / Chunk.worldHeight * HEIGHT_BIAS_INTENSITY;
        var value = NoiseSample.PlainsPerlin.GetValue(sampleX, sampleY, sampleZ);
        value -= heightBias;
        return value;
    }
    static SampleRocky(sampleX, sampleY, sampleZ, worldY) {
        const HEIGHT_BIAS_INTENSITY = 2;
        const VALLEY_BIAS_INTENSITY = 2;
        var heightBias = worldY / Chunk.worldHeight * HEIGHT_BIAS_INTENSITY;
        var valleyBias = (1 - (worldY / Chunk.worldHeight)) * VALLEY_BIAS_INTENSITY;
        var value = NoiseSample.RockyPerlin.GetValue(sampleX, sampleY, sampleZ);
        value -= heightBias;
        value += valleyBias;
        return value;
    }
    static checkBlock(value, worldY) {
        var block = null;
        const STONE_THRESHOLD = -0.55;
        const GRASS_THRESHOLD = -0.75;
        if (value > STONE_THRESHOLD) block = Blocks.Stone;
        else if (value > GRASS_THRESHOLD) block = Blocks.Grass;
        else {
            if (worldY == NoiseSample.FLOOR) {
                block = Blocks.Grass;
            } else if (worldY < NoiseSample.FLOOR) {
                block = Blocks.Stone;
            }
        }
        return block;
    }
}