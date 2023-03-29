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
    phongShader.uniformConverter.ambientIntensity = Rendering.floatConverter;
    phongShader.uniformConverter.lightColor = Rendering.vector3Converter;
    phongShader.uniformConverter.objectColor = Rendering.vector3Converter;
    phongShader.uniformConverter.modelMatrix = Rendering.matrix4Converter;
    phongShader.uniformConverter.lightPos = Rendering.vector3Converter;

    // Monster Material
    const monsterImage = document.getElementById("monsterTexture");
    const monsterTexture = new Texture(monsterImage);
    const monsterMaterial = new Material(phongShader);
    monsterMaterial.lightColor = [1, 1, 1];
    monsterMaterial.ambientColor = [1, 1, 1];
    // monsterMaterial.ambientColor = [175, 60, 60];
    monsterMaterial.ambientIntensity = 0.2;
    monsterMaterial.objectColor = [1, 0.5, 0.31];


    // Monster Object
    var monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMaterial));

    monster.position = [5, 0, -10];
    monster.setRotation(0, 180, 0);
    monster.scale = [2, 2, 2];

    monsterMaterial.modelMatrix = monster.getModelMatrix();


    // Point Light Material
    const light1Material = new Material(Shader.unlitShader);

    // Point Light Object
    var light = new GameObject();
    light.add(new MeshRenderer(Mesh.icoSphere, light1Material));
    light.position = [-3, 3, 3];
    let s = 0.2;
    light.scale = [s, s, s];

    monsterMaterial.lightPos = light.position;

    Camera.main.position = [0, 2, 5];


    // Controls
    // FIXME : Controls need to be set to default shader values or vice versa!
    let ambientColorPicker = document.getElementById("ambientColorPicker");
    let ambientIntensitySlider = document.getElementById("ambientIntensitySlider");
    ambientColorPicker.addEventListener("input", function (e) {
        let color = hexToRGB(e.target.value);
        monsterMaterial.ambientColor = color;
    });
    ambientIntensitySlider.addEventListener("input", function (e) {
        let value = e.target.value;
        monsterMaterial.ambientIntensity = value;
    });
    monster.update = function () {
        let t = Time.elapsedTime * 90;
        monster.setRotation(0, t, 0);
        monsterMaterial.modelMatrix = monster.getModelMatrix();
    }

}

window.addEventListener('load', run);