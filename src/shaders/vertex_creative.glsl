/// Vertex shader para el efecto de inflado de la geometría
// Material 3

precision highp float;

// Varyings
in vec3 position;
in vec3 normal;

out vec3 v_normal;
out vec3 v_positionWorld;

// Uniforms
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform float u_time;
uniform float u_inflateAmount; // Controla cuánto se infla la geometría

void main() {
    v_positionWorld = (modelMatrix * vec4(position, 1.0)).xyz;

    // Efecto de inflado basado en una onda senoidal
    float inflate = sin(u_time * 2.0) * u_inflateAmount;  
    vec3 inflatedPosition = position + normal * inflate;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(inflatedPosition, 1.0);

    v_normal = normalize(mat3(modelMatrix) * normal);
}