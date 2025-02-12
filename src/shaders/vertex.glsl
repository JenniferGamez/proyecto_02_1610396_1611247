precision highp float;

in vec3 position;
in vec3 normal;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform float u_time;
uniform float u_elasticity;
uniform vec3 u_click_position;

out vec3 v_positionWorld;
out float v_depth;
out float v_finalWave;
out vec3 v_normal;

void main() {
    v_positionWorld = (modelMatrix * vec4(position, 1.0)).xyz;

    vec3 pos = position;

    // Deformación de ondas

    float distance = length(pos - u_click_position);
    float clickWave = sin(distance * 10.0 + u_time * 5.0) * u_elasticity * 3.0;

    float wave1 = sin(position.x * 10.0 + u_time * 5.0) * cos(position.y * 10.0 + u_time * 5.0) * u_elasticity * 1.5;
    float wave2 = 0.5 * sin(position.x * 20.0 + u_time * 10.0) * cos(position.y * 20.0 + u_time * 10.0) * u_elasticity * 1.5;

    float finalWave = wave1 + wave2;
    if (distance < 1.0) {
        finalWave += clickWave;
    }
    v_finalWave = finalWave;

    float verticalDeformation = finalWave;
    float horizontalDeformation = 0.5 * finalWave;
    pos.z += verticalDeformation * 0.8 + horizontalDeformation * 0.2;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);

    v_depth = gl_Position.z / gl_Position.w;

    // *** Cálculo de la normal (si es necesaria para iluminación) ***
    // Si vas a usar iluminación, calcula la normal aquí.  Este ejemplo es básico:
    //vec3 tangent = dFdx(pos);
    //vec3 bitangent = dFdy(pos);
    //v_normal = normalize(cross(tangent, bitangent));

    // Si tienes normales por vértice precalculadas, puedes hacer:
    v_normal = mat3(modelMatrix) * normal; //Transforma las normales al espacio mundo
}