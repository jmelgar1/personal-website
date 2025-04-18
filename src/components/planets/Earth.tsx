import React, { useRef, useState, useEffect, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Sphere } from '@react-three/drei'
import type { Mesh } from 'three'
import { DoubleSide, TextureLoader } from 'three'

interface EarthProps {
  rotationSpeed?: number;
}

const Earth = forwardRef<Mesh, EarthProps>(({ rotationSpeed = 0.05 }, ref) => {
  const earthRef = useRef<Mesh>(null)
  const [textureLoaded, setTextureLoaded] = useState(false)
  
  // Try to load Earth texture, with fallback
  const earthTexture = useTexture('/textures/earthmap.jpg', (texture) => {
    setTextureLoaded(true)
    console.log('Earth texture loaded successfully')
  })
  
  // Apply some cartoon-like enhancements to the texture
  useEffect(() => {
    if (earthTexture) {
      // Increase saturation slightly for more vibrant colors
      earthTexture.colorSpace = 'srgb'
    }
  }, [earthTexture])
  
  // Rotate Earth based on the provided speed
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed
    }
  })

  return (
    <group>
      {/* Main Earth sphere */}
      <Sphere ref={ref || earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          map={earthTexture}
          emissive="#112244"
          emissiveIntensity={0.05}
          roughness={1.2}
          metalness={0.0}
          // Enhance colors for a more cartoon-like appearance
          color={textureLoaded ? "#ffffff" : "#2233ff"}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere args={[1.05, 32, 32]}>
        <meshStandardMaterial 
          color="#77aaff"
          transparent={true}
          opacity={0.15}
          depthWrite={false}
          side={DoubleSide}
        />
      </Sphere>
    </group>
  )
})

Earth.displayName = 'Earth'

export default Earth 