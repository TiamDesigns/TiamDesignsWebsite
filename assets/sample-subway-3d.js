document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('3d-container');
  if (!container) return;

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
  container.appendChild(renderer.domElement);

  // Lighting to match the dark aesthetic
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Softer, brighter ambient
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.4); // Less harsh main light
  directionalLight1.position.set(100, 200, 100);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0x90b0d0, 0.3); // Slight cool backlight
  directionalLight2.position.set(-100, -50, -100);
  scene.add(directionalLight2);

  const directionalLight3 = new THREE.DirectionalLight(0xc1ab85, 0.3); // Warm fill light matching --accent-alt
  directionalLight3.position.set(100, 0, -100);
  scene.add(directionalLight3);

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

  // Tiam Designs brand stylization (high saturation)
  const palette = [
    0x101214, // Void
    0xF75142, // Ember
    0xF6F4EF, // Sand
    0xC1AB85, // Brass
    0xFF1E0A, // Highly Saturated Ember
    0xDABB8A, // Bright Shiny Brass
    0x252930, // Charcoal/Light Void
    0xEAE0D0, // Saturated Sand
    0x14161A, // Deep Void
    0xE83F30, // Crimson Ember
  ];

  let colorIndex = 0;
  const nameToColor = new Map();
  let activeModel = null; // Store reference to apply rotation

  loader.load('assets/SampleSubway/SampleSubway.glb', (gltf) => {
    const model = gltf.scene;

    // Apply materials based on component name
    model.traverse((child) => {
      if (child.isMesh) {
        // Meshes often get named generic "mesh0_mesh", and actual labels belong to the parent.
        // Also CAD exports often have underscores instead of spaces. 
        const parentName = child.parent ? child.parent.name : "";
        const combinedName = (child.name + " " + parentName).replace(/_/g, ' ');

        // Default to the main body color (white/very light grey)
        let matColor = 0xf0f0f0;
        let matMetalness = 0.2; // Slightly more metallic
        let matRoughness = 0.5; // Smoother surface for more gloss
        let matTransparent = false;
        let matOpacity = 1.0;

        // Custom material overrides matching combinedName
        if (combinedName.includes('608 Bearing') || combinedName.includes('Nickel Strip') || combinedName.includes('Hex socket') || combinedName.includes('Screw') || combinedName.includes('Nut')) {
          matColor = 0xb0b5ba; // Bright shiny silver color
          matMetalness = 0.5; // Lowered from 1.0 to prevent rendering solid black without an environment map
          matRoughness = 0.2; // Keep it smooth so it has specular highlights
        } else if (combinedName.includes('Part 1')) { // Reverting to .includes to ensure the whole orange collar (Part 10, Part 11 etc) matches
          matColor = 0xdd7222; // Vibrant Orange (matching the reference image)
          matMetalness = 0.2;
          matRoughness = 0.4; // Slightly tighter gloss
        } else if (combinedName.includes('Panel Cover')) {
          matColor = 0x88929b; // Keep a soft color but 70% transparent (30% opaque)
          matTransparent = true;
          matOpacity = 0.3; // 70% transparency = 0.3 opacity
          matMetalness = 0.4;
          matRoughness = 0.1; // Glassy feel
        } else if (combinedName.includes('Battery') || combinedName.includes('Cell')) {
          matColor = 0x4466cc; // Blue for the batteries assuming they are standard 18650s like the photo
          matMetalness = 0.3;
          matRoughness = 0.6;
        }

        // We completely ignore the random palette now, everything is light grey unless specified above.

        child.material = new THREE.MeshStandardMaterial({
          color: matColor,
          metalness: matMetalness,
          roughness: matRoughness,
          transparent: matTransparent,
          opacity: matOpacity
        });
      }
    });

    // Center the geometry using a Pivot group
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    // Offset the model so its visual center is exactly at 0, 0, 0
    model.position.set(-center.x, -center.y, -center.z);

    // Create a pivot object at the origin to hold the model
    const pivot = new THREE.Group();
    pivot.add(model);

    // Calculate bounding sphere to adjust camera
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius;

    // Start the model from a 3/4 perspective pointing down to the left
    // Pitching the front down (X) and yawing it to the left (Y)
    pivot.rotation.set(-Math.PI / 6, -Math.PI / 4, 0);

    scene.add(pivot);
    activeModel = pivot; // Store for animation loop

    // Dynamic adjustment of camera near/far to thoroughly prevent clipping issues
    camera.far = Math.max(camera.far, radius * 20);
    camera.near = Math.max(0.1, radius * 0.01);
    camera.updateProjectionMatrix();

    // Adjust camera distance based on object size to prevent vertical cropping
    const distance = radius * 2.5; // Increased scale to fit the whole model in view
    camera.position.set(distance, distance * 0.8, distance);
    camera.lookAt(0, 0, 0);

    // Adjust controls settings
    controls.maxDistance = radius * 3;
    controls.minDistance = radius * 0.3;
  }, undefined, (error) => {
    console.error('An error occurred loading the GLTF:', error);
  });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    controls.handleResize();
  });

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Slow cinematic pan/rotation
    if (activeModel) {
      activeModel.rotation.y += 0.005; // Increased speed
    }

    controls.update();
    renderer.render(scene, camera);
  };

  animate();
});
