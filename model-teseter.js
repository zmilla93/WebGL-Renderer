function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid();

    const controller = new GameObject();
    controller.add(new SimpleCameraController());

    // Phong Shader
    // FIXME : Make this into a default shader
    const phongShader = new LitShader("Phong Shader", phongVertexSource, phongFragmentSource);

    // Piper Plane Mesh
    let debugMaterial = new Material(phongShader);

    //////////////
    // TEXTURES //
    //////////////

    // Paving Stone Texture
    let pavingStoneDiffuse = document.getElementById("pavingStonesDiffuse");
    let pavingStoneNormal = document.getElementById("pavingStonesDiffuse");
    let pavingStoneSpecular = document.getElementById("pavingStonesDiffuse");
    let pavingStonesTexture = new Texture(pavingStoneDiffuse, pavingStoneNormal, pavingStoneSpecular);

    // Box Texture
    let boxDiffuse = document.getElementById("boxDiffuseTexture");
    let boxSpecular = document.getElementById("boxSpecularTexture");
    const boxTexture = new Texture(boxDiffuse, null, boxSpecular);

    ////////////
    // LIGHTS //
    ////////////

    // Directional Light
    let directionalLight = new DirectionalLight();
    directionalLight.direction = [1, -1, -0.5];
    directionalLight.ambient = [0.2, 0.2, 0.2];
    directionalLight.color = [1, 1, 1];

    let light1Material = new Material(Shader.unlitShader);

    // Point Lights
    let pointLight1Pos = [0, 3, 0];
    let pointLight1GO = new GameObject();
    let pointLight1Renderer = new MeshRenderer(Mesh.sphere, light1Material);
    pointLight1GO.add(pointLight1Renderer);
    pointLight1GO.position = pointLight1Pos;
    pointLight1GO.scale = [0.2, 0.2, 0.2];
    // pointLight1GO.color = [1,0,0];


    let pointLight1 = new PointLight();
    pointLight1GO.add(pointLight1);
    // pointLight1.position = pointLight1Pos;


    pointLight1.color = [1, 0.5, 1];
    // pointLight1GO.color = [1, 0.5, 1];
    // pointLight1Renderer.gameObject.objectColor = [0,0,1];
    pointLight1.ambient = [0.2, 0.2, 0.2];
    pointLight1.linear = 0.09;
    pointLight1.quadratic = 0.032;

    ///////////////
    // MATERIALS //
    ///////////////

    // Monster Material
    const monsterImage = document.getElementById("monsterTexture");
    const monsterTexture = new Texture(monsterImage);
    const monsterMaterial = new Material(phongShader);
    monsterMaterial.texture = monsterTexture;
    monsterMaterial.texture = null;
    monsterMaterial.objectColor = [0, 0.75, 0];
    monsterMaterial.specularStrength = 0.5;
    monsterMaterial.setDirectionalLight(directionalLight);
    // monsterMaterial.setDirectionalLight(null);

    const phongMaterial = new Material(phongShader);
    phongMaterial.objectColor = [1, 0.5, 0.31];
    phongMaterial.specularStrength = 0.5;
    phongMaterial.setDirectionalLight(directionalLight);
    phongMaterial.setDirectionalLight(null);
    phongMaterial.setPointLight(0, pointLight1);
    // phongMaterial.setPointLight(0, null);

    const boxMaterial = new Material(phongShader);

    boxMaterial.texture = boxTexture;
    boxMaterial.objectColor = [1, 0.5, 0.31];
    boxMaterial.specularStrength = 1;

    /////////////
    // OBJECTS //
    /////////////

    // Monster Object
    let monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMaterial));
    monster.position = [-2, 0, -10];

    let monster2 = new GameObject();
    monster2.add(new MeshRenderer(Mesh.monster2, monsterMaterial));
    monster2.position = [2, 0, -10];

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
    light.position = [0, 3, -8];
    light.color = [0, 0, 1];
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


    // ambientIntensitySlider.addEventListener("input", function (e) {
    //     let value = e.target.value;
    //     monsterMaterial.ambientIntensity = value;
    // });

    light.update = function () {
        let t = Math.sin(Time.elapsedTime) * 5;
        // light.position = [0, t, 0];
        // monsterMaterial.lightPos = light.position;
        // phongMaterial.lightPos = light.position;
        // boxMaterial.lightPos = light.position;
    }

    let dummy = new GameObject();
    let tick = 0;
    dummy.update = function () {
        let v = (Math.sin(Time.elapsedTime) + 2) / 4;
        monster.color = [0, v, 0];
        monster2.color = [v, 0, 0];
        pointLight1GO.position = [0, v * 5, 0];
        // tick++;
        // if (tick > 100) {
        //     directionalLight.color = [v, 0, 0];
        // } else {
        //     directionalLight.color = [0, v, 0];
        // }
        // monsterMaterial.setDirectionalLight(directionalLight);

    }

}

window.addEventListener('load', run);