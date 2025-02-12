precision highp float;

in vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform float u_time;
uniform float u_clickTime;
uniform vec2 u_clickPosition;

void main() {
  vec3 pos = position;

  if (u_clickTime >= 0.0) {
    float t = u_time - u_clickTime;
    if (t <= 1.0) {
      vec2 clickPos = (u_clickPosition * 2.0 - 1.0) * vec2(projectionMatrix[0][0], projectionMatrix[1][1]);
      float distance = length(pos.xy - clickPos);
      float wave = sin(50.0 * distance - 5.0 * t) * exp(-5.0 * distance);
      if (distance < 0.3) { 
        pos.z += wave * 0.5;
      }
    }
  }

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}