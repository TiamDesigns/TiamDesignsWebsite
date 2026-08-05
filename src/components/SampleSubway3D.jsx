import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function SampleSubway3D({
  modelUrl = 'assets/SampleSubway/SampleSubwayExtremeCompress.glb',
  fallbackUrl = 'assets/SampleSubway/SampleSubway.glb',
  className = '',
}) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const isDraggingRef = useRef(false);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const pivotRef = useRef(null);

  // Toggle mobile interaction lock state
  const toggleInteraction = () => {
    setIsInteracting((prev) => !prev);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera & WebGL Renderer Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      50000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
    keyLight.position.set(6, 10, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8fa8c0, 0.3);
    fillLight.position.set(-6, -4, -6);
    scene.add(fillLight);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.rotateSpeed = 0.8;
    controls.enabled = isInteracting;
    controlsRef.current = controls;

    // Drag / Interaction events to pause auto-rotation during user drag
    const handleDragStart = () => {
      isDraggingRef.current = true;
    };
    const handleDragEnd = () => {
      isDraggingRef.current = false;
    };

    controls.addEventListener('start', handleDragStart);
    controls.addEventListener('end', handleDragEnd);

    // 4. Load GLTF/GLB Model with Draco Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const setupModel = (gltf) => {
      const model = gltf.scene;

      // Material sheen adjustments
      model.traverse((child) => {
        if (child.isMesh) {
          const parentName = child.parent ? child.parent.name : '';
          const combinedName = (child.name + ' ' + parentName).replace(/_/g, ' ');

          let matColor = 0xe6e8eb;
          let matMetalness = 0.25;
          let matRoughness = 0.45;
          let matTransparent = false;
          let matOpacity = 1.0;

          if (
            combinedName.includes('608 Bearing') ||
            combinedName.includes('Nickel Strip') ||
            combinedName.includes('Hex socket') ||
            combinedName.includes('SHAFT') ||
            combinedName.includes('CONNECTION')
          ) {
            matColor = 0xb8bece;
            matMetalness = 0.6;
            matRoughness = 0.25;
          } else if (
            combinedName.includes('Part 16') ||
            combinedName.includes('Part 14') ||
            combinedName.includes('Part 18') ||
            combinedName.includes('Part 21') ||
            combinedName.includes('COVER')
          ) {
            matColor = 0xd85e28; // Industrial orange accent
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
          } else if (
            combinedName.includes('ContainerInterior') ||
            combinedName.includes('ContainerBody') ||
            combinedName.includes('Frame') ||
            combinedName.includes('load_cell')
          ) {
            matColor = 0xdcdfe3;
            matMetalness = 0.2;
            matRoughness = 0.45;
          }

          child.material = new THREE.MeshStandardMaterial({
            color: matColor,
            metalness: matMetalness,
            roughness: matRoughness,
            transparent: matTransparent,
            opacity: matOpacity,
          });
        }
      });

      // Center model bounding box around origin
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -center.y, -center.z);

      const pivot = new THREE.Group();
      pivot.add(model);
      pivotRef.current = pivot;

      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const radius = sphere.radius;
      pivot.rotation.set(-Math.PI / 6, -Math.PI / 4, 0);

      scene.add(pivot);

      // Fix Camera Distance Jump: Immediately position camera at zoomed-in target distance from frame 1
      const dist = radius * 1.65;
      camera.position.set(dist, dist * 0.75, dist);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();

      setLoading(false);
    };

    loader.load(
      modelUrl,
      (gltf) => setupModel(gltf),
      undefined,
      () => {
        const plainLoader = new GLTFLoader();
        plainLoader.load(fallbackUrl, (gltf) => setupModel(gltf));
      }
    );

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Pause auto-rotation when user is actively dragging, resume auto-rotation when idle
      if (controlsRef.current) {
        controlsRef.current.autoRotate = !isDraggingRef.current;
        controlsRef.current.update();
      } else if (pivotRef.current && !isDraggingRef.current) {
        pivotRef.current.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', handleDragStart);
      controls.removeEventListener('end', handleDragEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, fallbackUrl]);

  // Toggle OrbitControls enabled property smoothly without camera position jumps
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = isInteracting;
    }
  }, [isInteracting]);

  return (
    <div
      className={`relative w-full h-[480px] md:h-[560px] rounded-3xl overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-zinc-950 border border-zinc-800/60 shadow-2xl ${className}`}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full h-full ${
          isInteracting ? 'pointer-events-auto touch-none' : 'pointer-events-none touch-auto'
        }`}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md z-30 text-zinc-300">
          <svg
            className="w-10 h-10 mb-3 animate-spin text-amber-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-xs font-mono tracking-widest uppercase text-zinc-400">
            Assembling System...
          </span>
        </div>
      )}

      {/* Bottom Overlay: Mobile Scroll / Model Interaction Lock Toggle */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={toggleInteraction}
          type="button"
          aria-label={isInteracting ? 'Lock Model (Enable Page Scroll)' : 'Tap to Interact with 3D Model'}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full shadow-xl backdrop-blur-md border transition-all cursor-pointer ${
            isInteracting
              ? 'bg-amber-500/90 text-zinc-950 border-amber-400 hover:bg-amber-400 shadow-amber-500/20'
              : 'bg-zinc-900/85 text-zinc-200 border-amber-500/40 hover:border-amber-400 hover:text-white'
          }`}
        >
          {isInteracting ? (
            <>
              <svg
                className="w-4 h-4 text-zinc-950"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Lock Model (Enable Page Scroll)</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-amber-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <span>Tap to Interact with 3D Model</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
