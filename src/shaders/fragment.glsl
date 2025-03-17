precision highp float;

in vec3 v_position;  
in float v_alpha;  

out vec4 FragColor;  

void main() {
  float distance = length(gl_PointCoord - vec2(0.5));
  float alpha = smoothstep(0.5, 0.0, distance) * v_alpha;  

  vec3 color = vec3(0.8, 0.6, 1.0) * (1.0 - length(v_position) * 0.2);  

  FragColor = vec4(color, alpha);
}
