#define NORMAL

precision mediump float;

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec2 vUV1;
varying mediump vec3 vNormal;
varying mediump vec3 vSkyColor;

uniform sampler2D uSampler;
uniform mediump vec3 ambientLight;
uniform mediump vec3 sunlightColor;
uniform mediump vec3 sunlightAngle;
uniform mediump float sunlightIntensity;

uniform float viewDistance;

void main(void) {
    // Calculate the sunlight intensity.
    float surfaceIntensity = dot(sunlightAngle, vNormal) * sunlightIntensity;
    // Combine sunlight with ambient light
    vec3 litAmbient = ambientLight + sunlightColor * surfaceIntensity;
    // Combine lit ambient light with texture color.
    vec3 color = vColor * litAmbient;

    // UNUSED : Sample texture
    vec4 textureSample = texture2D(uSampler, vUV1);
    vec4 litTexture = vec4(color.x, color.y, color.z, 1) * textureSample;

    // Get the depth of the fragment in clip space.
    float depth = (2.0 * gl_FragCoord.z - gl_DepthRange.near - gl_DepthRange.far) / (gl_DepthRange.far - gl_DepthRange.near);
    float clipDepth = depth / gl_FragCoord.w / viewDistance;
    clipDepth = clamp(clipDepth, 0.0, 1.0);
    
    // Use the clip depth to lerp between the texture color and the sky color.
    // This creates a nice fog effect.
    float mixX = mix(color.x, vSkyColor.x, clipDepth);
    float mixY = mix(color.y, vSkyColor.y, clipDepth);
    float mixZ = mix(color.z, vSkyColor.z, clipDepth);
    vec3 foggedColor = vec3(mixX, mixY, mixZ);

    gl_FragColor = vec4(foggedColor.xyz, 1);

}