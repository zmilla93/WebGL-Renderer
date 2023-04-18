class ModelCameraController extends Component {
    // Camera data
    rotation = 0;
    yaw = 0;
    distance = 5;
    angle = vec3.fromValues(1, 0, 0);
    // Ranges

    update = function () {
        let camera = Camera.main;
        if(Input.mousePressed(0)){
            // console.log("click!");
        }
        if(Input.dragX != 0){
            console.log("Mouse Drag");
            console.log(Input.dragX);
            console.log(Input.dragY);
        }
    }
}