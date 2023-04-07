attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec3 objectColor;
// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec3 vColor;
varying mediump vec3 vNormal;
varying mediump vec2 vUV1;
// varying lowp vec3 vColor;

void main() {
    // vec4 v = vec4(aVertexPosition, 1.0);
    // vec4 v = vec4(vertexPosition.x, vertexPosition.y, vertexPosition.z, 1.0);
    // vec4 newPosition = modelViewMatrix * v;
    // vec4 projectedPosition = projectionMatrix * newPosition;
    // vColor = vec4(dominatingColor.x, dominatingColor.y, dominatingColor.z, 1);
    vColor = objectColor;
    vUV1 = vertexUV1;
    vNormal = vertexNormal;

    gl_Position = transformMatrix * vertexPosition;
    // float lighting = dot(sunlightAngle, vertexNormal);
    // vColor = vec3(1, 1, 1) * ambientLight * dot(sunlightAngle, vertexNormal) * sunlightIntensity;

}