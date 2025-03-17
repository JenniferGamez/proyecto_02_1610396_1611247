import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
    const canvas = document.body.appendChild(this.renderer.domElement);

    // Crear partículas (directamente en el constructor)
    const numParticles = 10000;
    const positions = new Float32Array(numParticles * 3);
    const times = new Float32Array(numParticles);

    for (let i = 0; i < numParticles; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      times[i] = Math.random();
    }

    this.particlesGeometry = new THREE.BufferGeometry();
    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particlesGeometry.setAttribute('a_time', new THREE.BufferAttribute(times, 1));

    this.particlesMaterial = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_velocity: { value: new THREE.Vector3(0.5, 1, 0) },
        modelViewMatrix: { value: new THREE.Matrix4() },  // Añadir matrices
        projectionMatrix: { value: new THREE.Matrix4() },
      },
      glslVersion: THREE.GLSL3,
    });

    this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
    this.scene.add(this.particles);

    // Configuración de controles
    const controls = new OrbitControls(this.camera, canvas);
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

  private animate(): void {
    requestAnimationFrame(this.animate);
    const elapsedTime = (Date.now() - this.startTime) / 1000;

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
