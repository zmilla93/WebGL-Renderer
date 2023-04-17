function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid(5);

    const controller = new GameObject();
    controller.add(new SimpleCameraController());
    Camera.main.position = [0, 2, 5];
    Camera.main.color = [0.2, 0.2, 0.2];

    ////////////
    // MESHES //
    ////////////
    const michelleMesh = objToMesh(michelleTriModel);

    ////////////
    // LIGHTS //
    ////////////

    // Directional Light
    let directionalLight = new DirectionalLight();
    directionalLight.direction = [1, -1, -0.5];
    directionalLight.ambient = [0.2, 0.2, 0.2];
    directionalLight.color = [1, 1, 1];

    // Point Lights
    const pointLightCount = 4;
    let light1 = PointLight.create();
    let light2 = PointLight.create();
    let light3 = PointLight.create();
    let light4 = PointLight.create();
    let lights = [light1, light2, light3, light4];

    // Point Light Properties
    let lightColors = [
        [1, 1, 1],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ];
    let lightPositions = [
        [2, 1, 0],
        [-2, 1, 0],
        [0, 1, 2],
        [0, 1, -2],
    ]
    for(let i = 0;i<pointLightCount;i++){
        lights[i].color = lightColors[i];
        lights[i].position = lightPositions[i];
    }

    directionalLight.enabled = false;
    light1.enabled = false;

    ///////////////
    // MATERIALS //
    ///////////////

    // Monster Material
    const monsterImage = document.getElementById("monsterTexture");
    const monsterTexture = new Texture(monsterImage);
    const monsterMaterial = new Material(Shader.phongShader);
    monsterMaterial.texture = monsterTexture;

    // Michelle Material
    const michelleDiffuse = document.getElementById("michelleDiffuse");
    const michelleSpecular = document.getElementById("michelleSpecular");
    const michelleTexture = new Texture(michelleDiffuse, null, michelleSpecular);
    const michelleMaterial = new Material(Shader.phongShader);
    michelleMaterial.texture = michelleTexture;

    // Assign lights to all materials
    let materials = [monsterMaterial, michelleMaterial];
    for (material of materials) {
        material.setDirectionalLight(directionalLight);
        for (let i = 0; i < pointLightCount; i++) {
            material.setPointLight(i, lights[i]);
        }
    }

    /////////////
    // OBJECTS //
    /////////////

    // Monster Object
    let monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMaterial));
    monster.enabled = false;

    let michelle = new GameObject();
    michelle.add(new MeshRenderer(michelleMesh, michelleMaterial));

    //////////////
    // CONTROLS //
    //////////////

    // FIXME : Controls need to be set to default shader values or vice versa!
    let ambientColorPicker = document.getElementById("ambientColorPicker");
    let ambientIntensitySlider = document.getElementById("ambientIntensitySlider");
    let pointlight1Checkbox = document.getElementById("pointLight1Checkbox");
    let pointlight1X = document.getElementById("pointLight1X");
    let pointlight1Y = document.getElementById("pointLight1Y");
    let pointlight1Z = document.getElementById("pointLight1Z");

    pointlight1Checkbox.addEventListener("input", function (e) {
        let value = e.target.checked;
        pointLight1.enabled = value;
    });
    ambientColorPicker.addEventListener("input", function (e) {
        let color = hexToRGB(e.target.value);
        pointLight1.color = color;
    });
    // ambientIntensitySlider.addEventListener("input", function (e) {
    //     let value = e.target.value;
    //     console.log(value);
    //     pointLight1.ambientIntensity = value;
    // });

    pointlight1X.addEventListener("input", function (e) {
        let value = e.target.value;
        let oldPos = pointLight1.position;
        pointLight1.gameObject.position = [value, oldPos[1], oldPos[2]];
    });
    pointlight1Y.addEventListener("input", function (e) {
        let value = e.target.value;
        let oldPos = pointLight1.position;
        pointLight1.gameObject.position = [oldPos[0], value, oldPos[2]];
    });
    pointlight1Z.addEventListener("input", function (e) {
        let value = e.target.value;
        let oldPos = pointLight1.position;
        pointLight1.gameObject.position = [oldPos[0], oldPos[1], value];
    });

}

window.addEventListener('load', run);