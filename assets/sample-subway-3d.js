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

    // Material Sheen Adjustments
    model.traverse((child) => {
      if (child.isMesh) {
        const parentName = child.parent ? child.parent.name : "";
        const combinedName = (child.name + " " + parentName).replace(/_/g, ' ');

        let matColor = 0xe6e8eb;
        let matMetalness = 0.25;
        let matRoughness = 0.45;
        let matTransparent = false;
        let matOpacity = 1.0;

        if (combinedName.includes('608 Bearing') || combinedName.includes('Nickel Strip') || combinedName.includes('Hex socket') || combinedName.includes('SHAFT') || combinedName.includes('CONNECTION')) {
          matColor = 0xb8bece;
          matMetalness = 0.6;
          matRoughness = 0.25;
        } else if (combinedName.includes('Part 16') || combinedName.includes('Part 14') || combinedName.includes('Part 18') || combinedName.includes('Part 21') || combinedName.includes('COVER')) {
          matColor = 0xd85e28;
          matMetalness = 0.15;
          matRoughness = 0.45;
        } else if (combinedName.includes('Panel Cover') || combinedName.includes('Lid')) {
          matColor = 0x9099a3;
          matTransparent = true;
          matOpacity = 0.45;
          matMetalness = 0.3;
          matRoughness = 0.15;
        } else if (combinedName.includes('Molicel') || combinedName.includes('Cell')) {
          matColor = 0x9e9891;
          matMetalness = 0.3;
          matRoughness = 0.45;
        } else if (combinedName.includes('ContainerInterior') || combinedName.includes('ContainerBody') || combinedName.includes('Frame') || combinedName.includes('load_cell')) {
          matColor = 0xdcdfe3;
          matMetalness = 0.2;
          matRoughness = 0.45;
        }

        child.material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: matMetalness,
          roughness: matRoughness,
          transparent: matTransparent,
          opacity: matOpacity
        });
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);

    const pivot = new THREE.Group();
    pivot.add(model);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius;

    pivot.rotation.set(-Math.PI / 6, -Math.PI / 4, 0);

    scene.add(pivot);
    activeModel = pivot;

    camera.far = Math.max(camera.far, radius * 20);
    camera.near = Math.max(0.1, radius * 0.01);
    camera.updateProjectionMatrix();

    // Fix Camera Distance Jump: Set initial position immediately to preferred scale from frame 1
    const distance = radius * 1.65;
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

  const loadFallbackModel = () => {
    const plainLoader = new THREE.GLTFLoader();
    plainLoader.load('assets/SampleSubway/SampleSubway.glb', (gltf) => {
      setupModel(gltf);
    }, undefined, (error) => {
      console.error('Fallback GLTF load failed:', error);
      const loaderElement = document.getElementById('model-loader');
      if (loaderElement && loaderElement.parentNode) {
        loaderElement.parentNode.removeChild(loaderElement);
      }
    });
  };

  loader.load('assets/SampleSubway/SampleSubwayExtremeCompress.glb', (gltf) => {
    setupModel(gltf);
  }, undefined, (error) => {
    console.warn('Draco GLTF load failed, trying uncompressed fallback:', error);
    loadFallbackModel();
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
