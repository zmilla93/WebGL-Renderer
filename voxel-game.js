function run(){
    const canvas = document.getElementById("glCanvas");
    Engine.init(canvas);

    var litMat = new Material(Shader.simpleLit);

    var go = new GameObject();
    go.add(new MeshRenderer(Mesh.cube, litMat))
    // Camera.main.position[2] = -10;
    Camera.main.position[2] = 10;

    noise.seed(Math.random());

    const count = 10;
    const halfCount = count / 2;
    const spacing = 1;
    for (var x = -halfCount; x < halfCount; x++) {
        for (var z = -halfCount; z < halfCount; z++) {
            var value = noise.perlin2(x/100, z/100) * 100;
            console.log(value);

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