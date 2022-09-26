function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    // Engine.setupDefaultShaders();

    // var mat = new Material(Shader.unlitShader, function () {
    //     Engine.gl.uniform3f(Shader.unlitShader.uniform("dominatingColor"), 1, 0.5, 0.31);
    // });
    var mat = new Material(Shader.unlitShader);

    // mat.uniforms.color = vec3.fromValues(1, 0, 0);
    // Shader.unlitShader.uniformConverter.color(mat);

    // console.log(Shader.unlitShader);
    // console.log(Shader.unlitShader.attributes[0]);

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
            gameObject.add(new MeshRenderer(Mesh.cube, mat));
        }
    }

    var controller = new GameObject();
    controller.add(new SimpleCameraController());

}

window.onload = run;