precision highp float;

in vec3 v_positionWorld;
in vec3 v_normal;
in float v_depth;
in float v_finalWave;

out vec4 fragColor;

// Uniforms
uniform vec3 cameraPosition; 
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform vec3 u_objectColor; // Color base (verde en este caso)
uniform float u_time;
uniform float u_shininess;    // Brillo
uniform float u_transparency; // Transparencia (alpha)
uniform float u_jiggleIntensity; // Intensidad del temblequeo

void main() {
    // 1. Iluminación (difusa)
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(u_lightDirection);
    float diffuse = max(dot(normal, lightDir), 0.0);
    vec3 diffuseColor = u_objectColor * diffuse;

    // Especular (brillo)
    vec3 viewDir = normalize(cameraPosition - v_positionWorld); // Vector a la cámara
    vec3 reflectDir = reflect(-lightDir, normal);
    float specular = pow(max(dot(viewDir, reflectDir), 0.0), u_shininess);
    vec3 specularColor = u_lightColor * specular;

    // Luz ambiental (para que no se vea completamente oscuro)
    vec3 ambientColor = u_objectColor * 0.1; // Ajusta este valor

    vec3 finalLighting = ambientColor + diffuseColor + specularColor;

    // 2. Temblequeo (usando v_finalWave)
    // float jiggleFactor = v_finalWave * u_jiggleIntensity; // Temblequeo proporcional a la onda
    // vec3 jiggleOffset = normal * jiggleFactor;
    // gl_FragCoord.xy += jiggleOffset.xy; // Desplazamiento visual

    // 3. Color final con transparencia
    fragColor = vec4(finalLighting, u_transparency);
}