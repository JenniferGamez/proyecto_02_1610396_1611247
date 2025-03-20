// Fragment shader for Blinn-Phong
// Fragment Material 2

precision highp float;

// Varyings
in vec3 v_positionWorld;
in vec3 v_normal;

out vec4 fragColor;

// Uniforms
uniform vec3 cameraPosition;

uniform vec3 u_lightColor;
uniform vec3 u_materialColor;
uniform vec3 u_specularColor;
uniform float u_shininess;
uniform vec3 u_lightDirection;
uniform float u_transparency;

void main() {

    vec3 normal = normalize(v_normal);

    // Calculate light direction
    vec3 lightDir = normalize(u_lightDirection);

    // Ambient Lighting
    vec3 ambient = u_materialColor * 0.2;

    // Diffuse Lighting
    float diffuseFactor = max(dot(normal, lightDir), 0.2);
    vec3 diffuse = diffuseFactor * u_lightColor * u_materialColor;

    // Specular Lighting (Blinn-Phong)
    vec3 viewDir = normalize(cameraPosition - v_positionWorld);
    vec3 halfVector = normalize(lightDir + viewDir);
    float specularFactor = pow(max(dot(normal, halfVector), 0.0), u_shininess);
    vec3 specular = specularFactor * u_specularColor;

    vec3 color = ambient + diffuse + specular;

    fragColor = vec4(color, u_transparency);
}