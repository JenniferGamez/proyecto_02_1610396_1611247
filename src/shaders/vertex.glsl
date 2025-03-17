#version 300 es

in vec3 position; // La posición de la partícula
in float a_time; // Un valor asociado al tiempo de cada partícula (opcional)

uniform float u_time; // Tiempo global
uniform vec3 u_velocity; // Velocidad de las partículas

out vec3 v_position; // Salida al fragment shader

void main() {
  // Calculamos la nueva posición de la partícula
  vec3 newPosition = position + u_velocity * u_time;

  // Pasamos la nueva posición al fragment shader
  v_position = newPosition;

  // Establecemos la posición final en el espacio de recorte
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  // Ajustamos el tamaño del punto
  gl_PointSize = 5.0;
}
