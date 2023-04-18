class ModelCameraController extends Component {
    // Camera data
    rotation = 0;
    yaw = 0;
    distance = 5;
    angle = vec3.fromValues(0, 0, 1);
    quat = quat.create();
    light;
    static origin = vec3.create();
    // Ranges
    constructor() {
        super();
        this.light = PointLight.create();
    }
    update = function () {
        let camera = Camera.main;
        // camera.position = this.angle;

        if (Input.mousePressed(0)) {
            // console.log("click!");
        }
        let sensitivity = 100;
        if (Input.dragX != 0) {
            this.rotation += Input.dragX * DEG2RAD * sensitivity;
            vec3.rotateY(this.angle, this.angle, [0, 0, 0], Input.dragX * DEG2RAD);
            vec3.rotateX(this.angle, this.angle, [0, 0, 0], Input.dragY * DEG2RAD * 20);
        }
        this.yaw -= Input.dragY * DEG2RAD * sensitivity;
        quat.fromEuler(this.quat, this.yaw, this.rotation, 0);
        let axis = vec3.create()
        // quat.getAxisAngle(axis, this.quat);
        let original = vec3.fromValues(0, 0, 5);
        vec3.transformQuat(axis, original, this.quat);

        this.light.position = axis;
    }
}