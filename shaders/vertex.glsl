attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
// in layout(location=0) vec2 position

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 dominatingColor;

varying lowp vec4 vColor;

void main() {
    gl_Position = aVertexPosition;
    // vColor = vec4(0.0, 0.0, 1.0, 1.0);
    vColor = aVertexColor;
    // vColor = dominatingColor;
}