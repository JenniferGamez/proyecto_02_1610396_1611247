precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_clickTime;
uniform vec2 u_clickPosition;
out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(0.0, 0.0, 1.0);

  if (u_clickTime >= 0.0) {
    float t = u_time - u_clickTime;
    if (t <= 1.0) { 
      float distance = length(uv - u_clickPosition);
      float wave = sin(50.0 * distance - 5.0 * t) * exp(-5.0 * distance);
      if (distance < 0.3) { 
        color += vec3(0.2 * wave); 
      }
    }
  }

  fragColor = vec4(color, 1.0);
}



