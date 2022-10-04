function run() {
    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);

    Camera.main.position = [0, 2, 10];
    // Camera.main.rotation = [1, 0, 0];

    var litMat = new Material(Shader.simpleLit);
    var unlitMaterial = new Material(Shader.unlitShader);

    unlitMaterial.uniforms.dominatingColor = vec3.fromValues(1, 0, 0);

    var monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, litMat));
    // monster.update = function () {
    //     monster.position[1] = 3 + Math.cos(Time.elapsedTime * 2) * 2;
    // }

    litMat.uniforms.ambientLight = [0.2, 0.2, 0.2];
    litMat.uniforms.sunlightIntensity = 1;
    litMat.uniforms.sunlightAngle = [0, 1, 0];
    litMat.uniforms.sunlightColor = [0, 1, 0];

    var cube = new GameObject();
    cube.add(new MeshRenderer(Mesh.cube, unlitMaterial));

    const count = 10;
    const halfCount = count / 2;
    const spacing = 1;
    for (var x = -halfCount; x < halfCount; x++) {
        for (var z = -halfCount; z < halfCount; z++) {
            var gameObject = new GameObject();
            gameObject.position[0] = x * spacing;
            gameObject.position[1] = 0;
            gameObject.position[2] = z * spacing;
            gameObject.add(new MeshRenderer(Mesh.cube, unlitMaterial));
        }
    }

    var g = new GameObject();
    // console.log(g);
    console.log(this);
    console.log(noise);

    var controller = new GameObject();
    controller.add(new SimpleCameraController());



}

window.addEventListener('load', run);