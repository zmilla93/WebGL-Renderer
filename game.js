function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    // Engine.setupDefaultShaders();

    var mat = new Material(Shader.defaultShader);

    var cube = new GameObject();
    cube.add(new MeshRenderer(Mesh.cube, mat));

    const count = 20;
    const halfCount = count / 2;
    const spacing = 1;
    for (var x = -halfCount; x < halfCount; x++) {
        for (var z = -halfCount; z < halfCount; z++) {
            var gameObject = new GameObject();
            // gameObject.init(gl, cube2);
            gameObject.position[0] = x * spacing;
            gameObject.position[1] = 0;
            gameObject.position[2] = z * spacing;
            var renderer = new MeshRenderer(Mesh.cube, mat);
            gameObject.add(renderer);
        }
    }

    var controller = new GameObject();
    controller.add(new SimpleCameraController());

}

window.onload = run;