precision highp float;

in vec3 v_position;  // Recibimos la posición de la partícula

out vec4 FragColor;  // Color de la partícula

void main() {
  // Color basado en la posición de la partícula
  FragColor = vec4(fract(v_position), 1.0);  // Puedes cambiar el color aquí
}
