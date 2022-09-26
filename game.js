function run() {
    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);

    var litMat = new Material(Shader.simpleLit);
    var unlitMaterial = new Material(Shader.unlitShader);

    unlitMaterial.uniforms.dominatingColor = vec3.fromValues(1, 0, 0);

    var monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, litMat));
    // monster.update = function () {
    //     monster.position[1] = 3 + Math.cos(Time.elapsedTime * 2) * 2;
    // }

    var cube = new GameObject();
    cube.add(new MeshRenderer(Mesh.cube, unlitMaterial));

    const count = 20;
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

    var controller = new GameObject();
    controller.add(new SimpleCameraController());

}

window.onload = run;