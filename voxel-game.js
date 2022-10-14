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
    const chunkCountXZ = 20;
    const chunkCountY = 4;
    const halfCountXZ = Math.round(chunkCountXZ / 2);

    Chunk.seed = Math.floor(Math.random() * 50000);
    Chunk.worldHeight = Chunk.sizeY * chunkCountY;

    Engine.maxActionsPerFrame = 1;
    for (var x = -halfCountXZ; x < halfCountXZ; x++) {
        for (var z = -halfCountXZ; z < halfCountXZ; z++) {
            for (var y = 0; y < chunkCountY; y++) {
                const finalX = x;
                const finalY = y;
                const finalZ = z;
                Engine.queueAction(function () {
                    var chunk = new Chunk(finalX, finalY, finalZ);
                    chunk.createGameObject(litMat);
                    chunk.generateChunk();
                    chunk.generateMesh();
                    chunk.mesh.freeData();
                });
            }
        }
    }

    // Create a camera controller
    var controller = new GameObject();
    controller.add(new SimpleCameraController());
    var orthoToggle = new Component();
    controller.add(orthoToggle);
    orthoToggle.update = function () {
        if (Input.wasPressedThisFrame("KeyT")) {
            Camera.main.ortho = !Camera.main.ortho;
        }
    }

}

window.addEventListener('load', run);