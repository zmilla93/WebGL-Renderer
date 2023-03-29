function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid();

    Camera.main.color = [0.5, 1, 0.5];

    var controller = new GameObject();
    controller.add(new SimpleCameraController());

    // Phong Shader


    const phongShader = new Shader("Phong shader", phongVertexSource, phongFragmentSource);

    phongShader.uniformConverter.ambientColor = Rendering.vector3Converter;

    const monsterImage = document.getElementById("monsterTexture");
    const monsterTexture = new Texture(monsterImage);
    const monsterMaterial = new Material(phongShader);
    var monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMaterial));

    monsterMaterial.uniform.ambientColor = [1, 0, 0];

    Camera.main.position = [0, 2, 5];
    // Camera.main.rotation = [0, 3.14 / 2, 0];
    // Camera.main.setRotation(-45 * DEG2RAD, 90 * DEG2RAD, 0);

}

window.addEventListener('load', run);