precision highp float;

in vec3 position;
in float a_time;

uniform float u_time;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float u_spiralFactor; // Nuevo uniform
uniform float u_radiusScale;  // Nuevo uniform
uniform float u_particleSize; // Nuevo uniform

out vec3 v_position;
out float v_alpha;

void main() {
    float angle = atan(position.y, position.x);
    float radius = length(position.xy) * u_radiusScale; // Aplicar escala al radio
    float spiralFactor = u_spiralFactor * radius; // Usar el nuevo uniform
    float timeFactor = u_time * 0.1;

    vec3 newPosition = vec3(
        radius * cos(angle + spiralFactor + timeFactor),
        radius * sin(angle + spiralFactor + timeFactor),
        position.z * 0.1
    );

    v_position = newPosition;
    v_alpha = 1.0 - smoothstep(0.0, 5.0, radius);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = u_particleSize + u_particleSize * (1.0 - radius / 5.0); // Usar el nuevo uniform
}