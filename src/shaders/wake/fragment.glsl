
precision highp float;

in vec3 v_color;
in float v_opacity;

out vec4 FragColor;

void main() {
    FragColor = vec4(v_color, v_opacity);
}