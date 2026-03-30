import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface SceneProps {
  timeSpeed: number;
  planetScale: number;
  showOrbits: boolean;
  focusedPlanet: string;
}

const planetsData = [
  { name: 'Soleil', radius: 5, distance: 0, color: 0xffcc00, orbitSpeed: 0, rotationSpeed: 0.005, moons: [] },
  { name: 'Mercure', radius: 0.4, distance: 10, color: 0xa8a8a8, orbitSpeed: 4.15, rotationSpeed: 0.01, moons: [] },
  { name: 'Vénus', radius: 0.9, distance: 14, color: 0xe3bb76, orbitSpeed: 1.62, rotationSpeed: -0.002, moons: [] },
  { name: 'Terre', radius: 1, distance: 19, color: 0x4b9fe3, orbitSpeed: 1, rotationSpeed: 0.02, moons: [{ name: 'Lune', radius: 0.25, distance: 1.8, color: 0xcccccc, speed: 0.05 }] },
  { name: 'Mars', radius: 0.5, distance: 24, color: 0xe27b58, orbitSpeed: 0.53, rotationSpeed: 0.02, moons: [{ name: 'Phobos', radius: 0.1, distance: 0.8, color: 0x888888, speed: 0.08 }, { name: 'Deimos', radius: 0.08, distance: 1.2, color: 0xaaaaaa, speed: 0.06 }] },
  { name: 'Jupiter', radius: 3.5, distance: 36, color: 0xc88b3a, orbitSpeed: 0.08, rotationSpeed: 0.05, moons: [{ name: 'Io', radius: 0.25, distance: 4.5, color: 0xffff00, speed: 0.04 }, { name: 'Europe', radius: 0.2, distance: 5.5, color: 0xeeeeff, speed: 0.03 }, { name: 'Ganymède', radius: 0.35, distance: 7, color: 0xbbbbbb, speed: 0.02 }, { name: 'Callisto', radius: 0.3, distance: 8.5, color: 0x888888, speed: 0.01 }] },
  { name: 'Saturne', radius: 3, distance: 50, color: 0xe3e0c0, orbitSpeed: 0.03, rotationSpeed: 0.045, hasRings: true, moons: [{ name: 'Titan', radius: 0.35, distance: 5.5, color: 0xffaa00, speed: 0.03 }] },
  { name: 'Uranus', radius: 2, distance: 64, color: 0x4b70dd, orbitSpeed: 0.01, rotationSpeed: -0.03, moons: [{ name: 'Titania', radius: 0.15, distance: 3.5, color: 0xdddddd, speed: 0.04 }] },
  { name: 'Neptune', radius: 1.9, distance: 76, color: 0x274687, orbitSpeed: 0.006, rotationSpeed: 0.03, moons: [{ name: 'Triton', radius: 0.18, distance: 3.5, color: 0xaaaaff, speed: -0.04 }] },
  { name: 'Pluton', radius: 0.18, distance: 88, color: 0xdddddd, orbitSpeed: 0.004, rotationSpeed: 0.01, moons: [{ name: 'Charon', radius: 0.09, distance: 0.5, color: 0xaaaaaa, speed: 0.1 }] },
  { name: 'Nibiru', radius: 2.5, distance: 110, color: 0x8b0000, orbitSpeed: 0.002, rotationSpeed: 0.02, moons: [] }
];

const Scene: React.FC<SceneProps> = ({ timeSpeed, planetScale, showOrbits, focusedPlanet }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ timeSpeed, planetScale, showOrbits, focusedPlanet });

  useEffect(() => {
    propsRef.current = { timeSpeed, planetScale, showOrbits, focusedPlanet };
  }, [timeSpeed, planetScale, showOrbits, focusedPlanet]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 40, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 600;
    controls.minDistance = 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x444444); // Softer ambient
    scene.add(ambientLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.4); // Added hemisphere light
    scene.add(hemisphereLight);
    const pointLight = new THREE.PointLight(0xffffff, 3, 500);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    pointLight.shadow.bias = -0.001;
    scene.add(pointLight);

    // Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 3000;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 1000;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.6, color: 0xffffff, transparent: true, opacity: 0.8 });
    const starMesh = new THREE.Points(starsGeo, starsMat);
    scene.add(starMesh);

    // Planets
    const planetMeshes: { [key: string]: THREE.Mesh | THREE.Group } = {};
    const orbitLines: THREE.Line[] = [];
    const planetAngles: { [key: string]: number } = {};

    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);

    planetsData.forEach(data => {
      planetAngles[data.name] = Math.random() * Math.PI * 2;

      let mesh;
      if (data.name === 'Soleil') {
        const sunMat = new THREE.MeshBasicMaterial({ color: data.color });
        mesh = new THREE.Mesh(sphereGeo, sunMat);
        
        // Sun glow
        const glowGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const glowMat = new THREE.ShaderMaterial({
          uniforms: {
            c: { value: 0.2 },
            p: { value: 2.0 },
            glowColor: { value: new THREE.Color(0xffbb00) },
            viewVector: { value: camera.position }
          },
          vertexShader: `
            uniform vec3 viewVector;
            varying float intensity;
            void main() {
              vec3 vNormal = normalize(normalMatrix * normal);
              vec3 vNormel = normalize(normalMatrix * viewVector);
              intensity = pow(0.65 - dot(vNormal, vNormel), 2.0);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
              vec3 glow = glowColor * intensity;
              gl_FragColor = vec4(glow, 1.0);
            }
          `,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        mesh.add(glowMesh);
        mesh.userData.glowMat = glowMat;
      } else {
        const mat = new THREE.MeshStandardMaterial({ 
          color: data.color,
          roughness: 0.6,
          metalness: 0.2
        });
        mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (data.hasRings) {
          const ringGeo = new THREE.RingGeometry(1.4, 2.2, 64);
          const ringMat = new THREE.MeshStandardMaterial({ 
            color: 0xc9b793, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = Math.PI / 2 + 0.3;
          ring.castShadow = true;
          ring.receiveShadow = true;
          mesh.add(ring);
        }

        if (data.moons && data.moons.length > 0) {
          mesh.userData.moons = [];
          data.moons.forEach(moonData => {
            const moonPivot = new THREE.Group();
            mesh.add(moonPivot);
            const moonGeo = new THREE.SphereGeometry(moonData.radius, 16, 16);
            const moonMat = new THREE.MeshStandardMaterial({ color: moonData.color, roughness: 0.8 });
            const moonMesh = new THREE.Mesh(moonGeo, moonMat);
            moonMesh.position.x = moonData.distance;
            moonMesh.castShadow = true;
            moonMesh.receiveShadow = true;
            moonPivot.add(moonMesh);
            mesh.userData.moons.push({ pivot: moonPivot, speed: moonData.speed });
          });
        }
      }

      mesh.scale.setScalar(data.radius);
      scene.add(mesh);
      planetMeshes[data.name] = mesh;

      // Orbit line
      if (data.distance > 0) {
        const orbitGeo = new THREE.BufferGeometry();
        const orbitPts = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          orbitPts.push(new THREE.Vector3(Math.cos(theta) * data.distance, 0, Math.sin(theta) * data.distance));
        }
        orbitGeo.setFromPoints(orbitPts);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        scene.add(orbitLine);
        orbitLines.push(orbitLine);
      }
    });

    // Asteroid Belt
    const beltGeometry = new THREE.BufferGeometry();
    const beltCount = 3000;
    const beltPositions = new Float32Array(beltCount * 3);
    for(let i=0; i<beltCount; i++) {
       const angle = Math.random() * Math.PI * 2;
       const r = 26 + Math.random() * 8; // between Mars(24) and Jupiter(36)
       beltPositions[i*3] = Math.cos(angle) * r;
       beltPositions[i*3+1] = (Math.random() - 0.5) * 2; // slight vertical spread
       beltPositions[i*3+2] = Math.sin(angle) * r;
    }
    beltGeometry.setAttribute('position', new THREE.BufferAttribute(beltPositions, 3));
    const beltMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 0.1 });
    const asteroidBelt = new THREE.Points(beltGeometry, beltMaterial);
    scene.add(asteroidBelt);

    // Oort Cloud
    const oortGeometry = new THREE.BufferGeometry();
    const oortCount = 8000;
    const oortPositions = new Float32Array(oortCount * 3);
    for(let i=0; i<oortCount; i++) {
       const u = Math.random();
       const v = Math.random();
       const theta = u * 2.0 * Math.PI;
       const phi = Math.acos(2.0 * v - 1.0);
       const r = 150 + Math.random() * 100; // Far away
       const sinPhi = Math.sin(phi);
       oortPositions[i*3] = r * sinPhi * Math.cos(theta);
       oortPositions[i*3+1] = r * Math.sin(phi);
       oortPositions[i*3+2] = r * sinPhi * Math.sin(theta);
    }
    oortGeometry.setAttribute('position', new THREE.BufferAttribute(oortPositions, 3));
    const oortMaterial = new THREE.PointsMaterial({ color: 0x555577, size: 0.2, transparent: true, opacity: 0.6 });
    const oortCloud = new THREE.Points(oortGeometry, oortMaterial);
    scene.add(oortCloud);

    // Post Processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    const outputPass = new OutputPass();
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    const clock = new THREE.Clock();
    let currentFocus = 'Soleil';
    const targetControlsTarget = new THREE.Vector3();
    let isTransitioning = false;
    let targetDistance = 100;

    const animate = () => {
      const delta = clock.getDelta();
      const props = propsRef.current;

      // Update Orbits Visibility
      orbitLines.forEach(line => {
        line.visible = props.showOrbits;
      });

      // Update Planets
      planetsData.forEach(data => {
        const mesh = planetMeshes[data.name];
        if (!mesh) return;

        // Scale
        const scaleMultiplier = data.name === 'Soleil' ? 1 : props.planetScale;
        mesh.scale.setScalar(data.radius * scaleMultiplier);

        // Rotation
        mesh.rotation.y += data.rotationSpeed * props.timeSpeed * delta * 60;

        // Orbit
        if (data.distance > 0) {
          planetAngles[data.name] += data.orbitSpeed * 0.005 * props.timeSpeed * delta * 60;
          const angle = planetAngles[data.name];
          mesh.position.x = Math.cos(angle) * data.distance;
          mesh.position.z = Math.sin(angle) * data.distance;
        }

        if (data.name === 'Soleil' && mesh.userData.glowMat) {
          mesh.userData.glowMat.uniforms.viewVector.value = new THREE.Vector3().subVectors(camera.position, mesh.position);
        }

        if (mesh.userData.moons) {
          mesh.userData.moons.forEach((moonObj: any) => {
            moonObj.pivot.rotation.y += moonObj.speed * props.timeSpeed * delta * 60;
          });
        }
      });

      // Asteroid Belt Rotation
      asteroidBelt.rotation.y += 0.001 * props.timeSpeed * delta * 60;
      
      // Oort Cloud Rotation
      oortCloud.rotation.y -= 0.0005 * props.timeSpeed * delta * 60;

      // Camera Focus Logic
      if (currentFocus !== props.focusedPlanet) {
        currentFocus = props.focusedPlanet;
        isTransitioning = true;
        const planetInfo = planetsData.find(p => p.name === currentFocus);
        const radius = planetInfo ? planetInfo.radius * props.planetScale : 5;
        // Calculate a good viewing distance: close enough to see it rotate, far enough to see context
        targetDistance = Math.max(radius * 12, 15);
        if (currentFocus === 'Soleil') targetDistance = 60; // Special case for the sun
      }

      const focusMesh = planetMeshes[currentFocus];
      if (focusMesh) {
        const focusPos = new THREE.Vector3();
        focusMesh.getWorldPosition(focusPos);
        
        targetControlsTarget.copy(focusPos);
        
        const previousTarget = controls.target.clone();
        
        // Smoothly interpolate controls target
        controls.target.lerp(targetControlsTarget, 0.1);
        
        // Make camera follow the target's movement to stay relative to the planet
        const targetDelta = new THREE.Vector3().subVectors(controls.target, previousTarget);
        camera.position.add(targetDelta);

        // Zoom in/out logic
        if (isTransitioning) {
          const currentDist = camera.position.distanceTo(controls.target);
          const distDiff = targetDistance - currentDist;
          
          if (Math.abs(distDiff) > 0.5) {
            const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
            const step = distDiff * 0.05;
            camera.position.add(dir.multiplyScalar(step));
          } else {
            isTransitioning = false;
          }
        }
      }

      controls.update();
      composer.render();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      if (w < h) {
        camera.fov = 75; // wider FOV on mobile
      } else {
        camera.fov = 60;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    
    handleResize(); // call once on mount
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      composer.dispose();
      if(containerRef.current) containerRef.current.removeChild(renderer.domElement);
      starsGeo.dispose();
      starsMat.dispose();
      sphereGeo.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Scene;
