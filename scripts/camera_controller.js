class SimpleCameraController extends Component {
    update = function () {
        var cam = Camera.main;
        const walkSpeed = 5;
        const runSpeed = 10;
        const speed = Input.isKeyPressed('ShiftLeft') || Input.isKeyPressed('ShiftRight') ? runSpeed : walkSpeed;
        if (Input.isKeyPressed('KeyW')) {
            var scaled = vec3.clone(cam.forward);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('KeyS')) {
            var localBack = vec3.create();
            vec3.rotateY(localBack, cam.forward, VECTOR3_ZERO, 180 * DEG2RAD)
            var scaled = vec3.clone(localBack);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('KeyA')) {
            var localLeft = vec3.create();
            vec3.rotateY(localLeft, cam.forward, VECTOR3_ZERO, 90 * DEG2RAD)
            var scaled = vec3.clone(localLeft);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('KeyD')) {
            var localRight = vec3.create();
            vec3.rotateY(localRight, cam.forward, VECTOR3_ZERO, -90 * DEG2RAD);
            var scaled = vec3.clone(localRight);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('Space')) {
            var scaled = vec3.clone(VECTOR3_UP);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('ControlLeft')) {
            var scaled = vec3.clone(VECTOR3_DOWN);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('KeyQ')) {
            var rotationY = cam.rotation[1];
            rotationY += 90 * DEG2RAD * Time.deltaTime;
            cam.setRotation(cam.rotation[0], rotationY, cam.rotation[2]);
        }
        if (Input.isKeyPressed('KeyE')) {
            var rotationY = cam.rotation[1];
            rotationY -= 90 * DEG2RAD * Time.deltaTime;
            cam.setRotation(cam.rotation[0], rotationY, cam.rotation[2]);
        }
        if (Input.isKeyPressed('KeyZ')) {
            var rotationX = cam.rotation[0];
            rotationX += 90 * DEG2RAD * Time.deltaTime;
            cam.setRotation(rotationX, cam.rotation[1], 0);
        }
        if (Input.isKeyPressed('KeyX')) {
            var rotationX = cam.rotation[0];
            rotationX -= 90 * DEG2RAD * Time.deltaTime;
            cam.setRotation(rotationX, cam.rotation[1], 0);
        }
        if (Input.wasPressedThisFrame('KeyV')) {
            cam.setRotation(cam.rotation[0], cam.rotation[1], 45);
        }
    }
}

class CameraController extends Component {
    update = function(){
        const walkSpeed = 5;
        const runSpeed = 10;
        const speed = Input.isKeyPressed('ShiftLeft') || Input.isKeyPressed('ShiftRight') ? runSpeed : walkSpeed;
        if (Input.isKeyPressed('KeyW')) {
            var scaled = vec3.clone(cam.forward);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('KeyS')) {
            var localBack = vec3.create();
            vec3.rotateY(localBack, cam.forward, VECTOR3_ZERO, 180 * DEG2RAD)
            var scaled = vec3.clone(localBack);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('KeyA')) {
            var localLeft = vec3.create();
            vec3.rotateY(localLeft, cam.forward, VECTOR3_ZERO, 90 * DEG2RAD)
            var scaled = vec3.clone(localLeft);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('KeyD')) {
            var localRight = vec3.create();
            vec3.rotateY(localRight, cam.forward, VECTOR3_ZERO, -90 * DEG2RAD);
            var scaled = vec3.clone(localRight);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('Space')) {
            var scaled = vec3.clone(VECTOR3_UP);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('ControlLeft')) {
            var scaled = vec3.clone(VECTOR3_DOWN);
            vec3.scale(scaled, scaled, Time.deltaTime * speed);
            vec3.add(cam.position, cam.position, scaled);
            drawScene();
        }
        if (Input.isKeyPressed('KeyQ')) {
            var rotationY = cam.rotation[1];
            rotationY += 90 * DEG2RAD * Time.deltaTime;
            cam.setRotation(cam.rotation[0], rotationY, cam.rotation[2]);
        }
        if (Input.isKeyPressed('KeyE')) {
            var rotationY = cam.rotation[1];
            rotationY -= 90 * DEG2RAD * Time.deltaTime;
            cam.setRotation(cam.rotation[0], rotationY, cam.rotation[2]);
        }
        if (Input.isKeyPressed('KeyZ')) {
            var rotationX = cam.rotation[0];
            rotationX += 90 * DEG2RAD * Time.deltaTime;
            cam.setRotation(rotationX, cam.rotation[1], 0);
        }
        if (Input.isKeyPressed('KeyX')) {
            var rotationX = cam.rotation[0];
            rotationX -= 90 * DEG2RAD * Time.deltaTime;
            cam.setRotation(rotationX, cam.rotation[1], 0);
        }
        if (Input.wasPressedThisFrame('KeyV')) {
            cam.setRotation(cam.rotation[0], cam.rotation[1], 45);
        }
    }
}