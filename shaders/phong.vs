attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;
// attribute vec3 fragPos;

// uniform float farPlane;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;

// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec3 vNormal;
varying mediump vec3 vFragPos;
// varying mediump vec3 vSkyColor;
varying mediump vec2 vUV1;

void main() {
    vPosition = vertexPosition;
    vColor = vertexColor;
    vUV1 = vertexUV1;
    vNormal = vertexNormal;
    // vec4 t = ;
    // vec3 p = 
    vFragPos = vec3(modelMatrix * vec4(vertexPosition.xyz, 1));
    // vSkyColor = skyColor;
    gl_Position = transformMatrix * vertexPosition;
}