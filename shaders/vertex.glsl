attribute vec4 vertexPosition;
attribute vec4 vertexNormal;
attribute vec4 vertexColor;
// in layout(location=0) vec2 position

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;
uniform vec4 ambientLight;
uniform vec3 sunlightAngle;

varying lowp vec4 vColor;

void main() {

    // vec4 v = vec4(aVertexPosition, 1.0);
    vec4 v = vec4(vertexPosition.x, vertexPosition.y, vertexPosition.z, 1.0);
    vec4 newPosition = modelViewMatrix * v;
    vec4 projectedPosition = projectionMatrix * newPosition;
    gl_Position = transformMatrix * v;
    // vColor = vec4(0.0, 0.0, 1.0, 1.0);
    vColor = vertexColor * ambientLight;
    // vColor = vec4(0, 0, 0, 1);
    // vColor = dominatingColor;
}