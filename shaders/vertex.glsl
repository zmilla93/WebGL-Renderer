attribute vec4 vertexPosition;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;
uniform vec3 ambientLight;
uniform vec3 sunlightAngle;
uniform float sunlightIntensity;

varying lowp vec3 vColor;

void main() {
    // vec4 v = vec4(aVertexPosition, 1.0);
    vec4 v = vec4(vertexPosition.x, vertexPosition.y, vertexPosition.z, 1.0);
    vec4 newPosition = modelViewMatrix * v;
    vec4 projectedPosition = projectionMatrix * newPosition;
    gl_Position = transformMatrix * v;
    vColor = vec3(0.95, 1, 0.28) * ambientLight * dot(sunlightAngle, vertexNormal) * sunlightIntensity;
}