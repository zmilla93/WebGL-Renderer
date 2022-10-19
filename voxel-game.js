function run() {
    const canvas = document.getElementById("glCanvas");
    Engine.init(canvas);
    const gl = Engine.gl;

    var litMat = new Material(Shader.simpleLit);

    createGrid();
    Camera.main.position = [0, 60, 30];

    litMat.uniforms.ambientLight = [0.75, 0.75, 0.75];
    // litMat.uniforms.ambientLight = [17 / 255, 20 / 255, 54 / 255];  // Night
    litMat.uniforms.sunlightIntensity = 0.5;
    litMat.uniforms.sunlightAngle = vec3.fromValues(0.25, 1, 0.5);
    litMat.uniforms.sunlightColor = vec3.fromValues(1, 1, 1);
    litMat.uniforms.skyColor = vec3.fromValues(1, 0, 0);
    // litMat.uniforms.sunlightColor = vec3.fromValues(1, 0.5, 0.5);

    // Create Chunks
    const chunkCountXZ = 10;
    // const chunkCountY = 4;
    Chunk.CHUNK_COUNT_Y = 4;
    const halfCountXZ = Math.round(chunkCountXZ / 2);

    Chunk.seed = 798472;
    // Chunk.seed = Math.floor(Math.random() * 50000);
    Chunk.worldHeight = Chunk.sizeY * Chunk.CHUNK_COUNT_Y;

    NoiseSample.init(Chunk.seed);

    Engine.maxActionsPerFrame = 1;


    console.log(ChunkManager.worldPosToLocalChunkCoords(22, 5, 0));

    for (var x = -halfCountXZ; x < halfCountXZ; x++) {
        for (var z = -halfCountXZ; z < halfCountXZ; z++) {
            for (var y = 0; y < Chunk.CHUNK_COUNT_Y; y++) {
                const finalX = x;
                const finalY = y;
                const finalZ = z;
                Engine.queueAction(function () {
                    var chunk = new Chunk(finalX, finalY, finalZ);
                    var key = finalX + "," + finalY + "," + finalZ;
                    ChunkManager.chunkMap.set(key, chunk);
                    chunk.createGameObject(litMat);
                    // chunk.mesh.setWireframe(true);
                    chunk.generateChunk();
                    chunk.generatePhase2();
                    // chunk.findNeighbors();
                    chunk.informNeighbors();
                    // chunk.generateMesh();
                    chunk.tryGenerateMesh();
                    // chunk.mesh.freeData();
                });
            }
        }
    }

    Engine.queueAction(function () {
        console.log("DATA:::::");
        console.log(ChunkManager.chunkMap);
    });

    // Create a camera controller
    var controller = new GameObject();
    var cameraController = new SimpleCameraController();
    cameraController.walkSpeed = 10;
    cameraController.runSpeed = 40;
    controller.add(cameraController);
    var orthoToggle = new Component();
    controller.add(orthoToggle);
    orthoToggle.update = function () {
        if (Time.deltaTime > 0.1)
            console.log(Time.deltaTime);
        if (Input.wasPressedThisFrame("KeyT")) {
            Camera.main.ortho = !Camera.main.ortho;

        }
    }

}

window.addEventListener('load', run);