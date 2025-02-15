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
uniform float u_shininess;    // Brillo
uniform vec3 u_lightDirection;
//uniform vec3 u_objectColor;  // No se usa directamente con Blinn-Phong, se usa u_materialColor
uniform float u_time;
uniform float u_transparency; // Transparencia (alpha)


void main() {
    // Normalize normal vector (important!)
    vec3 normal = normalize(v_normal);

    // Calculate light direction (ensure it's normalized)
    vec3 lightDir = normalize(u_lightDirection);

    // Ambient Lighting (optional, but good to have)
    vec3 ambient = u_materialColor * 0.1; // Adjust 0.1 for intensity

    // Diffuse Lighting
    float diffuseFactor = max(dot(normal, lightDir), 0.0); // No clamp to 0.2, use 0.0
    vec3 diffuse = diffuseFactor * u_lightColor * u_materialColor;


    // Specular Lighting (Blinn-Phong)
    vec3 viewDir = normalize(cameraPosition - v_positionWorld);
    vec3 halfVector = normalize(lightDir + viewDir);
    float specularFactor = pow(max(dot(normal, halfVector), 0.0), u_shininess);
    vec3 specular = specularFactor * u_lightColor * u_specularColor;

    // Combine all lighting components
    vec3 color = ambient + diffuse + specular;  // Sum all components

    // Apply transparency
    fragColor = vec4(color, u_transparency);
}