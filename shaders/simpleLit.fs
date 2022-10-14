#define NORMAL

precision mediump float;

varying mediump vec3 vColor;
varying mediump vec2 vUV1;
varying mediump vec3 vNormal;
varying mediump vec3 vSkyColor;

uniform sampler2D uSampler;
uniform mediump vec3 ambientLight;
uniform mediump vec3 sunlightColor;
uniform mediump vec3 sunlightAngle;
uniform mediump float sunlightIntensity;

void main(void) {

    float surfaceSunlight = dot(sunlightAngle, vNormal) * sunlightIntensity;
    // #ifdef NORMAL
    vec3 litAmbient = ambientLight + sunlightColor * surfaceSunlight;
    // #else
    // vec3 litAmbient = ambientLight ;
    // #endif
    vec3 color = vColor * litAmbient;

    // vec3 addedSkyColor = vSkyColor
    // vec3 color = vec3(gl_FragCoord.x, gl_FragCoord.y, gl_FragCoord.z);
    // vec3 color = vec3(0.95, 1, 0.28);

    // vec4 lightingColor = vec4(1,1,1,1) * sunlight;
    // 
    vec4 textureSample = texture2D(uSampler, vUV1);
    vec4 litTexture = vec4(color.x, color.y, color.z, 1) * textureSample;
    // gl_FragColor = color * 0.2;
    gl_FragColor = vec4(color.x, color.y, color.z, 1);
    // gl_FragColor = vec4(gl_FragCoord.z);

    // float ndcDepth = (2.0 * gl_FragCoord.z - gl_DepthRange.near - gl_DepthRange.far) / (gl_DepthRange.far - gl_DepthRange.near);
    // float clipDepth = ndcDepth / gl_FragCoord.w;
    // gl_FragColor = vec4((clipDepth * 0.5) + 0.5); 

    // gl_FragColor = litTexture;
    // gl_FragColor = textureSample * lightingColor;
    // gl_FragColor = vec4(vColor.x, vColor.y, vColor.z, 1);
}