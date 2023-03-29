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
#define NORMAL

precision mediump float;

varying mediump vec4 vPosition;
varying mediump vec3 vColor;
varying mediump vec2 vUV1;
varying mediump vec3 vNormal;
varying mediump vec3 vFragPos;
varying mediump vec3 vSkyColor;

uniform sampler2D uSampler;
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

    // gl_FragColor = vec4(litTexture.xyz, 1);
    // gl_FragColor = vec4(ambientColor.xyz, 1);
    // gl_FragColor = vec4(0, 0, 0, 1);
    vec3 mixedColor = combinedAmbient * objectColor; 

    vec3 lightDir = normalize(lightPos - vFragPos);

    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;


    vec3 result = (combinedAmbient + diffuse) * objectColor;

    // gl_FragColor = vec4(mixedColor.xyz, 1);
    gl_FragColor = vec4(result.xyz, 1);

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

void main() {
    vPosition = vertexPosition;
    vColor = vertexColor;
    vUV1 = vertexUV1;
    vNormal = vertexNormal;
    // vec4 t = ;
    // vec3 p = 
    vFragPos = vec3(modelMatrix * vec4(vertexPosition.xyz, 1));
    // vSkyColor = skyColor;
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

