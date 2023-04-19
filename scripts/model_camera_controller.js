class ModelCameraController extends Component {
    rotation = 0;
    yaw = 0;
    distance = 5;
    sensitivity = 20;
    scrollSensitivity = 0.5;
    maxYaw = 50;
    minDistance = 2;
    maxDistance = 15;
    // Internal
    quat = quat.create();
    targetPos = vec3.create();
    update = function () {
        let camera = Camera.main;
        // Apply mouse drag
        this.rotation -= Input.dragX * DEG2RAD * this.sensitivity;
        this.yaw -= Input.dragY * DEG2RAD * this.sensitivity;
        if (this.yaw > this.maxYaw) this.yaw = this.maxYaw;
        if (this.yaw < -this.maxYaw) this.yaw = -this.maxYaw;
        // Apply mouse scroll
        this.distance += Input.scrollNormalized * this.scrollSensitivity;
        if (this.distance < this.minDistance) this.distance = this.minDistance;
        if (this.distance > this.maxDistance) this.distance = this.maxDistance;
        // Calculate camera position
        quat.fromEuler(this.quat, this.yaw, this.rotation, 0);
        let original = vec3.fromValues(0, 1.5, this.distance);
        vec3.transformQuat(this.targetPos, original, this.quat);
        // Apply camera position & rotation
        camera.position = this.targetPos;
        camera.setRotation(this.yaw, this.rotation, 0);
    }
}