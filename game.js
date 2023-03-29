function run() {
    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid();

    Camera.main.position = [0, 2, 10];

    // Texture.createPlaceholderTexture();

    var textureLitShader = new Shader("Texture Lit Shader", textureLitVertexSource, textureLitFragmentSource);

    textureLitShader.uniformConverter.ambientLight = Rendering.vector3Converter;
    textureLitShader.uniformConverter.sunlightAngle = Rendering.vector3Converter;
    textureLitShader.uniformConverter.sunlightColor = Rendering.vector3Converter;
    textureLitShader.uniformConverter.sunlightIntensity = Rendering.floatConverter;

    var atlas = createTextureAtlas();
    console.log(atlas);
    // drawImages();
    const textureCanvas = document.getElementById("textureCanvas");
    // var img = new Image();
    // img.src = textureCanvas.toDataURL();

    const images = document.getElementsByClassName("voxelTexture");
    const texture = new Texture(atlas.image, TextureFilter.Nearest);
    // const texture = new Texture(images[0]);
    const texture2 = new Texture(atlas.image, TextureFilter.Nearest);

    const monsterImage = document.getElementById("monsterTexture");
    // const monsterTexture = new Texture(monsterImage, TextureFilter.Linear);
    const monsterTexture = new Texture(monsterImage);

    var litMat = new Material(Shader.simpleLit);
    var textureMat = new Material(textureLitShader);
    textureMat.texture = texture;
    // textureMat.texture = Texture.placeholderTexture;


    var monsterMat = new Material(textureLitShader);
    monsterMat.texture = monsterTexture;

    // var textureLitMat = new Material(Shader.textureLit);
    var unlitMaterial = new Material(Shader.unlitShader);

    unlitMaterial.dominatingColor = vec3.fromValues(1, 0, 0);

    var monster = new GameObject();
    monster.add(new MeshRenderer(Mesh.monster, monsterMat));
    monster.setRotation(0, -45, 0);

    var wireMonster = new GameObject();
    wireMonster.add(new MeshRenderer(Mesh.cubeWire, litMat));
    wireMonster.position = [3, 0, 0];

    litMat.ambientLight = [0.2, 0.2, 0.2];
    litMat.sunlightIntensity = 1;
    litMat.sunlightAngle = [0, 1, 0.5];
    litMat.sunlightColor = [245 / 255, 215 / 255, 66 / 255];

    textureMat.ambientLight = [0.2, 0.2, 0.2];
    textureMat.sunlightIntensity = 1;
    textureMat.sunlightAngle = [0, 1, 0.5];
    textureMat.sunlightColor = [245 / 255, 215 / 255, 66 / 255];
    
    Camera.main.viewDistance = 400;
    litMat.viewDistance = Camera.main.viewDistance;
    // litMat.skyColor = vec3.fromValues(1, 0, 0);
    const skyColor = [184 / 255, 131 / 255, 222 / 255];
    Camera.main.color = skyColor;
    // litMat.skyColor = skyColor;

    var cube = new GameObject();
    cube.add(new MeshRenderer(Mesh.cube, textureMat));

    var sphere = new GameObject();
    sphere.add(new MeshRenderer(Mesh.smoothSphere, textureMat));
    sphere.position = [5, 0, 0];

    var icoSphere = new GameObject();
    icoSphere.add(new MeshRenderer(Mesh.icoSphere, textureMat));
    icoSphere.position = [-5, 0, 0];

    var monkey = new GameObject();
    monkey.add(new MeshRenderer(Mesh.monkey, textureMat));
    monkey.rotation = [45, 0, 0];
    monkey.position = [-3, 5, 0];

    var cone = new GameObject();
    cone.add(new MeshRenderer(Mesh.cone, litMat));
    cone.position = [0, 0, 4];

    var quad = new GameObject();
    quad.add(new MeshRenderer(Mesh.quad, textureMat));
    quad.position = [2, 0.25, 4];

    const count = 10;
    const halfCount = count / 2;
    const spacing = 1;
    // for (var x = -halfCount; x < halfCount; x++) {
    //     for (var z = -halfCount; z < halfCount; z++) {
    //         var gameObject = new GameObject();
    //         gameObject.position[0] = x * spacing;
    //         gameObject.position[1] = 0;
    //         gameObject.position[2] = z * spacing;
    //         gameObject.add(new MeshRenderer(Mesh.cube, unlitMaterial));
    //     }
    // }

    var target = new GameObject();
    target.add(new MeshRenderer(Mesh.cube, litMat));
    target.position = [0, 4, 0];


    target.setRotation(45, 0, 0);
    
    // Create a game object to hold controller scripts
    var controller = new GameObject();
    var orthoToggle = new Component();
    // Add controller components to the controller
    controller.add(new SimpleCameraController());
    controller.add(orthoToggle);
    orthoToggle.update = function () {
        if (Input.wasPressedThisFrame("KeyT")) {
            Camera.main.ortho = !Camera.main.ortho;
        }
        if (Input.wasPressedThisFrame("KeyY")) {
            Mesh.monkey.setWireframe(!Mesh.monkey.wireframe);
            // Mesh.monkey.wireframe = !Mesh.monkey.wireframe;
        }
    }
}

window.addEventListener('load', run);