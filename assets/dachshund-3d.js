function init3dViewer() {
  const container = document.getElementById('3d-container');
  if (!container) return;

  if (typeof THREE === 'undefined' || typeof THREE.OrbitControls === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
    setTimeout(init3dViewer, 100);
    return;
  }

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    40,
    (container.clientWidth || 400) / (container.clientHeight || 400),
    0.001,
    100
  );

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.touchAction = 'pan-y';
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
  keyLight.position.set(6, 10, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8fa8c0, 0.3);
  fillLight.position.set(-6, -4, -6);
  scene.add(fillLight);

  // Orbit controls keep the keyboard upright: it turns around its own centre and
  // the camera can't roll, so manual rotation stays predictable
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.rotateSpeed = 0.7;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI / 2;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 1.2;
  controls.enabled = false;

  // Interaction lock so the page still scrolls on touch screens until the visitor opts in
  let isInteracting = false;
  container.style.pointerEvents = 'none';

  controls.addEventListener('start', () => {
    controls.autoRotate = false;
  });

  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  const removeLoader = () => {
    const loaderElement = document.getElementById('model-loader');
    if (!loaderElement) return;
    loaderElement.style.opacity = '0';
    loaderElement.style.pointerEvents = 'none';
    setTimeout(() => {
      if (loaderElement.parentNode) {
        loaderElement.parentNode.removeChild(loaderElement);
      }
    }, 600);
  };

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
    model.position.sub(center);
    scene.add(model);

    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    const distance = radius * 3.2;
    camera.position.set(distance * 0.55, distance * 0.6, distance * 0.6);
    camera.near = radius * 0.01;
    camera.far = radius * 20;
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.update();

    removeLoader();
  };

  loader.load('assets/Dachshund60F/Dachshund60F-Draco.glb', setupModel, undefined, (error) => {
    console.error('GLTF load failed:', error);
    removeLoader();
  });

  const toggleBtn = document.getElementById('toggle-3d-controls');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isInteracting = !isInteracting;
      const btnText = toggleBtn.querySelector('.btn-text');

      container.style.pointerEvents = isInteracting ? 'auto' : 'none';
      container.classList.toggle('interactive', isInteracting);
      toggleBtn.classList.toggle('active', isInteracting);
      controls.enabled = isInteracting;
      if (btnText) {
        btnText.textContent = isInteracting ? 'Lock Model (Enable Page Scroll)' : 'Tap to Interact with 3D Model';
      }
    });
  }

  const onResize = () => {
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);
  setTimeout(onResize, 500);

  const animate = () => {
    requestAnimationFrame(animate);
    // Always update so damping and auto-rotation run even while the model is locked
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
