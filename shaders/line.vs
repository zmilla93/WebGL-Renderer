attribute vec4 vertexPosition;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;
// uniform vec4 projectionMatrix;
// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec3 vColor;
varying mediump vec3 vNormal;
// varying lowp vec3 vColor;

void main() {
    vColor = vertexColor;
    // vNormal = vertexNormal;
    // gl_Position = projectionMatrix * vertexPosition;
    gl_Position = projectionMatrix * vertexPosition;
    // float lighting = dot(sunlightAngle, vertexNormal);
    // vColor = vec3(1, 1, 1) * ambientLight * dot(sunlightAngle, vertexNormal) * sunlightIntensity;

}