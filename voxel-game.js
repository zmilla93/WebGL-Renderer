function run() {
    const canvas = document.getElementById("glCanvas");
    Engine.init(canvas);

    var litMat = new Material(Shader.simpleLit);

    var go = new GameObject();
    go.add(new MeshRenderer(Mesh.cube, litMat))
    // Camera.main.position[2] = -10;
    Camera.main.position[2] = 10;

    // console.log(cubeModel);
    var voxelModel = objToVoxelModel(cubeModel);

    // Shader.simpleLit.sunlightAngle = [0,1,0];
    // Shader.simpleLit.uniform.sunlightColor = [0, 0.5, 0];
    // Shader.simpleLit.uniform.ambientLight = [0.2, 0.2, 0.2];
    // Shader.simpleLit.uniforms.ambientLight = vec3.fromValues(1,0,0);

    // litMat.uniforms.dominatingColor = vec3.fromValues(1, 0.5, 0.31);
    // litMat.uniforms.ambientLight = vec3.fromValues(1, 0.5, 0.31);
    // litMat.uniforms.ambientLight = vec3.fromValues(0.2, 0.2, 0.2);
    litMat.uniforms.ambientLight = [0.2, 0.2, 0.2];
    litMat.uniforms.sunlightAngle = vec3.fromValues(0, 1, 0);
    litMat.uniforms.sunlightColor = vec3.fromValues(1, 1, 1);
    litMat.uniforms.sunlightColor = vec3.fromValues(0,1,0);

    console.log(voxelModel);

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
            gameObject.add(new MeshRenderer(Mesh.cube, litMat));
        }
    }

    var controller = new GameObject();
    controller.add(new SimpleCameraController());
}

window.addEventListener('load', run);