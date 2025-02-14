import * as THREE from 'three';
import * as dat from 'dat.gui';

import { OrbitControls } from 'three/examples/jsm/Addons.js';

// Material shaders 1
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

// Material shaders 2: Cube Gelatin
import vertexGelatinShader from './shaders/vertexBlinn.glsl';
import fragmentGelatinShader from './shaders/fragmentBlinn.glsl';

// Material shaders 3: Shader creativo
import vertexCreativeShader from './shaders/vertex_creative.glsl'; // Importa tus shaders creativos
import fragmentCreativeShader from './shaders/fragment_creative.glsl';

class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Mesh;
  private startTime: number;
  private clickTime: number;
  private clickPosition: THREE.Vector3;
  private elasticity: number;
  private params: { geometry: string, material: string };
  private materialVertex: THREE.RawShaderMaterial;
  private gelatinMaterial: THREE.RawShaderMaterial;
  private creativeMaterial: THREE.RawShaderMaterial;
  private materials: { [key: string]: THREE.RawShaderMaterial };
  private currentMaterial: THREE.RawShaderMaterial;
  private gui: dat.GUI;

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

    // Material 1
    this.materialVertex = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
          u_time: { value: 0.0 },
          u_smoothness: { value: 5.0 }, // Valor inicial de suavidad
          u_modelMatrix: { value: new THREE.Matrix4() },
          u_viewMatrix: { value: new THREE.Matrix4() },
          u_projectionMatrix: { value: new THREE.Matrix4() },
      },
      glslVersion: THREE.GLSL3,
  });

    // Material 2: Binned Shader (Gelatin Cube)
    this.elasticity = 0.0;
    this.gelatinMaterial = new THREE.RawShaderMaterial({
      vertexShader: vertexGelatinShader,
      fragmentShader: fragmentGelatinShader,

      transparent: true,
      uniforms: {
        projectionMatrix: { value: this.camera.projectionMatrix },
        viewMatrix: { value: this.camera.matrixWorldInverse },
        modelMatrix: { value: new THREE.Matrix4() },
        cameraPosition: { value: this.camera.position },
        u_time: { value: 0.0 },
        u_resolution: { value: resolution },
        u_clickTime: { value: -1.0 }, // Tiempo del click
        u_elasticity: { value: this.elasticity }, // Elasticidad	
        u_clickPosition: { value: new THREE.Vector3(-1.0, -1.0, -1.0) }, // Posición del click
        u_shininess: { value: 32.0 }, // Brillo del material
        u_transparency: { value: 0.6 }, // Transparencia del material
        u_lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        u_lightColor: { value: new THREE.Color(0xffffff) }, // Color de la luz
        u_objectColor: { value: new THREE.Color(0x00ff00) }, // Color del objeto
      },
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
    });

    // Material 3: Shader creativo (inflado + toon shading)
    this.creativeMaterial = new THREE.RawShaderMaterial({
      vertexShader: vertexCreativeShader,
      fragmentShader: fragmentCreativeShader,
      transparent: true,
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: resolution },
        u_inflateAmount: { value: 0.2 },
        u_lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        u_lightColor: { value: new THREE.Color(0x000000) },
        u_objectColor: { value: new THREE.Color(0xffffff) },
        cameraPosition: { value: this.camera.position },
      },
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
    });
    
    // Lista de materiales para cambiar dinámicamente
    this.materials = {
      materialVertex: this.materialVertex,
      gelatin: this.gelatinMaterial,
      creative: this.creativeMaterial,
    };
    this.currentMaterial = this.materials['gelatin'];

    // Create mesh
    const geometry = new THREE.BoxGeometry(6, 6, 6);
    this.mesh = new THREE.Mesh(geometry, this.currentMaterial);
    this.mesh.rotation.y = Math.PI / 5;
    this.mesh.rotation.x = Math.PI / 6;
    this.scene.add(this.mesh);
    this.camera.position.z = 9;

    // Controles GUI
    this.gui = new dat.GUI();
    this.params = { geometry: 'cube', material: 'gelatin' };
    this.gui.add(this.params, 'geometry', ['cube', 'sphere', 'torus'])
        .onChange(() => this.updateGeometry());
    this.gui.add(this.params, 'material', ['materialVertex' ,'gelatin', 'creative'])
        .onChange(() => this.switchMaterial())
    

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

    this.initializeMaterials(); 

    // Start the main loop
    this.animate();

  }
  	
  private initializeMaterials() {
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight); // Obtén la resolución AQUÍ.

    for (const materialName in this.materials) {
      const material = this.materials[materialName];
      
      if (material instanceof THREE.RawShaderMaterial) { // Asegúrate de que es un RawShaderMaterial.
        material.uniforms.projectionMatrix = { value: this.camera.projectionMatrix };
        material.uniforms.viewMatrix = { value: this.camera.matrixWorldInverse };
        material.uniforms.modelMatrix = { value: new THREE.Matrix4() };
        material.uniforms.cameraPosition = { value: this.camera.position };
        material.uniforms.u_time = { value: 0.0 };
        material.uniforms.u_resolution = { value: resolution };

        if (material === this.gelatinMaterial) {
          material.uniforms.u_clickTime = { value: -1.0 };
          material.uniforms.u_elasticity = { value: this.elasticity };
          material.uniforms.u_clickPosition = { value: new THREE.Vector3(-1.0, -1.0, -1.0) };
          material.uniforms.u_shininess = { value: 32.0 };
          material.uniforms.u_transparency = { value: 0.6 };
          material.uniforms.u_lightDirection = { value: new THREE.Vector3(1, 1, 1).normalize() };
          material.uniforms.u_lightColor = { value: new THREE.Color(0xffffff) };
          material.uniforms.u_objectColor = { value: new THREE.Color(0x00ff00) };
        
        } else if (material === this.creativeMaterial) {
          material.uniforms.u_inflateAmount = { value: 0.2 };
          material.uniforms.u_lightDirection = { value: new THREE.Vector3(1, 1, 1).normalize() };
          material.uniforms.u_lightColor = { value: new THREE.Color(0x000000) };
          material.uniforms.u_objectColor = { value: new THREE.Color(0xffffff) };
        
        } else if (material === this.materialVertex) {
          material.uniforms.u_smoothness = { value: 5.0 };
        }
      }
    }
  }

  private updateGeometry() {
    this.mesh.geometry.dispose();
    let newGeometry;

    switch (this.params.geometry) {
        case 'cube':
            newGeometry = new THREE.BoxGeometry(6, 6, 6);
            break;
        case 'sphere':
            newGeometry = new THREE.SphereGeometry(3, 32, 32);
            break;
        case 'torus':
            newGeometry = new THREE.TorusGeometry(3, 1, 32, 64);
            break;
        default:
            newGeometry = new THREE.BoxGeometry(6, 6, 6);
    }

    this.mesh.geometry = newGeometry;
    this.mesh.material = this.currentMaterial;
  }

  private switchMaterial() {
    this.currentMaterial = this.materials[this.params.material];
    this.mesh.material = this.currentMaterial;

    // Update GUI controls based on the selected material
    if (this.currentMaterial === this.materialVertex) {
      // Show vertex material controls
      // ... (code to show controls for vertex material)
      this.gui.add(this.materialVertex.uniforms.u_smoothness, 'value', 1, 20, 0.1)
        .name('Suavidad')
        .onChange(() => {
            this.materialVertex.uniforms.u_smoothness.value = parseFloat(this.materialVertex.uniforms.u_smoothness.value);
        });
      console.log('Material Vertex');
    } else if (this.currentMaterial === this.gelatinMaterial) {
        // Show gelatin material controls
        // ... (code to show controls for gelatin material)

        console.log('Material Gelatina');
    } else if (this.currentMaterial === this.creativeMaterial) {
        // Show creative material controls
        // ... (code to show controls for creative material)
        console.log('Material Creativo');
    }
  }
  
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    const elapsedTime = (Date.now() - this.startTime) / 1000;

    this.mesh.updateMatrixWorld();
    this.currentMaterial.uniforms.modelMatrix.value.copy(this.mesh.matrixWorld);

    this.currentMaterial.uniforms.u_time.value = elapsedTime;
    this.currentMaterial.uniforms.cameraPosition.value = this.camera.position;
    this.currentMaterial.uniforms.projectionMatrix.value = this.camera.projectionMatrix;
    this.currentMaterial.uniforms.viewMatrix.value = this.camera.matrixWorldInverse;

    // Animaciones y cambios de parámetros de los materiales
    if (this.currentMaterial === this.gelatinMaterial) {
        
      if (this.elasticity > 0.001) {
        this.elasticity -= 0.02 * this.elasticity;
        this.currentMaterial.uniforms.u_elasticity.value = this.elasticity;
      } else {
        this.elasticity = 0.0;
        this.currentMaterial.uniforms.u_elasticity.value = this.elasticity;
      }

      const shininess = 16.0 + Math.cos(elapsedTime * 2) * 8;
      const transparency = 0.5 + Math.sin(elapsedTime * 2) * 0.1;
      this.currentMaterial.uniforms.u_shininess.value = shininess;
      this.currentMaterial.uniforms.u_transparency.value = transparency;
  
    } else if (this.currentMaterial === this.creativeMaterial) {
      // Material creativo (inflado)
      const inflateAmount = 0.2 + Math.sin(elapsedTime * 2.0) * 0.1; // Ejemplo de animación
      this.currentMaterial.uniforms.u_inflateAmount.value = inflateAmount;
    
    } else if (this.currentMaterial === this.materialVertex) {
      this.materialVertex.uniforms.u_time.value += 0.01;

      this.materialVertex.uniforms.modelMatrix.value.copy(this.mesh.matrixWorld);
      this.materialVertex.uniforms.projectionMatrix.value.copy(this.camera.projectionMatrix);
      this.materialVertex.uniforms.viewMatrix.value.copy(this.camera.matrixWorldInverse);
      this.materialVertex.uniforms.cameraPosition.value = this.camera.position;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.currentMaterial.uniforms.u_resolution.value.set(width, height);
  }

  private onDocumentClick(event: MouseEvent): void {

    this.clickTime = (Date.now() - this.startTime) / 1000;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;

      if (intersectedObject instanceof THREE.Mesh && intersectedObject.material instanceof THREE.RawShaderMaterial) {
        const currentMaterial = intersectedObject.material as THREE.RawShaderMaterial;

        if (currentMaterial.uniforms.u_clickPosition) {
          currentMaterial.uniforms.u_clickPosition.value = intersects[0].point;
        }

        if (currentMaterial.uniforms.u_clickTime) {
          currentMaterial.uniforms.u_clickTime.value = this.clickTime;
        }

        if (currentMaterial.uniforms.u_elasticity) {
          this.elasticity = 1.0;
          currentMaterial.uniforms.u_elasticity.value = this.elasticity;
        } 
      }

    } else {

      if (this.mesh.material && this.mesh.material instanceof THREE.RawShaderMaterial) {
        const currentMaterial = this.mesh.material as THREE.RawShaderMaterial;
        if (currentMaterial.uniforms.u_clickTime) {
          currentMaterial.uniforms.u_clickTime.value = -1;
        }
      }
    }
  }
}

const myApp = new App();
