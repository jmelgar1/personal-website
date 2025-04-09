import React from 'react'
import { Sphere } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'

const Sun: React.FC = () => {
  return React.createElement('group', 
    { position: [50, 10, -200] },
    
    // Main sun sphere - very bright and emissive
    React.createElement(Sphere, 
      { args: [5, 32, 32] },
      React.createElement('meshBasicMaterial', { color: "#FDB813" })
    ),
    
    // Inner glow
    React.createElement(Sphere, 
      { args: [5.2, 32, 32] },
      React.createElement('meshBasicMaterial', { 
        color: "#FF5500",
        transparent: true,
        opacity: 0.4,
        blending: AdditiveBlending
      })
    ),
    
    // Outer glow
    React.createElement(Sphere, 
      { args: [6, 32, 32] },
      React.createElement('meshBasicMaterial', { 
        color: "#FF9500",
        transparent: true,
        opacity: 0.2,
        blending: AdditiveBlending
      })
    ),
    
    // Light source
    React.createElement('pointLight', {
      color: "#FFF4E0",
      intensity: 1,
      distance: 1000,
      decay: 0.5
    })
  )
}

export default Sun 