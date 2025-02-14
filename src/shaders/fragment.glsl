// Vertex shader. Material 1.

precision highp float;

// Varyings
in vec3 v_vertexColor; 

out vec4 fragColor;

void main() {
    fragColor = vec4(v_vertexColor, 1.0);
}