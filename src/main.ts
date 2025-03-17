import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class App {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private particlesGeometry!: THREE.BufferGeometry;
    private particlesMaterial!: THREE.PointsMaterial;
    private particles!: THREE.Points;
    private startTime: number;
    private numParticles: number;
    private clock: THREE.Clock;

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

        // Sistema de partículas
        this.numParticles = 5000;
        this.clock = new THREE.Clock();
        this.createGalaxy();

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

    private createGalaxy(): void {
        const positions = new Float32Array(this.numParticles * 3);
        const colors = new Float32Array(this.numParticles * 3);

        for (let i = 0; i < this.numParticles; i++) {
            // Coordenadas en espiral
            const angle = i * 0.02;
            const radius = Math.sqrt(i) * 0.3;
            const x = radius * Math.cos(angle);
            const y = (Math.random() - 0.5) * 1.5;
            const z = radius * Math.sin(angle);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Colores en degradado (azul, morado, blanco)
            colors[i * 3] = Math.random() * 0.5 + 0.5;
            colors[i * 3 + 1] = Math.random() * 0.2;
            colors[i * 3 + 2] = Math.random() * 0.8 + 0.2;
        }

        this.particlesGeometry = new THREE.BufferGeometry();
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
        this.scene.add(this.particles);
    }
    

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.code === 'Space') {
            // Crear una nueva explosión
            this.createGalaxy();
        }
    }


    private animate(): void {
        requestAnimationFrame(this.animate);
        const elapsedTime = (Date.now() - this.startTime) / 1500;

        // Rotación de la galaxia
        this.particles.rotation.y = elapsedTime * 0.05;

        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

const myApp = new App();