// This file was auto-generated with shader-converter.py.
// It contains a javascript version of all shader code.

const vertexShaderSource = `
attribute vec4 vertexPosition;
attribute vec4 aVertexColor;
// in layout(location=0) vec2 position

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;

varying lowp vec4 vColor;

void main() {

    // vec4 v = vec4(aVertexPosition, 1.0);
    vec4 v = vec4(vertexPosition.x, vertexPosition.y, vertexPosition.z, 1.0);
    vec4 newPosition = modelViewMatrix * v;
    vec4 projectedPosition = projectionMatrix * newPosition;
    gl_Position = transformMatrix * v;
    // vColor = vec4(0.0, 0.0, 1.0, 1.0);
    vColor = aVertexColor;
    // vColor = dominatingColor;
}`

const fragmentShaderSource = `
varying lowp vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
}`

