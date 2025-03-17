
in vec3 position;
in vec3 a_color;
in float a_opacity;

uniform float u_time;
uniform float u_particleSize;

out vec3 v_color;
out float v_opacity;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    v_color = a_color;
    v_opacity = a_opacity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = u_particleSize;
}
