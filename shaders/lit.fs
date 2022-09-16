precision mediump float;

varying mediump vec3 vColor;
varying mediump vec2 vUV1;
varying mediump vec3 vNormal;

uniform sampler2D uSampler;
uniform mediump vec3 ambientLight;
uniform mediump vec3 sunlightAngle;
uniform mediump float sunlightIntensity;

void main(void) {
    float sunlight = dot(sunlightAngle, vNormal) * sunlightIntensity;
    vec3 color = vColor * ambientLight * sunlight;
    // vec3 color = vec3(0.95, 1, 0.28);

    // vec4 lightingColor = vec4(1,1,1,1) * sunlight;
    // 
    vec4 textureSample = texture2D(uSampler, vUV1);
    vec4 litTexture = vec4(color.x, color.y, color.z, 1) * textureSample;
    // gl_FragColor = color * 0.2;
    gl_FragColor = vec4(color.x, color.y, color.z, 1);
    // gl_FragColor = litTexture;
    // gl_FragColor = textureSample * lightingColor;
    // gl_FragColor = vec4(vColor.x, vColor.y, vColor.z, 1);
}