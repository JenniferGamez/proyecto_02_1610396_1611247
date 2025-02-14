precision highp float;

in vec3 v_positionWorld;
in vec3 v_normal;

out vec4 fragColor;

// Uniforms
uniform vec3 cameraPosition; 
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform vec3 u_objectColor; // Color base (verde en este caso)
uniform float u_time;
uniform float u_shininess;    // Brillo
uniform float u_transparency; // Transparencia (alpha)
//uniform float u_jiggleIntensity; // Intensidad del temblequeo

void main() {
    // Iluminación (difusa)
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(u_lightDirection);
    float diffuse = max(dot(normal, lightDir), 0.2);
    vec3 diffuseColor = u_objectColor * diffuse;

    // Especular (brillo)
    vec3 viewDir = normalize(cameraPosition - v_positionWorld);
    vec3 reflectDir = reflect(-lightDir, normal);
    float specular = pow(max(dot(viewDir, reflectDir), 0.1), u_shininess);
    vec3 specularColor = u_lightColor * specular;

    // Luz ambiental
    vec3 ambientColor = u_objectColor * 0.2;

    vec3 finalLighting = ambientColor + diffuseColor + specularColor;

    // Color final con transparencia
    fragColor = vec4(finalLighting, u_transparency);
}