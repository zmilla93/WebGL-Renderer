function run() {
    const canvas = document.getElementById("glCanvas");
    Engine.init(canvas);

    var litMat = new Material(Shader.simpleLit);

    createGrid();

    // var go = new GameObject();
    // go.add(new MeshRenderer(Mesh.cube, litMat))
    // Camera.main.position[2] = -10;
    Camera.main.position = [0, 2, 10];

    // console.log(cubeModel);
    var voxelModel = objToVoxelMesh(cubeModel);
    // console.log(voxelModel);
    // console.log(VoxelMesh.Cube);

    litMat.uniforms.ambientLight = [0.2, 0.2, 0.2];
    litMat.uniforms.sunlightAngle = vec3.fromValues(0.25, 1, 0.5);
    litMat.uniforms.sunlightColor = vec3.fromValues(1, 1, 1);
    litMat.uniforms.sunlightColor = vec3.fromValues(1, 1, 1);

    noise.seed(Math.random());

    const count = 10;
    const halfCount = count / 2;
    const spacing = 1;
    for (var x = -halfCount; x < halfCount; x++) {
        for (var z = -halfCount; z < halfCount; z++) {
            var value = noise.perlin2(x / 100, z / 100) * 100;
            // console.log(value);
            var gameObject = new GameObject();
            gameObject.position[0] = x * spacing;
            gameObject.position[1] = value;
            gameObject.position[2] = z * spacing;
            // gameObject.add(new MeshRenderer(Mesh.cube, litMat));
        }
    }

    var controller = new GameObject();
    controller.add(new SimpleCameraController());
    // var controller = new GameObject();
    var orthoToggle = new Component();
    // Add controller components to the controller
    // controller.add(new SimpleCameraController());
    controller.add(orthoToggle);
    orthoToggle.update = function () {
        if (Input.wasPressedThisFrame("KeyT")) {
            Camera.main.ortho = !Camera.main.ortho;
        }
    }


    var chunk = new Chunk();

    // 
    // chunk.mesh.createBuffer();
    console.log(chunk.mesh);
    generateChunk(chunk);
    generateMesh(chunk);
    chunk.mesh.buffer();

    console.log(chunk.mesh.triangles.length);

    console.log(chunk.mesh);

    var chunkGO = new GameObject();
    var chunkRenderer = new MeshRenderer(chunk.mesh, litMat);
    chunkGO.add(chunkRenderer);
    

}

window.addEventListener('load', run);