precision highp float;

in vec3 position;  // La posición de la partícula
in float a_time;   // El tiempo de la partícula

uniform float u_time;  // Tiempo global
uniform vec3 u_velocity;  // Velocidad de las partículas
uniform mat4 modelViewMatrix;  // Matriz de vista
uniform mat4 projectionMatrix;  // Matriz de proyección

out vec3 v_position;  // Posición en el fragment shader

void main() {
  // Calculamos la nueva posición de la partícula
  vec3 newPosition = position + u_velocity * u_time;

  // Pasamos la nueva posición al fragment shader
  v_position = newPosition;

  // Aplicamos la matriz modelViewMatrix y projectionMatrix manualmente
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  // Ajustamos el tamaño del punto
  gl_PointSize = 5.0;
}
