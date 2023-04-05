// This file was auto-generated with shader-converter.py.
// It contains a javascript version of all shader code.

const funLitFragmentSource = `
#define NORMAL

precision mediump float;

varying mediump vec3 vColor;
varying mediump vec2 vUV1;
varying mediump vec3 vNormal;

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
`

const funLitVertexSource = `
attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;
// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec3 vColor;
varying mediump vec3 vNormal;
varying mediump vec2 vUV1;
// varying lowp vec3 vColor;

void main() {
    // vec4 v = vec4(aVertexPosition, 1.0);
    // vec4 v = vec4(vertexPosition.x, vertexPosition.y, vertexPosition.z, 1.0);
    // vec4 newPosition = modelViewMatrix * v;
    // vec4 projectedPosition = projectionMatrix * newPosition;
    vColor = vertexColor;
    vUV1 = vertexUV1;
    vNormal = vertexNormal;

    gl_Position = transformMatrix * vertexPosition;
    // float lighting = dot(sunlightAngle, vertexNormal);
    // vColor = vec3(1, 1, 1) * ambientLight * dot(sunlightAngle, vertexNormal) * sunlightIntensity;

}
`

const lineFragmentSource = `

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
`

const lineVertexSource = `
attribute vec4 vertexPosition;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;
// uniform vec4 projectionMatrix;
// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec3 vColor;
varying mediump vec3 vNormal;
// varying lowp vec3 vColor;

void main() {
    vColor = vertexColor;
    // vNormal = vertexNormal;
    // gl_Position = projectionMatrix * vertexPosition;
    gl_Position = projectionMatrix * vertexPosition;
    // float lighting = dot(sunlightAngle, vertexNormal);
    // vColor = vec3(1, 1, 1) * ambientLight * dot(sunlightAngle, vertexNormal) * sunlightIntensity;

}
`

const litFragmentSource = `
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
`

const litVertexSource = `
attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;
// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec3 vColor;
varying mediump vec3 vNormal;
varying mediump vec2 vUV1;
// varying lowp vec3 vColor;

void main() {
    // vec4 v = vec4(aVertexPosition, 1.0);
    // vec4 v = vec4(vertexPosition.x, vertexPosition.y, vertexPosition.z, 1.0);
    // vec4 newPosition = modelViewMatrix * v;
    // vec4 projectedPosition = projectionMatrix * newPosition;
    vColor = vertexColor;
    vUV1 = vertexUV1;
    vNormal = vertexNormal;

    gl_Position = transformMatrix * vertexPosition;
    // float lighting = dot(sunlightAngle, vertexNormal);
    // vColor = vec3(1, 1, 1) * ambientLight * dot(sunlightAngle, vertexNormal) * sunlightIntensity;

}
`

const phongFragmentSource = `
precision mediump float;

struct DirectionalLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct PointLight {
    vec3 position;
    float constant;
    float linear;
    float quadratic;
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
uniform PointLight pointLight[4];

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

vec3 calculateDirectionalLight(DirectionalLight light, vec3 viewDir, vec3 diffuseSample, vec3 specularSample);

vec3 calculatePointLight(PointLight light, vec3 viewDir, vec3 diffuseSample, vec3 specularSample);

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

    result = vec3(0.0, 0.0, 0.0);
    // result += calculateDirectionalLight(directionalLight, viewDir, diffuseSample.xyz, specularSample.xyz);

    result += calculatePointLight(pointLight[0], viewDir, diffuseSample.xyz, specularSample.xyz);
    // result += calculatePointLight(pointLight[0], viewDir, diffuseSample.xyz, specularSample.xyz);

    // outp *= diffuseSample.xyz;
    // result = color(vec3(0, 1, 0));
    // result = calculateDirectionalLight(directionalLight);
    // gl_FragColor = vec4(result.xyz, 1);
    gl_FragColor = vec4(result.xyz, 1);
}

vec3 calculateDirectionalLight(DirectionalLight light, vec3 viewDir, vec3 diffuseSample, vec3 specularSample) {
    vec3 lightDir = normalize(-light.direction);
    vec3 reflectDir = reflect(-lightDir, vNormal);
    // Ambient
    vec3 ambient;
    if(useDiffuseTexture)
        ambient = light.ambient * diffuseSample;
    else
        ambient = light.ambient * objectColor;
    // Diffuse
    float rawDiffuse = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse;
    if(useDiffuseTexture)
        diffuse = rawDiffuse * light.diffuse * diffuseSample;
    else
        diffuse = rawDiffuse * light.diffuse * objectColor;
    // Specular
    float rawSpecular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular;
    if(useSpecularTexture)
        specular = specularSample.xyz * rawSpecular * light.specular;
    else
        specular = specularStrength * rawSpecular * light.specular;
    return ambient + specular + diffuse;
}

vec3 calculatePointLight(PointLight light, vec3 viewDir, vec3 diffuseSample, vec3 specularSample) {
    vec3 lightDir = normalize(light.position - vFragPos);
    // vec3 viewDir = normalize(cameraPos - vFragPos);
    vec3 reflectDir = reflect(-lightDir, vNormal);
    float distance = length(light.position - vFragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    vec3 ambient;
    if(useDiffuseTexture)
        ambient = light.ambient * diffuseSample;
    else
        ambient = light.ambient * objectColor;
    // Diffuse
    float rawDiffuse = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse;
    if(useDiffuseTexture)
        diffuse = rawDiffuse * light.diffuse * diffuseSample;
    else
        diffuse = rawDiffuse * light.diffuse * objectColor;
    // Specular
    float rawSpecular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular;
    if(useSpecularTexture)
        specular = specularSample * rawSpecular * light.specular;
    else
        specular = specularStrength * rawSpecular * light.specular;
    // Apply attenuation
    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;

    return ambient + specular + diffuse;

}
`

const phongVertexSource = `
attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;
// attribute vec3 fragPos;

// uniform float farPlane;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;

// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec3 vNormal;
varying mediump vec3 vFragPos;
// varying mediump vec3 vSkyColor;
varying mediump vec2 vUV1;
varying mediump vec3 normalMatrix;
varying mediump mat4 normalMatrix4;
varying mediump mat4 vModelMatrix;

void main() {
    vPosition = vertexPosition;
    vColor = vertexColor;
    vUV1 = vertexUV1;
    // vNormal = vertexNormal;
    // FIXME : Normals are not properly calculated for nonuniform scaling.
    vNormal = normalize(vec3(modelMatrix * vec4(vertexNormal, 0)));
    vFragPos = vec3(modelMatrix * vec4(vertexPosition.xyz, 1));
    vModelMatrix = modelMatrix;

    gl_Position = transformMatrix * vertexPosition;
}
`

const phongSimpleFragmentSource = `
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
`

const phongSimpleVertexSource = `
attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;
// attribute vec3 fragPos;

// uniform float farPlane;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;

// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec3 vNormal;
varying mediump vec3 vFragPos;
// varying mediump vec3 vSkyColor;
varying mediump vec2 vUV1;
varying mediump vec3 normalMatrix;
varying mediump mat4 normalMatrix4;
varying mediump mat4 vModelMatrix;

void main() {
    vPosition = vertexPosition;
    vColor = vertexColor;
    vUV1 = vertexUV1;
    // vNormal = vertexNormal;
    // FIXME : Normals are not properly calculated for nonuniform scaling.
    vNormal = normalize(vec3(modelMatrix * vec4(vertexNormal, 0)));
    vFragPos = vec3(modelMatrix * vec4(vertexPosition.xyz, 1));
    vModelMatrix = modelMatrix;

    gl_Position = transformMatrix * vertexPosition;
}
`

const simpleLitFragmentSource = `
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
uniform mediump vec3 skyColor;

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
    clipDepth -= 0.5;
    clipDepth = clamp(clipDepth, 0.0, 1.0);

    // Use the clip depth to lerp between the texture color and the sky color.
    // This creates a nice fog effect.
    float mixX = mix(color.x, skyColor.x, clipDepth);
    float mixY = mix(color.y, skyColor.y, clipDepth);
    float mixZ = mix(color.z, skyColor.z, clipDepth);
    vec3 foggedColor = vec3(mixX, mixY, mixZ);

    gl_FragColor = vec4(foggedColor.xyz, 1);

}
`

const simpleLitVertexSource = `
attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

// uniform float farPlane;
uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;

// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec3 vNormal;
// varying mediump vec3 vSkyColor;
varying mediump vec2 vUV1;

void main() {
    vPosition = vertexPosition;
    vColor = vertexColor;
    vUV1 = vertexUV1;
    vNormal = vertexNormal;
    // vSkyColor = skyColor;
    gl_Position = transformMatrix * vertexPosition;
}
`

const textureLitFragmentSource = `
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
uniform mediump vec3 skyColor;

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
    clipDepth -= 0.5;
    clipDepth = clamp(clipDepth, 0.0, 1.0);

    // Use the clip depth to lerp between the texture color and the sky color.
    // This creates a nice fog effect.
    float mixX = mix(color.x, skyColor.x, clipDepth);
    float mixY = mix(color.y, skyColor.y, clipDepth);
    float mixZ = mix(color.z, skyColor.z, clipDepth);
    vec3 foggedColor = vec3(mixX, mixY, mixZ);

    gl_FragColor = vec4(litTexture.xyz, 1);

}
`

const textureLitVertexSource = `
attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

// uniform float farPlane;
uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec4 dominatingColor;

// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec3 vNormal;
// varying mediump vec3 vSkyColor;
varying mediump vec2 vUV1;

void main() {
    vPosition = vertexPosition;
    vColor = vertexColor;
    vUV1 = vertexUV1;
    vNormal = vertexNormal;
    // vSkyColor = skyColor;
    gl_Position = transformMatrix * vertexPosition;
}
`

const unlitFragmentSource = `
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
    gl_FragColor = vec4(vColor.x, vColor.y, vColor.z, 1);
    // gl_FragColor = litTexture;
    // gl_FragColor = textureSample * lightingColor;
    // gl_FragColor = vec4(vColor.x, vColor.y, vColor.z, 1);
}
`

const unlitVertexSource = `
attribute vec4 vertexPosition;
attribute vec2 vertexUV1;
attribute vec3 vertexNormal;
attribute vec3 vertexColor;

uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform mat4 transformMatrix;
uniform vec3 dominatingColor;
// uniform vec3 ambientLight;
// uniform vec3 sunlightAngle;
// uniform float sunlightIntensity;

varying mediump vec3 vColor;
varying mediump vec3 vNormal;
varying mediump vec2 vUV1;
// varying lowp vec3 vColor;

void main() {
    // vec4 v = vec4(aVertexPosition, 1.0);
    // vec4 v = vec4(vertexPosition.x, vertexPosition.y, vertexPosition.z, 1.0);
    // vec4 newPosition = modelViewMatrix * v;
    // vec4 projectedPosition = projectionMatrix * newPosition;
    // vColor = vec4(dominatingColor.x, dominatingColor.y, dominatingColor.z, 1);
    vColor = dominatingColor;
    vUV1 = vertexUV1;
    vNormal = vertexNormal;

    gl_Position = transformMatrix * vertexPosition;
    // float lighting = dot(sunlightAngle, vertexNormal);
    // vColor = vec3(1, 1, 1) * ambientLight * dot(sunlightAngle, vertexNormal) * sunlightIntensity;

}
`

