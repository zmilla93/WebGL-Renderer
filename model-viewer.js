function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid();

    const controller = new GameObject();
    controller.add(new SimpleCameraController());

    // Phong Shader
    // FIXME : Make this into a default shader
    // const phongShader = new LitShader("Phong Shader", phongVertexSource, phongFragmentSource);

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
    pointLight1.ambient = [0.2, 0.2, 0.2];
    pointLight1.linear = 0.09;
    pointLight1.quadratic = 0.032;

    ///////////////
    // MATERIALS //
    ///////////////

    // Monster Material
    const monsterImage = document.getElementById("monsterTexture");
    const monsterTexture = new Texture(monsterImage);
    const monsterMaterial = new Material(Shader.phongShader);
    monsterMaterial.texture = monsterTexture;
    // monsterMaterial.texture = null;
    monsterMaterial.objectColor = [0, 0.75, 0];
    monsterMaterial.specularStrength = 0.5;
    // monsterMaterial.setDirectionalLight(directionalLight);
    // monsterMaterial.setDirectionalLight(null);

    const phongMaterial = new Material(Shader.phongShader);
    phongMaterial.objectColor = [1, 0.5, 0.31];
    phongMaterial.specularStrength = 0.5;
    phongMaterial.color = [0, 1, 0];

    const boxMaterial = new Material(Shader.phongShader);

    boxMaterial.texture = phongMaterial;
    boxMaterial.objectColor = [1, 0.5, 0.31];
    boxMaterial.specularStrength = 1;

    const light2 = PointLight.create();
    const light3 = PointLight.create();

    /////////////
    // OBJECTS //
    /////////////

    // Monster Object
    let monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMaterial));

    // monster.position = [-2, 0, -10];

    let monster2 = new GameObject();
    monster2.add(new MeshRenderer(Mesh.monster2, monsterMaterial));
    monster2.position = [2, 0, -10];

    boxMaterial.setPointLight(0, pointLight1);
    monsterMaterial.setPointLight(0, pointLight1);
    phongMaterial.setPointLight(0, pointLight1);

    boxMaterial.setPointLight(1, light2);
    monsterMaterial.setPointLight(1, light2);
    phongMaterial.setPointLight(1, light2);

    boxMaterial.setDirectionalLight(directionalLight);
    monsterMaterial.setDirectionalLight(directionalLight);
    phongMaterial.setDirectionalLight(directionalLight);

    Camera.main.position = [0, 2, 5];

    // Controls
    // FIXME : Controls need to be set to default shader values or vice versa!
    let ambientColorPicker = document.getElementById("ambientColorPicker");
    let ambientIntensitySlider = document.getElementById("ambientIntensitySlider");
    let pointlight1Checkbox = document.getElementById("pointLight1Checkbox");
    let pointlight1X = document.getElementById("pointLight1X");
    let pointlight1Y = document.getElementById("pointLight1Y");
    let pointlight1Z = document.getElementById("pointLight1Z");
    
    pointlight1Checkbox.addEventListener("input", function(e){
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

    pointlight1X.addEventListener("input", function(e){
        let value = e.target.value;
        let oldPos = pointLight1.position;
        pointLight1.gameObject.position = [value, oldPos[1], oldPos[2]];
    });
    pointlight1Y.addEventListener("input", function(e){
        let value = e.target.value;
        let oldPos = pointLight1.position;
        pointLight1.gameObject.position = [oldPos[0], value, oldPos[2]];
    });
    pointlight1Z.addEventListener("input", function(e){
        let value = e.target.value;
        let oldPos = pointLight1.position;
        pointLight1.gameObject.position = [oldPos[0], oldPos[1], value];
    });

}

window.addEventListener('load', run);