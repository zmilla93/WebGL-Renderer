
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
    static CHUNK_SIZE = 20;
    static sizeX = Chunk.CHUNK_SIZE;
    static sizeY = Chunk.CHUNK_SIZE;
    static sizeZ = Chunk.CHUNK_SIZE;
    static blockColors = {
        Grass: [68 / 255, 130 / 255, 33 / 255],
        Stone: [117 / 255, 127 / 255, 143 / 255],
        Dirt: [79 / 255, 58 / 255, 11 / 255],
        Sand: [199 / 255, 193 / 255, 74 / 255],
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
                    const worldY = this.chunkY * Chunk.sizeY + y;
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
        this.mesh.vertexCount = vertexCount;
        this.mesh.buffer();
    }

    addVoxelToMesh(triCount, x, y, z, block) {
        for (var faceEntry of Object.entries(VoxelMesh.Cube.faces)) {
            const s = 10;
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
                    color[0] += p1;
                    color[1] += p2;
                    color[2] += p3;
                    color[0] += p;
                    color[1] += p;
                    color[2] += p;
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