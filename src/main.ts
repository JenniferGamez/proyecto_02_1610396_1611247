import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';

// Shaders
import vertexGalaxy from './shaders/galaxy/vertex.glsl';
import fragmentGalaxy from './shaders/galaxy/fragment.glsl';
import vertexFireworks from './shaders/fireworks/vertex.glsl';
import fragmentFireworks from './shaders/fireworks/fragment.glsl';

// Variables para los programas de shader
let galaxyProgram;
let fireworksProgram;
let currentProgram;

class App {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    
    private galaxyMaterial!: THREE.RawShaderMaterial;
    private fireworksMaterial!: THREE.RawShaderMaterial;
    private particlesGeometry!: THREE.BufferGeometry;
    private particlesMaterial!: THREE.ShaderMaterial;
    private particles!: THREE.Points;
    
    private startTime: number;
    private gui: GUI;

    private settings = {
        particleSize: 1.0,
        timeMultiplier: 1.0,
        numPart: 10000,
        spiralFactor: 0.5,
        radiusScale: 1.0,
        shader: 'galaxy',
        fireworksVelocity: 1.0,
        fireworksSize: 1.0,
    };

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        if (!this.renderer.capabilities.isWebGL2) {
        console.warn('WebGL 2.0 no está disponible en este navegador.');
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Sistema de particulas
        this.initMaterials();
        this.createParticles();
        
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        
        this.gui = new GUI();
        this.setupGUI();
        
        this.startTime = Date.now();
        this.onWindowResize();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.animate();
    }

    private initMaterials(): void {
        this.galaxyMaterial = new THREE.RawShaderMaterial({
            vertexShader: vertexGalaxy,
            fragmentShader: fragmentGalaxy,
            uniforms: {
                u_time: { value: this.settings.timeMultiplier },
                u_spiralFactor: { value: this.settings.spiralFactor },
                u_radiusScale: { value: this.settings.radiusScale },
                u_particleSize: { value: this.settings.particleSize },
            },
            glslVersion: THREE.GLSL3,
        });

        // this.fireworksMaterial = new THREE.RawShaderMaterial({
        //     vertexShader: vertexFireworks,
        //     fragmentShader: fragmentFireworks,
        //     uniforms: {
        //         u_time: { value: this.settings.timeMultiplier },
        //         u_particleSize: { value: this.settings.particleSize },
        //         u_velocity: {value: this.settings.fireworksVelocity},
        //         u_size: {value: this.settings.fireworksSize},
        //     },
        //     glslVersion: THREE.GLSL3,
        // });
    }

    private createParticles(): void {
        // Si ya hay un sistema de partículas, eliminarlo antes de crear uno nuevo
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particlesGeometry.dispose();
            this.particlesMaterial.dispose();
        }

        const numParticles = this.settings.numPart;
        const positions = new Float32Array(numParticles * 3);
        const times = new Float32Array(numParticles);

        for (let i = 0; i < numParticles; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }

        this.particlesGeometry = new THREE.BufferGeometry();
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlesGeometry.setAttribute('a_time', new THREE.BufferAttribute(times, 1));

        this.updateMaterial();

        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
        this.scene.add(this.particles);
    }

    private setupGUI2(): void {
        
        this.gui.add(this.settings, 'particleSize', 1.0, 10.0, 0.1).name('Tamaño Partículas');
        
        this.gui.add(this.settings, 'numPart', 100, 20000, 100).name('Num. de Partículas').onChange(()=>{this.createParticles()});
        
    }

    private setupGUI(): void {
        this.gui.add(this.settings, 'shader', ['galaxy', 'fireworks']).name('Shader').onChange(() => {
            this.updateMaterial();
        });
        this.gui.add(this.settings, 'timeMultiplier', 0.1, 15, 0.1).name('Velocidad');
        this.gui.add(this.settings, 'particleSize', 1.0, 10.0, 0.1).name('Tamaño Partículas');
        this.gui.add(this.settings, 'numPart', 100, 20000, 100).name('Num. de Partículas').onChange(() => { this.createParticles(); });

        // Parametros especificos de galaxy
        const galaxyFolder = this.gui.addFolder('Galaxy Settings');
        galaxyFolder.add(this.settings, 'spiralFactor', 0.0, 2.0, 0.01).name('Factor Espiral');
        galaxyFolder.add(this.settings, 'radiusScale', 0.1, 2.0, 0.01).name('Escala Radio');
        galaxyFolder.add(this.settings, 'timeMultiplier', 0.1, 15, 0.1).name('Velocidad');

        //parametros especificos de fireworks
        const fireworksFolder = this.gui.addFolder('Fireworks Settings');
        fireworksFolder.add(this.settings, 'fireworksVelocity', 0.1, 10.0, 0.1).name('Velocity');
        fireworksFolder.add(this.settings, 'fireworksSize', 1.0, 10.0, 0.1).name('Size');
    }

    private updateMaterial(): void {
        if (this.settings.shader === 'galaxy') {
            this.particlesMaterial = this.galaxyMaterial;
        } else if (this.settings.shader === 'fireworks') {
            this.particlesMaterial = this.fireworksMaterial;
        }
        this.particles.material = this.particlesMaterial;
    }

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        const elapsedTime = ((Date.now() - this.startTime) / 1000) * this.settings.timeMultiplier;
        
        this.particlesMaterial.uniforms.u_time.value = elapsedTime;
        this.particlesMaterial.uniforms.u_particleSize.value = this.settings.particleSize;

        if (this.settings.shader === 'galaxy') {
            this.particlesMaterial.uniforms.u_spiralFactor.value = this.settings.spiralFactor;
            this.particlesMaterial.uniforms.u_radiusScale.value = this.settings.radiusScale;
        } else if (this.settings.shader === 'fireworks') {
            this.particlesMaterial.uniforms.u_velocity.value = this.settings.fireworksVelocity;
            this.particlesMaterial.uniforms.u_size.value = this.settings.fireworksSize;
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
