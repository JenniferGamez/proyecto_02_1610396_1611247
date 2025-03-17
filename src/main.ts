import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class App {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private particlesGeometry!: THREE.BufferGeometry;
    private particlesMaterial!: THREE.RawShaderMaterial;
    private particles!: THREE.Points;
    private startTime: number;
    private numParticles: number;
    private particleSize: number;
    private baseSpeed: number;
    private trailObject: THREE.Mesh;
    private trailColor: THREE.Color;

    private camConfig = {
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000,
    };

    constructor() {
        // Crear escena
        this.scene = new THREE.Scene();

        // Configuración de la cámara
        this.camera = new THREE.PerspectiveCamera(
            this.camConfig.fov,
            this.camConfig.aspect,
            this.camConfig.near,
            this.camConfig.far
        );
        this.camera.position.z = 10;

        // Configuración del renderizador
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
        });
        if (!this.renderer.capabilities.isWebGL2) {
            console.warn('WebGL 2.0 no está disponible en este navegador.');
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Parámetros
        this.numParticles = 5000;
        this.particleSize = 2;
        this.baseSpeed = 1;
        this.trailColor = new THREE.Color(0.0, 1.0, 1.0); // Color cian


        // Crear el objeto que dejará la estela
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.trailObject = new THREE.Mesh(geometry, material);
        this.scene.add(this.trailObject);

        // Inicializar el sistema de partículas
        this.createParticles();

        // Configuración de controles
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;

        // Inicialización
        this.startTime = Date.now();
        this.onWindowResize();

        // Enlazar métodos
        this.onWindowResize = this.onWindowResize.bind(this);
        this.animate = this.animate.bind(this);

        // Agregar event listeners
        window.addEventListener('resize', this.onWindowResize);

        // Iniciar el bucle principal
        this.animate();
    }


    private createParticles(): void {
        // Crear partículas
        const positions = new Float32Array(this.numParticles * 3);
        const colors = new Float32Array(this.numParticles * 3);
        const opacities = new Float32Array(this.numParticles);

        for (let i = 0; i < this.numParticles; i++) {
            // Posición inicial (centrada en el objeto)
            positions[i * 3] = this.trailObject.position.x;
            positions[i * 3 + 1] = this.trailObject.position.y;
            positions[i * 3 + 2] = this.trailObject.position.z;

            // Color (cian)
            colors[i * 3] = this.trailColor.r;
            colors[i * 3 + 1] = this.trailColor.g;
            colors[i * 3 + 2] = this.trailColor.b;

            // Opacidad inicial
            opacities[i] = 1.0;
        }

        this.particlesGeometry = new THREE.BufferGeometry();
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlesGeometry.setAttribute('a_color', new THREE.BufferAttribute(colors, 3));
        this.particlesGeometry.setAttribute('a_opacity', new THREE.BufferAttribute(opacities, 1));

        this.particlesMaterial = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                u_time: { value: 0 },
                u_particleSize: { value: this.particleSize },
            },
            glslVersion: THREE.GLSL3,
        });

        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
        this.scene.add(this.particles);
    }

    private updateParticles(): void {
        const positions = this.particlesGeometry.attributes.position.array as THREE.TypedArray;
        const opacities = this.particlesGeometry.attributes.a_opacity.array as THREE.TypedArray;

        for (let i = this.numParticles - 1; i > 0; i--) {
            // Mover la posición de la partícula a la posición de la anterior
            positions[i * 3] = positions[(i - 1) * 3];
            positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
            positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];

            // Desvanecer la opacidad
            opacities[i] = opacities[i - 1] * 0.99; // Ajusta este valor para cambiar la velocidad de desvanecimiento
        }

        // La primera partícula sigue al objeto guía
        positions[0] = this.trailObject.position.x;
        positions[1] = this.trailObject.position.y;
        positions[2] = this.trailObject.position.z;
        opacities[0] = 1.0;

        this.particlesGeometry.attributes.position.needsUpdate = true;
        this.particlesGeometry.attributes.a_opacity.needsUpdate = true;
    }

    private animate(): void {
        requestAnimationFrame(this.animate);
        const elapsedTime = (Date.now() - this.startTime) / 1000;

        // Movimiento del objeto guía (onda senoidal)
        this.trailObject.position.x = Math.sin(elapsedTime * this.baseSpeed) * 3; // Ajusta este valor para cambiar la amplitud
        this.trailObject.position.y = Math.cos(elapsedTime * this.baseSpeed * 0.5) * 2;  // Ajusta este valor para cambiar la amplitud
        this.trailObject.position.z = Math.cos(elapsedTime * this.baseSpeed * 0.3) * 1;  // Ajusta este valor para cambiar la amplitud

        // Actualizar el sistema de partículas
        this.updateParticles();

        if (this.particlesMaterial && this.particlesMaterial.uniforms) {
            this.particlesMaterial.uniforms.u_time.value = elapsedTime;
        }

        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const myApp = new App();
