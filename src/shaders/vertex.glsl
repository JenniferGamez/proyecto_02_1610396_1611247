precision highp float;

in vec3 position;  
in float a_time;   

uniform float u_time;  
uniform mat4 modelViewMatrix;  
uniform mat4 projectionMatrix;  

out vec3 v_position;  
out float v_alpha;  

void main() {
  float angle = atan(position.y, position.x);
  float radius = length(position.xy);
  float spiralFactor = 0.5 * radius; // Factor de giro en espiral
  float timeFactor = u_time * 0.1; 

  vec3 newPosition = vec3(
    radius * cos(angle + spiralFactor + timeFactor),
    radius * sin(angle + spiralFactor + timeFactor),
    position.z * 0.1
  );

  v_position = newPosition;
  v_alpha = 1.0 - smoothstep(0.0, 5.0, radius); // Atenuación en el borde

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  gl_PointSize = 2.0 + 2.0 * (1.0 - radius / 5.0);
}
