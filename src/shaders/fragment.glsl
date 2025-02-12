precision highp float;

in vec3 v_positionWorld;
in float v_depth;

out vec4 fragColor;

void main() {
    vec3 color = vec3(0.08, 0.65, 0.06); // Color base del cubo (azul)
    fragColor = vec4(color, 1.0);
}