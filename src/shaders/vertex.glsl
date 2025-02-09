// #version 300 es
precision mediump float;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

// - custom uniforms
uniform float u_time;
uniform vec3 u_drop_position;

// - attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// - custom
// in float a_random;

// - varying
// out float v_random;
// out float v_height;
// out vec2 v_uv;

vec4 clipSpaceTransform(vec4 modelPosition) {
  // already modelMatrix multiplied
  return projectionMatrix * viewMatrix * modelPosition;
}

void main() {
  vec3 pos = position;

    // Distancia al punto de caída
    float distance_to_drop = distance(pos.xz, u_drop_position.xz);

    // Tiempo transcurrido desde la caída (simulado)
    float time_since_drop = u_time - u_drop_position.y; // Asumimos que u_drop_position.y es el tiempo de la caída

    // Evitar divisiones por cero y calcular la expansión solo después de la caída
    if (time_since_drop > 0.0) {
        // Radio de expansión de las ondas
        float wave_radius = time_since_drop * 5.0; // Ajusta la velocidad de expansión

        // Intensidad de la onda (amplitud)
        float wave_amplitude = 0.2 * exp(-distance_to_drop / wave_radius); // Atenuación con la distancia

        // Desplazamiento vertical de los vértices
        float displacement = wave_amplitude * cos(distance_to_drop * 10.0 - time_since_drop * 20.0); // Frecuencia y velocidad de la onda

        pos.z += displacement;
  }

  vec4 viewPosition = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);

  gl_Position = viewPosition;
}