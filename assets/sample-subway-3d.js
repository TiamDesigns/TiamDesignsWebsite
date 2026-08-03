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
    50000 // Increased far plane substantially for large mm-scaled models
  );
  // Initial camera position, will be adjusted when model loads
  camera.position.set(200, 200, 200);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  // Render over the existing background
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.touchAction = 'pan-y';
  container.appendChild(renderer.domElement);

  // Crisp, neutral studio lighting setup for industrial CAD rendering
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xdce6f2, 0x1a1c20, 0.65);
  hemiLight.position.set(0, 500, 0);
  scene.add(hemiLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.95);
  directionalLight1.position.set(1000, 1500, 1000);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0x8fa8c0, 0.45);
  directionalLight2.position.set(-1000, -500, -800);
  scene.add(directionalLight2);

  // Trackball Controls for unconstrained tumble rotation around all axes
  const controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 4.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = true; // Disable scroll wheel zoom to prevent page scrolling interference
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  // Load GLTF/GLB Model with Draco Compression support
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Google's robust CDN for Draco

  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  let activeModel = null; // Store reference to apply rotation

  const setupModel = (gltf) => {
    const model = gltf.scene;

    // Apply materials based on component name
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
          matColor = 0xd85e28; // Industrial anodized orange accent
          matMetalness = 0.15;
          matRoughness = 0.4;
        } else if (combinedName.includes('Panel Cover') || combinedName.includes('Lid')) {
          matColor = 0x9099a3;
          matTransparent = true;
          matOpacity = 0.45;
          matMetalness = 0.3;
          matRoughness = 0.15;
        } else if (combinedName.includes('Molicel') || combinedName.includes('Cell')) {
          matColor = 0x9e9891;
          matMetalness = 0.3;
          matRoughness = 0.55;
        } else if (combinedName.includes('ContainerInterior') || combinedName.includes('ContainerBody') || combinedName.includes('Frame') || combinedName.includes('load_cell')) {
          matColor = 0xdcdfe3;
          matMetalness = 0.2;
          matRoughness = 0.5;
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

    const distance = radius * 2.5;
    camera.position.set(distance, distance * 0.8, distance);
    camera.lookAt(0, 0, 0);

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

  // Handle Window Resize & Mobile Touch Control State
  const toggleBtn = document.getElementById('toggle-3d-controls');

  const updateMobileTouchState = () => {
    if (!container) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      if (!container.classList.contains('interactive')) {
        container.style.pointerEvents = 'none';
      }
    } else {
      container.style.pointerEvents = 'auto';
    }
  };

  if (toggleBtn && container) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isNowInteractive = container.classList.toggle('interactive');
      if (isNowInteractive) {
        container.style.pointerEvents = 'auto';
        toggleBtn.classList.add('active');
        const btnText = toggleBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Exit 3D View (Scroll Mode)';
      } else {
        container.style.pointerEvents = 'none';
        toggleBtn.classList.remove('active');
        const btnText = toggleBtn.querySelector('.btn-text');
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
    updateMobileTouchState();
  };

  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);
  setTimeout(onResize, 500);

  updateMobileTouchState();

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Slow cinematic pan/rotation
    if (activeModel) {
      activeModel.rotation.y += 0.005;
    }

    controls.update();
    renderer.render(scene, camera);
  };

  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init3dViewer);
} else {
  init3dViewer();
}
