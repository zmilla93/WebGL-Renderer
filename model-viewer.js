function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid();

    Camera.main.color = [0.5, 1, 0.5];

    const controller = new GameObject();
    controller.add(new SimpleCameraController());

    // Phong Shader
    const phongShader = new LitShader("Phong shader", phongVertexSource, phongFragmentSource);

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

    let light1Material = new Material(Shader.unlitShader);

    let pointLight1Pos = [-4, 3, 0];
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

    // Monster Material
    const monsterImage = document.getElementById("monsterTexture");
    const monsterTexture = new Texture(monsterImage);
    const monsterMaterial = new Material(phongShader);
    monsterMaterial.useDiffuseTexture = true;
    monsterMaterial.useSpecularTexture = false;
    monsterMaterial.texture = monsterTexture;
    monsterMaterial.objectColor = [0, 0.75, 0];
    monsterMaterial.specularStrength = 0.5;
    monsterMaterial.setDirectionalLight(directionalLight);

    const phongMaterial = new Material(phongShader);
    phongMaterial.objectColor = [1, 0.5, 0.31];
    phongMaterial.specularStrength = 0.5;
    phongMaterial.useDiffuseTexture = false;
    phongMaterial.useSpecularTexture = false;
    phongMaterial.useNormalTexture = false;
    phongMaterial.setDirectionalLight(directionalLight);
    phongMaterial.setPointLight(0, pointLight1);

    const boxMaterial = new Material(phongShader);
    const boxDiffuse = document.getElementById("boxDiffuseTexture");
    const boxSpecular = document.getElementById("boxSpecularTexture");
    const boxTexture = new Texture(boxDiffuse, null, boxSpecular);
    boxMaterial.useDiffuseTexture = true;
    boxMaterial.useNormalTexture = true;
    boxMaterial.useSpecularTexture = true;
    boxMaterial.texture = pavingStonesTexture;
    boxMaterial.objectColor = [1, 0.5, 0.31];
    boxMaterial.specularStrength = 1;

    // Monster Object
    let monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMaterial));

    let monster2 = new GameObject();
    monster2.add(new MeshRenderer(Mesh.monster2, monsterMaterial));

    monster.position = [-1, 0, -10];
    monster2.position = [1, 0, -10];

    // SPHERE
    const sphere = new GameObject();
    sphere.add(new MeshRenderer(Mesh.icoSphere, phongMaterial));
    sphere.position = [-4, 1, 0];

    const sphere2 = new GameObject();
    sphere2.add(new MeshRenderer(Mesh.icoSmooth, phongMaterial));
    sphere2.position = [4, 1, 0];

    const sphere3 = new GameObject();
    sphere3.add(new MeshRenderer(Mesh.smoothSphere, phongMaterial));
    sphere3.position = [-4, 1, -5];

    // BOX
    const box = new GameObject();
    box.add(new MeshRenderer(Mesh.cube, boxMaterial));
    box.position = [0, 0.5, -2];
    box.setRotation(0, 45, 0);

    const plane = new GameObject();
    plane.add(new MeshRenderer(Mesh.quad, boxMaterial));
    plane.position = [0, 0.01, -4];
    let planeScale = 1;
    plane.scale = [planeScale, 1, planeScale];


    // Point Light Object
    const light = new GameObject();
    light.add(new MeshRenderer(Mesh.smoothSphere, light1Material));
    // light.position = [0, 5, -6];
    light.position = [0, 3, -8];
    let s = 0.2;
    light.scale = [s, s, s];

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

    light.update = function () {
        let t = Math.sin(Time.elapsedTime) * 5;
        // light.position = [0, t, 0];
        monsterMaterial.lightPos = light.position;
        phongMaterial.lightPos = light.position;
        // boxMaterial.lightPos = light.position;
    }
}

window.addEventListener('load', run);