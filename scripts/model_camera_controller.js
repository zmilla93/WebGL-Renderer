class ModelCameraController extends Component {
    // Rotation & Yaw
    rotation = 0;
    yaw = 0;
    sensitivity = 20;
    maxYaw = 60;
    // Distance
    distance = 2;
    minDistance = 0.5;
    maxDistance = 7;
    scrollStep = 0.2;
    // Height
    targetHeight = 1.5;
    heightStep = 0.02;
    minHeight = 0;
    maxHeight = 2;
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
        this.distance += Input.scrollNormalized * this.scrollStep;
        if (this.distance < this.minDistance) this.distance = this.minDistance;
        if (this.distance > this.maxDistance) this.distance = this.maxDistance;
        // Apply height movement
        if (Input.isKeyPressed("Space")) this.targetHeight += this.heightStep;
        if (Input.isKeyPressed("ShiftLeft") || Input.isKeyPressed("ShiftRight")) this.targetHeight -= this.heightStep;
        if (this.targetHeight < this.minHeight) this.targetHeight = this.minHeight;
        if (this.targetHeight > this.maxHeight) this.targetHeight = this.maxHeight;
        // Calculate camera position
        quat.fromEuler(this.quat, this.yaw, this.rotation, 0);
        let original = vec3.fromValues(0, 0, this.distance);
        vec3.transformQuat(this.targetPos, original, this.quat);
        this.targetPos[1] += this.targetHeight;
        // Apply camera position & rotation
        camera.position = this.targetPos;
        camera.setRotation(this.yaw, this.rotation, 0);
    }
}