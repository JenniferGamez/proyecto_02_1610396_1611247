// #version 300 es
precision mediump float;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
// - custom uniforms
uniform float u_time;

// - attributes
in vec3 position;
in vec3 normal;
in vec2 uv;
// - custom
in float a_random;

// - varying
out float v_random;
out float v_height;
out vec2 v_uv;

vec4 clipSpaceTransform(vec4 modelPosition) {
  // already modelMatrix multiplied
  return projectionMatrix * viewMatrix * modelPosition;
}

void main() {
  // 01. base vertex shader
  vec4 viewPosition = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

  // 02. basic vertex mod with sin function
  // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // modelPosition.z += sin(modelPosition.x * 18.0) * 0.1;
  // vec4 viewPosition = clipSpaceTransform(modelPosition);

  // 03. attribute handling
  // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // modelPosition.z += a_random * 0.071;
  // vec4 viewPosition = clipSpaceTransform(modelPosition);
  // v_random = a_random;

  // 04. attribute handling with custom uniform (time)
  // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // modelPosition.z += sin(modelPosition.x * 10.0 + u_time * 1.0) * 0.07;
  // vec4 viewPosition = clipSpaceTransform(modelPosition);
  // v_height = sin(modelPosition.x * 10.0 + u_time * 1.0);

  // 05. passing UVs
  v_uv = uv;

  gl_Position = viewPosition;
}
