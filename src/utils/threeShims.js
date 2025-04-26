// This file provides shims for removed or renamed constants in Three.js
import * as THREE from 'three';

// Handle LinearEncoding which was removed in newer Three.js versions
if (!THREE.LinearEncoding) {
  THREE.LinearEncoding = THREE.NoColorSpace || 'NoColorSpace';
}

export default THREE; 