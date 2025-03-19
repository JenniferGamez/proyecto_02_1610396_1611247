precision highp float;

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

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = u_particleSize;
}