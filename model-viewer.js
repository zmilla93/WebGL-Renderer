function run() {

    const canvas = document.getElementById('glCanvas');
    Engine.init(canvas);
    createGrid();

    Camera.main.color = [0.5, 1, 0.5];

    var controller = new GameObject();
    controller.add(new SimpleCameraController());

    var monster = new GameObject();
    monster.add(new MeshRenderer());

    // Camera.main.setRotation(-45 * DEG2RAD, 90 * DEG2RAD, 0);

}

window.addEventListener('load', run);