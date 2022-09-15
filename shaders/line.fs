
precision mediump float;

varying mediump vec3 vColor;
varying mediump vec3 vNormal;

uniform mediump vec3 ambientLight;
uniform mediump vec3 sunlightAngle;
uniform mediump float sunlightIntensity;

void main(void) {
    // vec3 color = vColor * ambientLight * dot(sunlightAngle, vNormal) * sunlightIntensity;
    // vec3 color = vec3(0.95, 1, 0.28);
    // gl_FragColor = vec4(color.x, color.y, color.z, 1);
    gl_FragColor = vec4(vColor.x, vColor.y, vColor.z, 1);
}