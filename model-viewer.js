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
    for (let i = 0; i < pointLightCount; i++) {
        lights[i].color = lightColors[i];
        lights[i].position = lightPositions[i];
    }

    // directionalLight.enabled = false;
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

    // Directional Light Controls
    let directionalLightCheckbox = document.getElementById("directionalLightCheckbox");
    let directionalLightColorPicker = document.getElementById("directionalLightColorPicker");

    directionalLightCheckbox.checked = directionalLight.enabled;
    directionalLightCheckbox.addEventListener("input", function (e) {
        directionalLight.enabled = e.target.checked;
    });
    directionalLightColorPicker.value = rgbToHex(directionalLight.color);
    directionalLightColorPicker.addEventListener("input", function(e){
        directionalLight.color = hexToRGB(e.target.value);
    });

    // Point Light Controls
    let pointLightColorPickers = document.getElementsByClassName("pointLightColorPicker");
    let pointLightCheckboxes = document.getElementsByClassName("pointLightCheckbox");
    let pointLightPosX = document.getElementsByClassName("pointLightX");
    let pointLightPosY = document.getElementsByClassName("pointLightY");
    let pointLightPosZ = document.getElementsByClassName("pointLightZ");

    for (let i = 0; i < pointLightCount; i++) {
        // Checkbox
        pointLightCheckboxes[i].checked = lights[i].enabled;
        pointLightCheckboxes[i].addEventListener("input", function (e) {
            lights[i].enabled = e.target.checked;
        });
        // Color Picker
        pointLightColorPickers[i].value = rgbToHex(lightColors[i]);
        pointLightColorPickers[i].addEventListener("input", function (e) {
            let color = hexToRGB(e.target.value);
            lights[i].color = color;
        });
        // Position Selector
        let position = lights[i].position;
        pointLightPosX[i].value = position[0];
        pointLightPosY[i].value = position[1];
        pointLightPosZ[i].value = position[2];
        pointLightPosX[i].addEventListener("input", function (e) {
            let curPos = lights[i].position;
            let value = parseFloat(e.target.value);
            lights[i].position = [value, curPos[1], curPos[2]];
        });
        pointLightPosY[i].addEventListener("input", function (e) {
            let curPos = lights[i].position;
            let value = parseFloat(e.target.value);
            lights[i].position = [curPos[0], value, curPos[2]];
        });
        pointLightPosZ[i].addEventListener("input", function (e) {
            let curPos = lights[i].position;
            let value = parseFloat(e.target.value);
            lights[i].position = [curPos[0], curPos[1], value];
        });
    }
}

window.addEventListener('load', run);