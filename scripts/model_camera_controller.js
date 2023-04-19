class ModelCameraController extends Component {
    rotation = 0;
    yaw = 0;
    distance = 5;
    sensitivity = 20;
    yawMax = 50;
    quat = quat.create();
    update = function () {
        let camera = Camera.main;
        // Apply mouse drag
        this.rotation -= Input.dragX * DEG2RAD * this.sensitivity;
        this.yaw -= Input.dragY * DEG2RAD * this.sensitivity;
        // Clamp yaw
        if (this.yaw > this.yawMax) this.yaw = this.yawMax;
        if (this.yaw < -this.yawMax) this.yaw = -this.yawMax;
        // Calculate camera position
        quat.fromEuler(this.quat, this.yaw, this.rotation, 0);
        let targetPos = vec3.create()
        let original = vec3.fromValues(0, 1.5, this.distance);
        vec3.transformQuat(targetPos, original, this.quat);
        // Apply camera position & rotation
        camera.position = targetPos;
        camera.setRotation(this.yaw, this.rotation, 0);
    }
}