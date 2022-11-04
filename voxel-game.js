function run() {
    // Initialize the engine.
    // This sets up default shaders, meshes, and input handling.
    const canvas = document.getElementById("glCanvas");
    Engine.init(canvas);

    createGrid();

    // Move the main camera
    Camera.main.position = [0, 60, 30];

    // Create a material using the default lit shader.
    var litMat = new Material(Shader.simpleLit);

    // Set lighting values
    litMat.uniforms.ambientLight = [0.75, 0.75, 0.75];
    litMat.uniforms.sunlightIntensity = 0.5;
    litMat.uniforms.sunlightAngle = vec3.fromValues(0.25, 1, 0.5);
    litMat.uniforms.sunlightColor = vec3.fromValues(1, 1, 1);
    litMat.uniforms.skyColor = vec3.fromValues(1, 0, 0);

    // Initialize world settings
    const chunkCountXZ = 12;
    Chunk.CHUNK_COUNT_Y = 6;
    Chunk.worldHeight = Chunk.sizeY * Chunk.CHUNK_COUNT_Y;
    const halfCountXZ = Math.round((chunkCountXZ + 2) / 2);
    Chunk.seed = 798472;
    Chunk.seed = Math.floor(Math.random() * 50000);
    NoiseSample.init(Chunk.seed);

    // The action queue allows functions to be run over many frames.
    // This will be used for chunk generation.
    Engine.maxActionsPerFrame = 2;

    // Create Chunks
    for (var x = -halfCountXZ; x < halfCountXZ; x++) {
        for (var z = -halfCountXZ; z < halfCountXZ; z++) {
            for (var y = 0; y < Chunk.CHUNK_COUNT_Y; y++) {
                // Need constant versions of variables for saving into the map.
                const finalX = x;
                const finalY = y;
                const finalZ = z;
                // Queue a chunk to be generated.
                Engine.queueAction(function () {
                    var chunk = new Chunk(finalX, finalY, finalZ);
                    var key = finalX + "," + finalY + "," + finalZ;
                    ChunkManager.chunkMap.set(key, chunk);
                    chunk.createGameObject(litMat);
                    // chunk.mesh.setWireframe(true);
                    chunk.generateChunk();
                    chunk.generatePhase2();
                    chunk.findNeighbors();
                    chunk.informNeighbors();
                    chunk.generateMesh();
                });
            }
        }
    }

    // Game object to hold controller components
    var controller = new GameObject();

    // Camera controller
    var cameraController = new SimpleCameraController();
    cameraController.walkSpeed = 10;
    cameraController.runSpeed = 40;
    controller.add(cameraController);

    // Othographic toggle
    var orthoToggle = new Component();
    orthoToggle.update = function () {
        if (Input.wasPressedThisFrame("KeyT")) {
            Camera.main.ortho = !Camera.main.ortho;
        }
    }
    controller.add(orthoToggle);
}

window.addEventListener('load', run);