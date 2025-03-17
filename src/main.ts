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
    private gravity: THREE.Vector3;
    private particleSize: number;
    private lifeTime: number;
    private explosionForce: number;

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
        this.camera.position.z = 5;

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

        // Parámetros (ajusta estos!)
        this.numParticles = 3000;
        this.gravity = new THREE.Vector3(0, -0.8, 0);
        this.particleSize = 3.0;
        this.lifeTime = 2.0;
        this.explosionForce = 5.0;

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
        this.handleKeyDown = this.handleKeyDown.bind(this);

        // Agregar event listeners
        window.addEventListener('resize', this.onWindowResize);
        window.addEventListener('keydown', this.handleKeyDown);

        // Iniciar el bucle principal
        this.animate();
    }


    private createParticles(): void {
        // Crear partículas
        const positions = new Float32Array(this.numParticles * 3);
        const colors = new Float32Array(this.numParticles * 3);
        const lifeTimes = new Float32Array(this.numParticles);
        const velocities = new Float32Array(this.numParticles * 3);

        for (let i = 0; i < this.numParticles; i++) {
            // Posición inicial centrada
            positions[i * 3] = (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = Math.random() * 0.2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

            // Velocidad inicial (explosión)
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * this.explosionForce;
            velocities[i * 3] = Math.cos(angle) * speed;
            velocities[i * 3 + 1] = Math.sin(angle) * speed;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5 * this.explosionForce;

            // Color inicial aleatorio
            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();

            // Tiempo de vida aleatorio
            lifeTimes[i] = Math.random() * this.lifeTime;
        }

        this.particlesGeometry = new THREE.BufferGeometry();
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlesGeometry.setAttribute('a_color', new THREE.BufferAttribute(colors, 3));
        this.particlesGeometry.setAttribute('a_lifeTime', new THREE.BufferAttribute(lifeTimes, 1));
        this.particlesGeometry.setAttribute('a_velocity', new THREE.BufferAttribute(velocities, 3));

        this.particlesMaterial = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                u_time: { value: 0 },
                u_gravity: { value: this.gravity },
                u_particleSize: { value: this.particleSize },
                u_lifeTime: { value: this.lifeTime },
                modelViewMatrix: { value: new THREE.Matrix4() },
                projectionMatrix: { value: new THREE.Matrix4() },
            },
            glslVersion: THREE.GLSL3,
        });

        // Remover las particulas anteriores
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particlesGeometry.dispose();
            this.particlesMaterial.dispose();
        }

        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
        this.scene.add(this.particles);
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.code === 'Space') {
            // Crear una nueva explosión
            this.createParticles();
        }
    }


    private animate(): void {
        requestAnimationFrame(this.animate);
        const elapsedTime = (Date.now() - this.startTime) / 1500;

        if (this.particlesMaterial && this.particlesMaterial.uniforms) {
            this.particlesMaterial.uniforms.u_time.value = elapsedTime;

            // Actualizamos las matrices
            this.particlesMaterial.uniforms.modelViewMatrix.value = this.camera.matrixWorldInverse;
            this.particlesMaterial.uniforms.projectionMatrix.value = this.camera.projectionMatrix;
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
