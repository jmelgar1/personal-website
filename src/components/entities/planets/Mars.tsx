import React, { useRef, useState, useEffect, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Sphere } from '@react-three/drei'
import type { Mesh } from 'three'
import { DoubleSide } from 'three'

interface MarsProps {
  rotationSpeed?: number;
}

const Mars = forwardRef<Mesh, MarsProps>(({ rotationSpeed = 0.04 }, ref) => {
  const marsRef = useRef<Mesh>(null)
  const [textureLoaded, setTextureLoaded] = useState(false)
  
  // Load Mars texture
  const marsTexture = useTexture('/textures/mars_map.png', (texture) => {
    setTextureLoaded(true)
    console.log('Mars texture loaded successfully')
  })
  
  // Apply texture enhancements
  useEffect(() => {
    if (marsTexture) {
      marsTexture.colorSpace = 'srgb'
    }
  }, [marsTexture])
  
  // Rotate Mars based on the provided speed
  useFrame(({ clock }) => {
    if (marsRef.current) {
      marsRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed
    }
  })

  return (
    <group>
      {/* Main Mars sphere */}
      <Sphere ref={ref || marsRef} args={[0.8, 64, 64]}>
        <meshPhongMaterial 
          map={marsTexture}
          emissive="#331100"
          emissiveIntensity={0.05}
          shininess={5}
          color={textureLoaded ? "#ffffff" : "#cc4400"}
        />
      </Sphere>
      
      {/* Thin atmosphere */}
      <Sphere args={[0.83, 32, 32]}>
        <meshPhongMaterial 
          color="#ffccaa"
          transparent={true}
          opacity={0.08}
          depthWrite={false}
          shininess={0}
        />
      </Sphere>
    </group>
  )
})

Mars.displayName = 'Mars'

export default Mars 