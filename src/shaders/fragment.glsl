precision highp float;

in vec3 v_color;
in float v_opacity;

out vec4 FragColor;

void main() {
    // Suavizar los bordes para dar efecto de humo difuminado
    float dist = length(gl_PointCoord - vec2(0.5)); // Distancia desde el centro
    float alpha = smoothstep(0.5, 0.2, dist) * v_opacity; 

    FragColor = vec4(v_color, alpha);
}