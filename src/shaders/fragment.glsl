#version 300 es

in vec3 v_position; // Recibimos la posición desde el vertex shader

out vec4 FragColor; // Salida de color de la partícula

void main() {
  // Generamos un color en función de la posición de la partícula
  FragColor = vec4(fract(v_position), 1.0); // Color basado en la posición
}
