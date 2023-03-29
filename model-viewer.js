function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid();

    Camera.main.color = [0.5, 1, 0.5];

    var controller = new GameObject();
    controller.add(new SimpleCameraController());

    // Phong Shader
    const phongShader = new Shader("Phong shader", phongVertexSource, phongFragmentSource);
    // Phong uniform converts
    phongShader.uniformConverter.ambientColor = Rendering.vector3Converter;
    phongShader.uniformConverter.objectColor = Rendering.vector3Converter;



    // Monster Material
    const monsterImage = document.getElementById("monsterTexture");
    const monsterTexture = new Texture(monsterImage);
    const monsterMaterial = new Material(phongShader);
    monsterMaterial.ambientColor = [1, 1, 1];
    monsterMaterial.objectColor = [1, 0.5, 0.31];

    // Monster Object
    var monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMaterial));

    // Point Light Material
    const light1Material = new Material(Shader.unlitShader);

    // Point Light Object
    var light = new GameObject();
    light.add(new MeshRenderer(Mesh.icoSphere, light1Material));
    light.position = [3, 3, -3];

    Camera.main.position = [0, 2, 5];

}

window.addEventListener('load', run);