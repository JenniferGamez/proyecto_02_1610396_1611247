// #version 300 es
precision highp float;

// Varyings de salida
in vec3 position;
in vec3 normal;

// Uniforms
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

uniform float u_smoothness; // Control de suavidad
uniform float u_time; // Tiempo para la animación

// Varyings de salida
out vec3 v_positionWorld;
out vec3 v_normal;

void main() {
    vec3 smoothedPosition = position;

    // Ejemplo de suavizado (puedes mejorarlo):
    // Este ejemplo mueve los vértices en una onda sinusoidal
    // Puedes experimentar con diferentes funciones y valores para lograr el efecto deseado
    float displacement = sin(position.x * 5.0 + u_time * 2.0) * u_smoothness * 0.5;
    smoothedPosition.y += displacement;

    v_positionWorld = (modelMatrix * vec4(smoothedPosition, 1.0)).xyz;
    v_normal = mat3(modelMatrix) * normal;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(smoothedPosition, 1.0);
}