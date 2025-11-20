// Loads a rotating low-poly drone (2 MB GLB)
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 100);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

// Neon point-light
const light = new THREE.PointLight(0x00f0ff, 2.5, 50);
light.position.set(0, 2, 5);
scene.add(light);

// Load GLB
const loader = new GLTFLoader();
loader.load('/static/models/drone.glb', gltf => {
  const model = gltf.scene;
  scene.add(model);
  camera.position.set(0, 1, 6);
  animate();
});

function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.004;
  renderer.render(scene, camera);
}
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});