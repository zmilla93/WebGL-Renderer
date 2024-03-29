function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid(5);

    const controller = new GameObject();
    controller.add(new SimpleCameraController());
    controller.add(new ModelCameraController());

    Camera.main.position = [0, 2, 5];
    Camera.main.color = [0.2, 0.2, 0.2];
    Camera.main.setRotation(-45, 45, 0);

    let mat = new Material(Shader.phongShader);

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
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [1, 1, 1],
    ];
    let lightPositions = [
        [-1, 1, 1],
        [1, 1, 1],
        [1, 1, -1],
        [1, 1, 0],
    ]
    for (let i = 0; i < pointLightCount; i++) {
        lights[i].color = lightColors[i];
        lights[i].position = lightPositions[i];
    }

    light4.enabled = false;

    ///////////////
    // MATERIALS //
    ///////////////

    // Ninja Material
    const ninjaDiffuse = document.getElementById("ninjaDiffuse");
    const ninjaSpecular = document.getElementById("ninjaSpecular");
    const ninjaTexture = new Texture(ninjaDiffuse, null, ninjaSpecular);
    const ninjaMaterial = new Material(Shader.phongShader);
    ninjaMaterial.texture = ninjaTexture;

    // Michelle Material
    // const michelleDiffuse = document.getElementById("michelleDiffuse");
    // const michelleSpecular = document.getElementById("michelleSpecular");
    // const michelleTexture = new Texture(michelleDiffuse, null, michelleSpecular);
    // const michelleMaterial = new Material(Shader.phongShader);
    // michelleMaterial.texture = michelleTexture;

    // Vampire Material
    // const vampireDiffuse = document.getElementById("vampire-diffuse");
    // const vampireSpecular = document.getElementById("vampire-specular");
    // const vampireTexture = new Texture(vampireDiffuse, null, vampireSpecular);
    // const vampireMaterial = new Material(Shader.phongShader);
    // vampireMaterial.texture = vampireTexture;

    // Ely Material
    const elyDiffuse = document.getElementById("ely-diffuse");
    const elySpecular = document.getElementById("ely-specular");
    const elyEmission = document.getElementById("ely-emission");
    const elyTexture = new Texture(elyDiffuse, null, elySpecular, elyEmission);
    const elyMaterial = new Material(Shader.phongShader);
    elyMaterial.texture = elyTexture;

    // Mousey Material
    // const mouseyDiffuse = document.getElementById("mousey-diffuse");
    // const mouseySpecular = document.getElementById("mousey-specular");
    // const mouseyTexture = new Texture(mouseyDiffuse, null, mouseySpecular);
    // const mouseyMaterial = new Material(Shader.phongShader);
    // mouseyMaterial.texture = mouseyTexture;

    // Demon Material
    // const demonDiffuse = document.getElementById("demon-diffuse");
    // const demonSpecular = document.getElementById("demon-specular");
    // const demonTexture = new Texture(demonDiffuse, null, demonSpecular);
    // const demonMaterial = new Material(Shader.phongShader);
    // demonMaterial.texture = demonTexture;


    // Assign lights to all materials
    let materials = [ninjaMaterial, elyMaterial, mat];
    for (material of materials) {
        material.setDirectionalLight(directionalLight);
        for (let i = 0; i < pointLightCount; i++) {
            material.setPointLight(i, lights[i]);
        }
    }

    /////////////
    // OBJECTS //
    /////////////

    const ninjaMesh = objToMesh(ninjaModel);
    let ninja = new GameObject();
    ninja.add(new MeshRenderer(ninjaMesh, ninjaMaterial));

    // const michelleMesh = objToMesh(michelleTriModel);
    // let michelle = new GameObject();
    // michelle.add(new MeshRenderer(michelleMesh, michelleMaterial));

    // const vampireMesh = objToMesh(vampireModel);
    // let vampire = new GameObject();
    // vampire.add(new MeshRenderer(vampireMesh, vampireMaterial));

    const elyMesh = objToMesh(elyModel);
    let ely = new GameObject();
    ely.add(new MeshRenderer(elyMesh, elyMaterial));

    // const mouseyMesh = objToMesh(mouseyModel);
    // let mousey = new GameObject();
    // mousey.add(new MeshRenderer(mouseyMesh, mouseyMaterial));

    // const demonMesh = objToMesh(demonModel);
    // let demon = new GameObject();
    // demon.add(new MeshRenderer(demonMesh, demonMaterial));

    let gameObjects = [ninja, ely];
    for (gameObject of gameObjects) {
        gameObject.enabled = false;
    }
    gameObjects[0].enabled = true;

    //////////////
    // CONTROLS //
    //////////////

    // Model Controls
    let modelSelect = document.getElementById("modelSelect");
    let textureCheckbox = document.getElementById("modelTextureCheckbox");
    let specularCheckbox = document.getElementById("modelSpecularCheckbox");
    let modelAlbedo = document.getElementById("modelAlbedo");
    let selectedModel = 0;
    textureCheckbox.checked = true;
    specularCheckbox.checked = true;
    modelSelect.addEventListener("input", function (e) {
        gameObjects[selectedModel].enabled = false;
        selectedModel = parseInt(e.target.value);
        // for (let i = 0; i < gameObjects.length; i++) {
        //     gameObjects[i].enabled = false;
        // }
        gameObjects[selectedModel].enabled = true;
    });
    textureCheckbox.addEventListener("input", function (e) {
        for (material of materials) {
            material.useDiffuseTexture = e.target.checked;
        }
    });
    specularCheckbox.addEventListener("input", function (e) {
        for (material of materials) {
            material.useSpecularTexture = e.target.checked;
        }
    });
    modelAlbedo.addEventListener("input", function (e) {
        let color = hexToRGB(e.target.value);
        for (material of materials) {
            material.albedo = color;
        }
    });

    // Directional Light Controls
    let directionalLightCheckbox = document.getElementById("directionalLightCheckbox");
    let directionalLightColorPicker = document.getElementById("directionalLightColorPicker");

    directionalLightCheckbox.checked = directionalLight.enabled;
    directionalLightCheckbox.addEventListener("input", function (e) {
        directionalLight.enabled = e.target.checked;
    });
    directionalLightColorPicker.value = rgbToHex(directionalLight.color);
    directionalLightColorPicker.addEventListener("input", function (e) {
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