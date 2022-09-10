// This file was auto-generated with shader-converter.py.
// It contains a javascript version of all shader code.

const vertexShaderSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
// in layout(location=0) vec2 position

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main() {
    gl_Position = aVertexPosition;
    // vColor = vec4(0.0, 0.0, 1.0, 1.0);
    vColor = aVertexColor;
}`

const fragmentShaderSource = `
varying lowp vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
}`

