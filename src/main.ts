import * as THREE from 'three';
import * as dat from 'dat.gui';

import { OrbitControls } from 'three/examples/jsm/Addons.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private material: THREE.RawShaderMaterial;
  private mesh: THREE.Mesh;
  private startTime: number;
  private clickTime: number;
  private clickPosition: THREE.Vector3;
  private elasticity: number;
  private params: { geometry: string };

  private camConfig = {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
  };

  constructor() {
    // Create scene
    this.scene = new THREE.Scene();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      this.camConfig.fov,
      this.camConfig.aspect,
      this.camConfig.near,
      this.camConfig.far
    );

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    if (!this.renderer.capabilities.isWebGL2) {
      console.warn('WebGL 2.0 is not available on this browser.');
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const canvas = document.body.appendChild(this.renderer.domElement);

    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    // Controles GUI
    const gui = new dat.GUI();
    this.params = { geometry: 'cube' };
    gui.add(this.params, 'geometry', ['cube', 'sphere', 'torus'])
        .onChange(() => this.updateGeometry());
    
    // Create shader material
    this.elasticity = 0.0; // Inicializa la elasticidad
    
    //this.geometry = new THREE.BoxGeometry(6, 6, 6);
    this.material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,

      transparent: true,
      uniforms: {
        projectionMatrix: { value: this.camera.projectionMatrix },
        viewMatrix: { value: this.camera.matrixWorldInverse },
        modelMatrix: { value: new THREE.Matrix4() },
        // custom uniforms
        u_time: { value: 0.0 },
        u_resolution: { value: resolution },
        u_elasticity: { value: this.elasticity },
        //u_texture: { value: this.texture },
        u_clickTime: { value: -1.0 },
        u_clickPosition: { value: new THREE.Vector3(-1.0, -1.0, -1.0) },
        // ... (tus uniforms existentes)
        u_shininess: { value: 32.0 }, // Ajusta el brillo (valores altos = brillo más pequeño)
        u_transparency: { value: 0.6 }, // Ajusta la transparencia (0.0 - 1.0)
        u_jiggleIntensity: { value: 0.05 }, // Intensidad del temblequeo
        u_lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() }, // Ejemplo de dirección de la luz
        u_lightColor: { value: new THREE.Color(0xffffff) }, // Color de la luz
        u_objectColor: { value: new THREE.Color(0x00ff00) }, // Color del objeto (verde en este ejemplo)
        cameraPosition: { value: this.camera.position }, // Posición de la cámara
      },
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
    });

    // Create mesh: Water - Cube geometry inicial
    const geometry = new THREE.BoxGeometry(6, 6, 6);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.y = Math.PI / 5;
    this.mesh.rotation.x = Math.PI / 6;
    this.mesh.position.y = 1;
    this.scene.add(this.mesh);
    this.camera.position.z = 9;

    // Controls
    const controls = new OrbitControls(this.camera, canvas);
    controls.enableDamping = true;

    // Initialize
    this.startTime = Date.now();
    this.clickTime = -1;
    this.clickPosition = new THREE.Vector3(-1.0, -1.0);
    this.onWindowResize();

    // Bind methods
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate = this.animate.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);

    // Add event listeners
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('click', this.onDocumentClick);

    // Start the main loop
    this.animate();
  }

  private updateGeometry() {
    this.mesh.geometry.dispose(); // Importante: Dispose de la geometría anterior
    let newGeometry;

    switch (this.params.geometry) {
        case 'cube':
            newGeometry = new THREE.BoxGeometry(6, 6, 6);
            break;
        case 'sphere':
            newGeometry = new THREE.SphereGeometry(3, 32, 32); // Ajusta el radio según necesites
            break;
        case 'torus':
            newGeometry = new THREE.TorusGeometry(3, 1, 32, 64); // Ajusta los parámetros del torus
            break;
        default:
            newGeometry = new THREE.BoxGeometry(6, 6, 6); // Geometría por defecto
    }

    this.mesh.geometry = newGeometry; // Asigna la nueva geometría
  }

  private animate(): void {
    requestAnimationFrame(this.animate);
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    this.material.uniforms.u_time.value = elapsedTime;
  
    // Actualiza las matrices en cada frame
    this.material.uniforms.cameraPosition.value = this.camera.position;
    this.material.uniforms.projectionMatrix.value = this.camera.projectionMatrix;
    this.material.uniforms.viewMatrix.value = this.camera.matrixWorldInverse;
    this.material.uniforms.modelMatrix.value = this.mesh.matrixWorld; // Importante: usa la matriz del objeto
    
    // Amortiguación
    if (this.elasticity > 0.001) {
      this.elasticity -= 0.02 * this.elasticity;
      this.material.uniforms.u_elasticity.value = this.elasticity;
    } else {
      this.elasticity = 0.0; // Asegura que la elasticidad llegue a cero
      this.material.uniforms.u_elasticity.value = this.elasticity;
    }

    // *** NUEVO: Actualización de las uniforms de efectos ***
    // Puedes usar Math.sin, Math.cos o cualquier otra función para variar los valores
    // de las uniforms con el tiempo.  ¡Experimenta con diferentes valores!

    const jiggleIntensity = 0.03 + Math.sin(elapsedTime * 4) * 0.015; // Rango: 0.015 a 0.045
    const shininess = 16.0 + Math.cos(elapsedTime * 2) * 8; // Rango: 8 a 24
    const transparency = 0.5 + Math.sin(elapsedTime * 2) * 0.1; // Rango: 0.4 a 0.6

    this.material.uniforms.u_jiggleIntensity.value = jiggleIntensity;
    this.material.uniforms.u_shininess.value = shininess;
    this.material.uniforms.u_transparency.value = transparency;

    // Si quieres variar la refracción y dispersión:
    // this.material.uniforms.u_refractionIntensity.value = 0.1 + Math.sin(elapsedTime) * 0.05;
    // this.material.uniforms.u_dispersionIntensity.value = 0.1 + Math.cos(elapsedTime) * 0.05;

    this.renderer.render(this.scene, this.camera);
  }
  

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.u_resolution.value.set(width, height);
  }

  private onDocumentClick(event: MouseEvent): void {
    this.clickTime = (Date.now() - this.startTime) / 1000;
    //this.clickPosition.set(event.clientX / window.innerWidth, 1.0 - event.clientY / window.innerHeight);
    this.material.uniforms.u_clickTime.value = this.clickTime;
    this.material.uniforms.u_clickPosition.value.copy(this.clickPosition);
  
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        this.material.uniforms.u_clickPosition.value = intersectionPoint; // Usa Vector3
        this.material.uniforms.u_clickTime.value = this.clickTime;

        // Activa la elasticidad
        this.elasticity = 1.0; 
        this.material.uniforms.u_elasticity.value = this.elasticity; // Actualiza el uniforme
    } else {
        this.material.uniforms.u_clickTime.value = -1;
    }
  }
}

const myApp = new App();
