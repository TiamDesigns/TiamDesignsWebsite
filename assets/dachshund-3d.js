function init3dViewer() {
  const container = document.getElementById('3d-container');
  if (!container) return;

  if (typeof THREE === 'undefined' || typeof THREE.TrackballControls === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
    setTimeout(init3dViewer, 100);
    return;
  }

  // Setup Scene, Camera, Renderer
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    50000
  );

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.touchAction = 'pan-y';
  container.appendChild(renderer.domElement);

  // 1. Refined Studio Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight1.position.set(6, 10, 6);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0x8fa8c0, 0.3);
  directionalLight2.position.set(-6, -4, -6);
  scene.add(directionalLight2);

  // Trackball Controls
  const controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 4.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = true;
  controls.noPan = false;
  controls.staticMoving = false;
  controls.dynamicDampingFactor = 0.05;

  // Mobile Scroll Toggle (Interaction Lock) - Default is false (locked)
  let isInteracting = false;
  let isDragging = false;
  controls.enabled = false;
  container.style.pointerEvents = 'none';

  controls.addEventListener('start', () => {
    isDragging = true;
  });
  controls.addEventListener('end', () => {
    isDragging = false;
  });

  // Load GLTF/GLB Model with Draco Compression support
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  let activeModel = null;

  const setupModel = (gltf) => {
    const model = gltf.scene;


    // CAD exports are Z-up; the scene is Y-up
    model.rotation.x = -Math.PI / 2;
    model.updateMatrixWorld(true);

    // Keep the CAD colours, with a satin finish so the case reads as anodised aluminium
    model.traverse((child) => {
      if (child.isMesh && child.material && child.material.isMeshStandardMaterial) {
        child.material.metalness = 0.25;
        child.material.roughness = 0.5;
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);

    const pivot = new THREE.Group();
    pivot.add(model);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius;

    pivot.rotation.set(0, -Math.PI / 5, 0);

    scene.add(pivot);
    activeModel = pivot;

    camera.far = Math.max(camera.far, radius * 20);
    camera.near = Math.max(0.1, radius * 0.01);
    camera.updateProjectionMatrix();

    // Fix Camera Distance Jump: Set initial position immediately to preferred scale from frame 1
    const distance = radius * 1.6;
    camera.position.set(distance, distance * 0.75, distance);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);

    const loaderElement = document.getElementById('model-loader');
    if (loaderElement) {
      void loaderElement.offsetWidth;
      loaderElement.style.opacity = '0';
      loaderElement.style.pointerEvents = 'none';
      setTimeout(() => {
        if (loaderElement && loaderElement.parentNode) {
          loaderElement.parentNode.removeChild(loaderElement);
        }
      }, 600);
    }

    controls.maxDistance = radius * 3;
    controls.minDistance = radius * 0.3;
  };

  loader.load('assets/Dachshund60F/Dachshund60F-Draco.glb', (gltf) => {
    setupModel(gltf);
  }, undefined, (error) => {
    console.error('GLTF load failed:', error);
    const loaderElement = document.getElementById('model-loader');
    if (loaderElement && loaderElement.parentNode) {
      loaderElement.parentNode.removeChild(loaderElement);
    }
  });

  // Mobile Lock Button Toggle
  const toggleBtn = document.getElementById('toggle-3d-controls');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isInteracting = !isInteracting;
      const btnText = toggleBtn.querySelector('.btn-text');

      if (isInteracting) {
        container.style.pointerEvents = 'auto';
        container.classList.add('interactive');
        controls.enabled = true;
        toggleBtn.classList.add('active');
        if (btnText) btnText.textContent = 'Lock Model (Enable Page Scroll)';
      } else {
        container.style.pointerEvents = 'none';
        container.classList.remove('interactive');
        controls.enabled = false;
        toggleBtn.classList.remove('active');
        if (btnText) btnText.textContent = 'Tap to Interact with 3D Model';
      }
    });
  }

  const onResize = () => {
    if (!container) return;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (controls && controls.handleResize) {
      controls.handleResize();
    }
  };

  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);
  setTimeout(onResize, 500);

  // Animation Loop (Slow Auto-Rotation pauses during active drag)
  const animate = () => {
    requestAnimationFrame(animate);

    if (activeModel && !isDragging) {
      activeModel.rotation.y += 0.004; // Slow auto-rotation
    }

    if (controls && controls.enabled) {
      controls.update();
    }
    renderer.render(scene, camera);
  };

  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init3dViewer);
} else {
  init3dViewer();
}
