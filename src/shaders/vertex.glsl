precision highp float;

in vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform float u_time;
uniform float u_elasticity;
uniform vec3 u_click_position; // Nuevo uniforme para la posición del clic

out vec3 v_positionWorld;
out float v_depth;

void main() {
    v_positionWorld = (modelMatrix * vec4(position, 1.0)).xyz;

    vec3 pos = position;

    // 1. Onda centrada en el clic
    float distance = length(pos - u_click_position);
    float clickWave = sin(distance * 10.0 + u_time * 5.0) * u_elasticity;

    // 2. Múltiples ondas existentes
    float wave1 = sin(position.x * 10.0 + u_time * 5.0) * cos(position.y * 10.0 + u_time * 5.0) * u_elasticity;
    float wave2 = 0.5 * sin(position.x * 20.0 + u_time * 10.0) * cos(position.y * 20.0 + u_time * 10.0) * u_elasticity;

    // 3. Combinación de todas las ondas
    float finalWave = wave1 + wave2; // Ondas existentes
    if (distance < 1.0) { // Deformación del clic solo si está cerca
        finalWave += clickWave; // Sumamos la onda del clic
    }

    // 4. Distorsión direccional (opcional)
    float verticalDeformation = finalWave;
    float horizontalDeformation = 0.5 * finalWave;
    pos.z += verticalDeformation * 0.8 + horizontalDeformation * 0.2;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);

    v_depth = gl_Position.z / gl_Position.w;
}