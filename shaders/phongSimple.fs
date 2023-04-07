precision mediump float;

struct DirectionalLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct PointLight {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec2 vUV1;
varying mediump vec3 vNormal;
varying mediump vec3 vFragPos;
varying mediump vec3 vSkyColor;
varying mediump mat4 vModelMatrix;

// Texture Sampling
uniform sampler2D uSampler;
uniform sampler2D diffuseSampler;
uniform sampler2D normalSampler;
uniform sampler2D specularSampler;

// Lighting
uniform DirectionalLight directionalLight;
uniform PointLight pointLights[4];

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

uniform bool useDiffuseTexture;
uniform bool useNormalTexture;
uniform bool useSpecularTexture;

uniform float viewDistance;

vec3 color(vec3 incol);

vec3 calculateDirectionalLight(DirectionalLight light);

void main(void) {

    vec3 combinedAmbient = ambientColor * ambientIntensity;

    // Sample Textures
    vec4 diffuseSample = texture2D(diffuseSampler, vUV1);
    vec4 normalSample = texture2D(normalSampler, vUV1);
    vec4 specularSample = texture2D(specularSampler, vUV1);

    // Get the depth of the fragment in clip space.
    float depth = (2.0 * gl_FragCoord.z - gl_DepthRange.near - gl_DepthRange.far) / (gl_DepthRange.far - gl_DepthRange.near);
    float clipDepth = depth / gl_FragCoord.w / viewDistance;
    clipDepth -= 0.5;
    clipDepth = clamp(clipDepth, 0.0, 1.0);

    // Use the clip depth to lerp between the texture color and the sky color.
    // This creates a nice fog effect.
    // FIXME: Readd fog?
    // float mixX = mix(color.x, skyColor.x, clipDepth);
    // float mixY = mix(color.y, skyColor.y, clipDepth);
    // float mixZ = mix(color.z, skyColor.z, clipDepth);
    // vec3 foggedColor = vec3(mixX, mixY, mixZ);

    vec3 sampledNormal = normalize(vec3(vModelMatrix * vec4(normalSample.xyz, 0)));

    vec3 lightDir = normalize(lightPos - vFragPos);
    vec3 viewDir = normalize(cameraPos - vFragPos);
    vec3 reflectDir = reflect(-lightDir, vNormal);

    float rawDiffuse = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse = rawDiffuse * lightColor;

    // Calculate specular value
    float rawSpecular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular;
    if(useSpecularTexture)
        specular = specularSample.xyz * rawSpecular * lightColor;
    else
        specular = specularStrength * rawSpecular * lightColor;

    // Calculate diffuse value
    vec3 result;
    if(useDiffuseTexture)
        result = (combinedAmbient + diffuse + specular) * diffuseSample.xyz;
    else
        result = (combinedAmbient + diffuse + specular) * objectColor;

    // result = color(vec3(0, 1, 0));
    // result = calculateDirectionalLight(directionalLight);
    gl_FragColor = vec4(result.xyz, 1);

}

vec3 color(vec3 incol) {
    vec3 red = vec3(1, 0, 0);
    return incol;
}

vec3 calculateDirectionalLight(DirectionalLight light) {
    vec3 lightDir = normalize(lightPos - vFragPos);
    vec3 reflectDir = reflect(-lightDir, vNormal);
    float rawDiffuse = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse = rawDiffuse * lightColor;
    return light.direction;
}