precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_clickTime;
uniform vec3 u_clickPosition;

in vec3 v_positionWorld;
in float v_depth;

out vec4 fragColor;

void main() {
    vec3 color = vec3(0.0, 0.0, 1.0); // Color base del cubo

    // Efectos visuales basados en la profundidad (opcional)
    float depthFactor = smoothstep(0.0, 1.0, v_depth); // Ajusta los valores para controlar el rango
    color = mix(color, vec3(0.2, 0.2, 0.2), depthFactor); // Mezclamos con un color más oscuro

    fragColor = vec4(color, 1.0);
}