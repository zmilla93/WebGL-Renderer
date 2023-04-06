function run() {

    console.profile("gl");

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid();

    Camera.main.color = [0.5, 1, 0.5];

    var controller = new GameObject();
    controller.add(new SimpleCameraController());

    // Phong Shader
    const phongShader = new LitShader("Phong shader", phongVertexSource, phongFragmentSource);
    // Phong uniform converts
    phongShader.uniformConverter.ambientColor = Rendering.vector3Converter;
    phongShader.uniformConverter.ambientIntensity = Rendering.floatConverter;
    phongShader.uniformConverter.lightColor = Rendering.vector3Converter;
    phongShader.uniformConverter.objectColor = Rendering.vector3Converter;
    // phongShader.uniformConverter.modelMatrix = Rendering.matrix4Converter;
    phongShader.uniformConverter.lightPos = Rendering.vector3Converter;
    phongShader.uniformConverter.cameraPos = Rendering.vector3Converter;
    phongShader.uniformConverter.specularStrength = Rendering.floatConverter;
    phongShader.uniformConverter.useDiffuseTexture = Rendering.boolConverter;
    phongShader.uniformConverter.useSpecularTexture = Rendering.boolConverter;
    phongShader.uniformConverter.useNormalTexture = Rendering.boolConverter;
    phongShader.uniformConverter.diffuseSampler = Rendering.intConverter;
    phongShader.uniformConverter.normalSampler = Rendering.intConverter;
    phongShader.uniformConverter.specularSampler = Rendering.intConverter;

    // Textures
    let pavingStoneDiffuse = document.getElementById("pavingStonesDiffuse");
    let pavingStoneNormal = document.getElementById("pavingStonesDiffuse");
    let pavingStoneSpecular = document.getElementById("pavingStonesDiffuse");
    let pavingStonesTexture = new Texture(pavingStoneDiffuse, pavingStoneNormal, pavingStoneSpecular);

    let directionalLight = new DirectionalLight();
    directionalLight.direction = [1, -1, -0.5];
    directionalLight.ambient = [0.2, 0.2, 0.2];
    directionalLight.diffuse = [1, 1, 1];
    directionalLight.specular = [0.3, 0.3, 0.3];

    const light1Material = new Material(Shader.unlitShader);


    let pointLight1Pos = [4, 3, 0];
    let pointLight1GO = new GameObject();
    pointLight1GO.add(new MeshRenderer(Mesh.sphere, light1Material));
    pointLight1GO.position = pointLight1Pos;
    pointLight1GO.scale = [0.2, 0.2, 0.2];

    let pointLight1 = new PointLight();
    pointLight1.position = pointLight1Pos;
    pointLight1.color = [1, 0, 0];
    pointLight1.ambient = [0.2, 0.2, 0.2];
    pointLight1.linear = 0.09;
    pointLight1.quadratic = 0.032;

    // directionalLight.specular = [1,0,0];

    // Monster Material
    const monsterImage = document.getElementById("monsterTexture");
    const monsterTexture = new Texture(monsterImage);
    const monsterMaterial = new Material(phongShader);
    monsterMaterial.useDiffuseTexture = true;
    monsterMaterial.useSpecularTexture = false;
    monsterMaterial.texture = monsterTexture;
    monsterMaterial.lightColor = [1, 1, 1];
    monsterMaterial.ambientColor = [1, 1, 1];
    monsterMaterial.ambientIntensity = 0.2;
    monsterMaterial.objectColor = [1, 0.5, 0.31];
    monsterMaterial.specularStrength = 0.5;
    monsterMaterial.setDirectionalLight(directionalLight);
    // monsterMaterial["directionalLight.diffuse"] = [1, 1, 1];
    // monsterMaterial["directionalLight.ambient"] = [0.2, 0.2, 0.2];
    // monsterMaterial["directionalLight.specular"] = [1, 1, 1];
    // monsterMaterial["directionalLight.direction"] = [0, 0, 1];
    // monsterMaterial["directionalLight.direction"] = [0, 0, 1];
    // monsterMaterial.diffuseSampler = 0;
    // monsterMaterial.specularSampler = 2;

    const phongMaterial = new Material(phongShader);
    phongMaterial.lightColor = [1, 1, 1];
    phongMaterial.ambientColor = [1, 1, 1];
    phongMaterial.ambientIntensity = 0.2;
    phongMaterial.objectColor = [1, 0.5, 0.31];
    phongMaterial.specularStrength = 0.5;
    phongMaterial.useDiffuseTexture = false;
    phongMaterial.useSpecularTexture = false;
    phongMaterial.useNormalTexture = false;
    phongMaterial.setDirectionalLight(directionalLight);
    phongMaterial.setPointLight(0, pointLight1);
    // phongMaterial["directionalLight.direction"] = [1, -1, 0];
    // phongMaterial["directionalLight.diffuse"] = [1, 1, 1];
    // phongMaterial["directionalLight.ambient"] = [0.2, 0.2, 0.2];
    // phongMaterial["directionalLight.specular"] = [1, 1, 1];

    const boxMaterial = new Material(phongShader);
    const boxDiffuse = document.getElementById("boxDiffuseTexture");
    const boxSpecular = document.getElementById("boxSpecularTexture");
    let boxTexture = new Texture(boxDiffuse, null, boxSpecular);
    boxMaterial.useDiffuseTexture = true;
    boxMaterial.useNormalTexture = true;
    boxMaterial.useSpecularTexture = true;
    // boxMaterial.texture = boxTexture;
    boxMaterial.texture = pavingStonesTexture;
    boxMaterial.lightColor = [1, 1, 1];
    boxMaterial.ambientColor = [1, 1, 1];
    boxMaterial.ambientIntensity = 0.2;
    boxMaterial.objectColor = [1, 0.5, 0.31];
    boxMaterial.specularStrength = 1;


    // boxMaterial.setDirectionalLight(directionalLight);


    // boxMaterial["directionalLight.direction"] = [1, -1, 0.5];
    // // boxMaterial["directionalLight.direction"] = [0, -1, 0];
    // boxMaterial["directionalLight.diffuse"] = [1, 1, 1];
    // boxMaterial["directionalLight.ambient"] = [0.2, 0.2, 0.2];
    // boxMaterial["directionalLight.specular"] = [1, 1, 1];
    // boxMaterial["directionalLight.specular"] = [0.5, 0.5, 0.5];
    // boxMaterial.diffuseSampler = 0;
    // boxMaterial.specularSampler = 2;

    // Monster Object
    var monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMaterial));

    var monster2 = new GameObject();
    monster2.add(new MeshRenderer(Mesh.monster2, monsterMaterial));

    monster.position = [-1, 0, -10];
    monster2.position = [1, 0, -10];
    // monster.setRotation(0, 180, 45);
    // monster.scale = [2, 2, 2];
    // console.log(monster.rotation);

    // monsterMaterial.modelMatrix = monster.getModelMatrix();

    // SPHERE
    var sphere = new GameObject();
    sphere.add(new MeshRenderer(Mesh.icoSphere, phongMaterial));
    sphere.position = [-4, 1, 0];

    var sphere2 = new GameObject();
    sphere2.add(new MeshRenderer(Mesh.icoSmooth, phongMaterial));
    sphere2.position = [4, 1, 0];

    var sphere3 = new GameObject();
    sphere3.add(new MeshRenderer(Mesh.smoothSphere, phongMaterial));
    sphere3.position = [-4, 1, -5];

    // BOX
    var box = new GameObject();
    box.add(new MeshRenderer(Mesh.cube, boxMaterial));
    box.position = [0, 0.5, -2];
    box.setRotation(0, 45, 0);

    var plane = new GameObject();
    plane.add(new MeshRenderer(Mesh.quad, boxMaterial));
    plane.position = [0, 0.01, -4];
    var planeScale = 1;
    plane.scale = [planeScale, 1, planeScale];
    // plane.setRotation(90, 0, 0);

    // Point Light Material


    // Point Light Object
    var light = new GameObject();
    light.add(new MeshRenderer(Mesh.smoothSphere, light1Material));
    // light.position = [0, 5, -6];
    light.position = [0, 3, -8];
    let s = 0.2;
    light.scale = [s, s, s];

    // monsterMaterial.lightPos = light.position;

    // monsterMaterial["pointLight[0].position"] = light.position;
    // monsterMaterial["pointLight[0].ambient"] = [0.2, 0.2, 0.2];
    // monsterMaterial["pointLight[0].diffuse"] = [1, 1, 1];
    // monsterMaterial["pointLight[0].specular"] = [1, 1, 1];
    // monsterMaterial["pointLight[0].constant"] = 1;
    // monsterMaterial["pointLight[0].linear"] = 0.14;
    // monsterMaterial["pointLight[0].quadratic"] = 0.07;

    // phongMaterial["pointLight[0].position"] = light.position;
    // phongMaterial["pointLight[0].ambient"] = [0.2, 0.2, 0.2];
    // phongMaterial["pointLight[0].diffuse"] = [1, 1, 1];
    // phongMaterial["pointLight[0].specular"] = [1, 1, 1];
    // phongMaterial["pointLight[0].constant"] = 1;
    // phongMaterial["pointLight[0].linear"] = 0.14;
    // phongMaterial["pointLight[0].quadratic"] = 0.07;

    // boxMaterial["pointLight[0].position"] = light.position;
    // boxMaterial["pointLight[0].ambient"] = [0.2, 0.2, 0.2];
    // boxMaterial["pointLight[0].diffuse"] = [1, 1, 1];
    // boxMaterial["pointLight[0].specular"] = [1, 1, 1];
    // boxMaterial["pointLight[0].constant"] = 1;
    // boxMaterial["pointLight[0].linear"] = 0.14;
    // boxMaterial["pointLight[0].quadratic"] = 0.07;
    boxMaterial.setPointLight(0, pointLight1);

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

    var tick = 0;
    light.update = function () {
        let t = Math.sin(Time.elapsedTime) * 5;
        // light.position = [0, t, 0];
        monsterMaterial.lightPos = light.position;
        phongMaterial.lightPos = light.position;
        // boxMaterial.lightPos = light.position;
        tick++;
        // console.log(tick);
        if (tick == 100) {
            console.log("Profile end!!!");
            console.profileEnd(0);
        }
    }
}

window.addEventListener('load', run);