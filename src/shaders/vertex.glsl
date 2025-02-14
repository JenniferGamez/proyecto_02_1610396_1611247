precision highp float;

in vec3 a_position;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

uniform float u_time;
uniform float u_smoothness;

out vec3 v_position;

void main() {
    vec3 position = a_position;

    // Calcula la deformación basada en el tiempo y la suavidad.
    // Puedes ajustar la intensidad de la deformación multiplicando por un escalar.
    float deformation = sin(position.x * u_smoothness + u_time) * 0.2; 

    position.z += deformation; // Aplica la deformación en el eje Z.

    vec4 worldPosition = u_modelMatrix * vec4(position, 1.0);
    gl_Position = u_projectionMatrix * u_viewMatrix * worldPosition;

    v_position = worldPosition.xyz;
}