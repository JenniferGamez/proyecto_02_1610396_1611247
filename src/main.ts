import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
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

    this.particlesMaterial = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: this.settings.timeMultiplier },
        u_spiralFactor: { value: this.settings.spiralFactor },
        u_radiusScale: { value: this.settings.radiusScale },
        u_particleSize: { value: this.settings.particleSize }, 
      },
      glslVersion: THREE.GLSL3,
    });

    this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
    this.scene.add(this.particles);
  }

  private setupGUI(): void {
    this.gui.add(this.settings, 'timeMultiplier', 0.1, 15, 0.1).name('Velocidad');
    this.gui.add(this.settings, 'spiralFactor', 0.0, 2.0, 0.01).name('Factor Espiral');
    this.gui.add(this.settings, 'radiusScale', 0.1, 2.0, 0.01).name('Escala Radio');
    this.gui.add(this.settings, 'particleSize', 1.0, 10.0, 0.1).name('Tamaño Partículas');
    this.gui.add(this.settings, 'numPart', 100, 20000, 100).name('Num. de Partículas').onChange(()=>{this.createParticles()});
    
  }

  private updateUniforms(): void {
    //.particlesMaterial.uniforms.u_velocity.value.set(this.settings.velocityX, this.settings.velocityY, this.settings.velocityZ);
    console.log(this.particlesMaterial.uniforms.u_velocity.value);
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    const elapsedTime = ((Date.now() - this.startTime) / 1000) * this.settings.timeMultiplier;
    
    this.particlesMaterial.uniforms.u_time.value = elapsedTime;
    this.particlesMaterial.uniforms.u_spiralFactor.value = this.settings.spiralFactor;
    this.particlesMaterial.uniforms.u_radiusScale.value = this.settings.radiusScale;
    this.particlesMaterial.uniforms.u_particleSize.value = this.settings.particleSize;

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

const myApp = new App();
