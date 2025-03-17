in vec3 position;
in vec3 a_color;
in float a_lifeTime;
in vec3 a_velocity;

uniform float u_time;
uniform vec3 u_gravity;
uniform float u_particleSize;
uniform float u_lifeTime;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec3 v_color;
out float v_opacity;

void main() {
    float timeLived = mod(u_time, u_lifeTime);
    float lifeRatio = timeLived / a_lifeTime;

    // Movimiento: sube con velocidad + dispersión
    vec3 newPosition = position + a_velocity * timeLived + 0.5 * u_gravity * timeLived * timeLived;
    newPosition.x += sin(timeLived * 5.0) * 0.2; // Pequeñas oscilaciones para turbulencia

    // Color: de naranja a negro
    v_color = mix(a_color, vec3(0.1, 0.1, 0.1), lifeRatio);

    // Opacidad: alta al inicio, baja al final
    v_opacity = 1.0 - lifeRatio;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = u_particleSize * (1.0 - lifeRatio); // Disminuye el tamaño con el tiempo
}