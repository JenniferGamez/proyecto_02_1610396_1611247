precision highp float;

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;

uniform float u_time;
uniform float u_smoothness;

out vec3 v_normal;
out vec3 v_position;

void main() {
  vec3 position = a_position;

  // Deformación basada en la posición original y el tiempo
  float deformation = sin(position.x * u_smoothness + u_time) * cos(position.y * u_smoothness + u_time);
  position.z += deformation;

  // Transformación de la posición
  vec4 worldPosition = u_modelMatrix * vec4(position, 1.0);
  gl_Position = u_projectionMatrix * u_viewMatrix * worldPosition;

  // Cálculo de la normal
  v_normal = mat3(u_modelMatrix) * a_normal;
  v_position = worldPosition.xyz;
}