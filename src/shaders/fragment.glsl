precision highp float;


uniform float u_time;
in vec3 v_positionWorld;
in float v_depth;
in float v_finalWave;
in vec3 v_normal;

out vec4 fragColor;

void main() {
    vec3 color = vec3(0.02, 0.28, 0.08); // Azul base
    
    // Modificar el color basado en la deformación
    //float waveFactor = abs(v_finalWave) * 2.0; // Ajustar la escala
    float waveFactor = abs(v_finalWave) * 0.5; // Ajustar la escala
    color = mix(color, vec3(1.0, 0.0, 0.0), waveFactor); // Mezclar con rojo

    fragColor = vec4(color, 1.0);
}