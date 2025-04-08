import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Sphere } from '@react-three/drei'
import type { Mesh } from 'three'
import { DoubleSide, TextureLoader } from 'three'

const Earth: React.FC = () => {
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
  
  // Rotate Earth slowly
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group>
      {/* Main Earth sphere */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
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
}

export default Earth 