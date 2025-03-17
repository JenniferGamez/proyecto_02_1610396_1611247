precision highp float;

in vec3 v_position;  
in float v_alpha;  

out vec4 FragColor;  

void main() {
  // Hacer la partícula circular
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distance = length(coord);
  if (distance > 0.5) discard;  // Descartar fragmentos fuera del círculo

  // Convertir a coordenadas polares
  float angle = atan(v_position.y, v_position.x);  
  float radius = length(v_position.xy);  

  // Generar la espiral usando ondas sinusoidales
  float spiral = sin(angle * 10.0 + radius * 5.0);

  // Definir los colores de la galaxia (morado, azul, blanco)
  vec3 purple = vec3(0.6, 1.0, 1.0); // Morado
  vec3 blue = vec3(0.2, 0.4, 1.0);   // Azul
  vec3 white = vec3(1.0, 1.0, 1.0);  // Blanco

  // Mezclar los colores en función de la espiral
  vec3 color = mix(purple, blue, smoothstep(-1.0, 1.0, spiral));  
  color = mix(color, white, pow(radius, 0.5)); // Hacer el centro más brillante

  // Ajustar la intensidad del color basado en la distancia al centro
  float brightness = 1.4 - radius * 0.8;  
  color *= brightness;

  // Aplicar transparencia suave
  float alpha = smoothstep(0.5, 0.0, distance) * v_alpha * brightness;  

  FragColor = vec4(color, alpha);
}
