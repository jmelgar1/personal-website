import React, { useRef } from 'react'
import { Sphere } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DirectionalLight } from 'three'

const Sun: React.FC = () => {
  const directionalLightRef = useRef<DirectionalLight>(null)

  // Update directional light to always point at the scene center
  useFrame(() => {
    if (directionalLightRef.current) {
      directionalLightRef.current.position.set(50, 10, -200)
      directionalLightRef.current.target.position.set(0, 0, 0)
      directionalLightRef.current.target.updateMatrixWorld()
    }
  })

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
    
    // Directional light without shadows
    React.createElement('directionalLight', {
      ref: directionalLightRef,
      color: "#FFFFFF",
      intensity: 3,
      position: [50, 10, -200],
      castShadow: false
    }),
    
    // Ambient point light for the sun's glow
    React.createElement('pointLight', {
      color: "#FFF4E0",
      intensity: 0.5,
      distance: 1000,
      decay: 0.5
    })
  )
}

export default Sun 