// This file was auto-generated with shader-converter.py.
// It contains a javascript version of all shader code.

const vertexShaderSource = `
attribute vec4 vertexPosition;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;
// in layout(location=0) vec2 position

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

    // vec3 lightVector = normalize()
    // vColor = vec4(0.0, 0.0, 1.0, 1.0);
    vColor = vec3(0.95, 1, 0.28) * ambientLight * dot(sunlightAngle, vertexNormal) * sunlightIntensity;
    // vColor = vec3(1,1,1);
    // vColor = vec4(0, 0, 0, 1);
    // vColor = dominatingColor;
}`

const fragmentShaderSource = `
varying lowp vec3 vColor;

void main(void) {
    gl_FragColor = vec4(vColor.x, vColor.y, vColor.z, 1);
}`

