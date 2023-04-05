#define NORMAL

precision mediump float;

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec2 vUV1;
varying mediump vec3 vNormal;
varying mediump vec3 vFragPos;
varying mediump vec3 vSkyColor;

// Texture Sampling
uniform sampler2D uSampler;
uniform sampler2D diffuseSampler;
uniform sampler2D normalSampler;
uniform sampler2D specularSampler;

// Lighting
uniform mediump vec3 objectColor;
uniform mediump vec3 ambientLight;
uniform mediump vec3 ambientColor;
uniform mediump float ambientIntensity;
uniform mediump vec3 lightColor;
uniform mediump vec3 lightPos;
uniform mediump vec3 sunlightColor;
uniform mediump vec3 sunlightAngle;
uniform mediump float sunlightIntensity;
uniform mediump vec3 skyColor;
uniform mediump vec3 cameraPos;
uniform mediump float specularStrength;

uniform bool useTexture;

uniform float viewDistance;

void main(void) {
    // Calculate the sunlight intensity.
    float surfaceIntensity = dot(sunlightAngle, vNormal) * sunlightIntensity;
    // Combine sunlight with ambient light
    vec3 combinedAmbient = ambientColor * ambientIntensity;

    vec3 litAmbient = ambientLight + sunlightColor * surfaceIntensity;
    // Combine lit ambient light with texture color.
    vec3 color = vColor * litAmbient;

    // UNUSED : Sample texture
    // vec4 textureSample = texture2D(uSampler, vUV1);
    vec4 diffuseSample = texture2D(diffuseSampler, vUV1);
    vec4 specularSample = texture2D(specularSampler, vUV1);
    vec4 litTexture = vec4(color.x, color.y, color.z, 1) * diffuseSample;

    // Get the depth of the fragment in clip space.
    float depth = (2.0 * gl_FragCoord.z - gl_DepthRange.near - gl_DepthRange.far) / (gl_DepthRange.far - gl_DepthRange.near);
    float clipDepth = depth / gl_FragCoord.w / viewDistance;
    clipDepth -= 0.5;
    clipDepth = clamp(clipDepth, 0.0, 1.0);

    // Use the clip depth to lerp between the texture color and the sky color.
    // This creates a nice fog effect.
    float mixX = mix(color.x, skyColor.x, clipDepth);
    float mixY = mix(color.y, skyColor.y, clipDepth);
    float mixZ = mix(color.z, skyColor.z, clipDepth);
    vec3 foggedColor = vec3(mixX, mixY, mixZ);

    // gl_FragColor = vec4(litTexture.xyz, 1);
    // gl_FragColor = vec4(ambientColor.xyz, 1);
    // gl_FragColor = vec4(0, 0, 0, 1);
    vec3 mixedColor = combinedAmbient * objectColor;

    vec3 lightDir = normalize(lightPos - vFragPos);
    vec3 viewDir = normalize(cameraPos - vFragPos);
    vec3 reflectDir = reflect(-lightDir, vNormal);

    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    // vec3 specular = specularStrength * spec * lightColor;
    vec3 specular = specularSample.xyz * spec * lightColor;

    vec3 result;
    if(useTexture) {
        result = (combinedAmbient + diffuse + specular) * diffuseSample.xyz;
    } else {
        result = (combinedAmbient + diffuse + specular) * objectColor;
    }

    gl_FragColor = vec4(result.xyz, 1);
    // gl_FragColor = vec4(textureSample.xyz, 1);

}