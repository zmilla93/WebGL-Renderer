function run() {
    const canvas = document.getElementById("glCanvas");
    Engine.init(canvas);
    const gl = Engine.gl;

    var litMat = new Material(Shader.simpleLit);

    createGrid();
    Camera.main.position = [0, 15, 30];

    // console.log(cubeModel);
    // var voxelModel = objToVoxelMesh(cubeModel);

    litMat.uniforms.ambientLight = [0.2, 0.2, 0.2];
    litMat.uniforms.sunlightAngle = vec3.fromValues(0.25, 1, 0.5);
    litMat.uniforms.sunlightColor = vec3.fromValues(1, 1, 1);
    litMat.uniforms.sunlightColor = vec3.fromValues(1, 1, 1);

    noise.seed(Math.random());

    Chunk.seed = Math.floor(Math.random() * 50000);
    const count = 20;
    const halfCount = count / 2;
    for (var x = -halfCount; x < halfCount; x++) {
        for (var z = -halfCount; z < halfCount; z++) {
            const finalX = x;
            const finalZ = z;
            Engine.queueAction(function () {
                var chunk = new Chunk(finalX, 0, finalZ);
                chunk.createGameObject(litMat);
                chunk.generateChunk();
                chunk.generateMesh();
                chunk.mesh.freeData();
            });
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