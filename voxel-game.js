function run() {
    // Initialize the engine.
    // This sets up default shaders, meshes, and input handling.
    const canvas = document.getElementById("glCanvas");
    Engine.init(canvas);

    createGrid();

    // Move the main camera
    Camera.main.position = [0, 60, 30];
    Camera.main.farPlane = 500;
    Camera.main.calculateProjectionMatrix();

    Block.initBlocks();

    // Create a material using the default lit shader.
    var textureLitShader = new Shader("Texture Lit Shader", textureLitVertexSource, textureLitFragmentSource);
    var atlas = createTextureAtlas();
    console.log(atlas);

    Block.bindTextures(atlas.uvLookup);

    const textureCanvas = document.getElementById("textureCanvas");
    const images = document.getElementsByClassName("texture");
    const texture = new Texture(textureCanvas, TextureFilter.Nearest);

    console.log(Block.list);

    var textureMat = new Material(textureLitShader);
    textureMat.texture = texture;
    var litMat = new Material(Shader.simpleLit);

    // Set lighting values
    litMat.ambientLight = [0.75, 0.75, 0.75];
    litMat.sunlightIntensity = 0.5;
    litMat.sunlightAngle = vec3.fromValues(0.25, 1, 0.5);
    litMat.sunlightColor = vec3.fromValues(1, 1, 1);

    textureLitShader.uniformConverter.ambientLight = Rendering.vector3Converter;
    textureLitShader.uniformConverter.sunlightAngle = Rendering.vector3Converter;
    textureLitShader.uniformConverter.sunlightColor = Rendering.vector3Converter;
    textureLitShader.uniformConverter.sunlightIntensity = Rendering.floatConverter;

    textureMat.ambientLight = [0.75, 0.75, 0.75];
    textureMat.sunlightIntensity = 1.5;
    textureMat.sunlightAngle = vec3.fromValues(0.25, 1, 0.5);
    textureMat.sunlightColor = vec3.fromValues(1, 1, 1);

    const skyColor = [121 / 255, 220 / 255, 237 / 255];
    Camera.main.color = skyColor;
    litMat.skyColor = skyColor;

    // Initialize world settings
    const chunkCountXZ = 10;
    Chunk.CHUNK_COUNT_Y = 4;
    Chunk.worldHeight = Chunk.sizeY * Chunk.CHUNK_COUNT_Y;
    const halfCountXZ = Math.round((chunkCountXZ + 2) / 2);
    Chunk.seed = 798472;
    Chunk.seed = Math.floor(Math.random() * 50000);
    NoiseSample.init(Chunk.seed);

    // The action queue allows functions to be run over many frames.
    // This will be used for chunk generation.
    // Increase for faster generation at the cost of fps.
    Engine.maxActionsPerFrame = 2;

    const slider = document.getElementById("sunAngle");
    const sliderX = document.getElementById("sunAngleX");
    const sliderY = document.getElementById("sunAngleY");
    const sliderZ = document.getElementById("sunAngleZ");
    slider.oninput = function () {
        var vector = vec3.fromValues(0, 1, 0);
        var value = vec3.create();
        var angleX = sliderX.value;
        var angleY = sliderY.value;
        var angleZ = sliderZ.value;
        vec3.rotateX(value, vector, VECTOR3_ZERO, angle * DEG2RAD);
        // litMat.sunlightAngle = vec3.fromValues(0.25, 1, 0.5);
        litMat.sunlightAngle = value;
        // console.log(slider.value);
    }

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
                    ChunkManager.chunkMap.set(chunk.getKey(), chunk);
                    chunk.createGameObject(litMat);
                    // chunk.mesh.setWireframe(true);
                    chunk.generateChunk();
                    chunk.generatePhase2();
                    chunk.findNeighbors();
                    chunk.informNeighbors();
                    // chunk.generateMesh();
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

    console.log(VoxelMesh.Cube);

    // Othographic toggle
    var orthoToggle = new Component();
    orthoToggle.update = function () {
        if (Input.wasPressedThisFrame("KeyT")) {
            Camera.main.ortho = !Camera.main.ortho;
        }
    }
    controller.add(orthoToggle);

    var useTexture = false;
    // Fog Controller
    const fogLevels = [100, 150, 200, 250, 300];
    var curFogLevel = fogLevels.length - 1;
    const fogController = new Component();
    litMat.viewDistance = fogLevels[curFogLevel];
    fogController.update = function () {
        if (Input.wasPressedThisFrame("KeyF")) {
            curFogLevel++;
            if (curFogLevel >= fogLevels.length) curFogLevel = 0;
            litMat.viewDistance = fogLevels[curFogLevel];
        }
        if (Input.wasPressedThisFrame("KeyM")) {
            // useTexture = !useTexture;
            // if(useTexture)
        }
    }
    controller.add(fogController);
}

window.addEventListener('load', run);