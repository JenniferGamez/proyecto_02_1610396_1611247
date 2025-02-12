precision highp float;

in vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform float u_time;
uniform float u_elasticity;

out vec3 v_positionWorld;
out float v_depth; // Para efectos visuales en el fragment shader

void main() {
    v_positionWorld = (modelMatrix * vec4(position, 1.0)).xyz;

    vec3 pos = position;

    // Múltiples ondas
    float wave1 = sin(position.x * 10.0 + u_time * 5.0) * cos(position.y * 10.0 + u_time * 5.0) * u_elasticity;
    float wave2 = 0.5 * sin(position.x * 20.0 + u_time * 10.0) * cos(position.y * 20.0 + u_time * 10.0) * u_elasticity;

    // Distorsión direccional
    float verticalDeformation = wave1 + wave2;
    float horizontalDeformation = 0.5 * wave1 + 0.5 * wave2; // Menos deformación horizontal
    pos.z += verticalDeformation * 0.8 + horizontalDeformation * 0.2;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);

    // Calculamos la profundidad para usarla en el fragment shader
    v_depth = gl_Position.z / gl_Position.w;
}