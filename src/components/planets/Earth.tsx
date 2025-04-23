import React, { useRef, useState, useEffect, forwardRef, RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Sphere } from '@react-three/drei'
import type { Mesh } from 'three'
import { DoubleSide, TextureLoader } from 'three'

interface EarthProps {
  rotationSpeed?: number;
  cloudsRotationSpeed?: number;
}

const Earth = forwardRef<Mesh, EarthProps>(({ 
  rotationSpeed = 0.05, 
  cloudsRotationSpeed = 0.07 
}, ref) => {
  const earthRef = useRef<Mesh>(null)
  const cloudsRef = useRef<Mesh>(null)
  const [textureLoaded, setTextureLoaded] = useState(false)
  const [cloudsLoaded, setCloudsLoaded] = useState(false)
  
  // Load Earth textures - day texture and optional night texture
  const earthDayTexture = useTexture('/textures/earth_map.jpg', (texture) => {
    setTextureLoaded(true)
    console.log('Earth day texture loaded successfully')
  })
  
  const cloudsTexture = useTexture('/textures/earth_clouds.jpg', (texture) => {
    setCloudsLoaded(true)
    console.log('Earth clouds texture loaded successfully')
  })
  
  // Apply some enhancements to the textures
  useEffect(() => {
    if (earthDayTexture) {
      earthDayTexture.colorSpace = 'srgb'
    }
    if (cloudsTexture) {
      cloudsTexture.colorSpace = 'srgb'
    }
  }, [earthDayTexture, cloudsTexture])
  
  // Rotate Earth and clouds at different speeds
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    
    // Handle rotation for the Earth - either using the external ref or our internal ref
    if (ref) {
      if (typeof ref !== 'function' && ref.current) {
        ref.current.rotation.y = time * rotationSpeed
      }
    } else if (earthRef.current) {
      earthRef.current.rotation.y = time * rotationSpeed
    }
    
    // Rotate clouds
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * cloudsRotationSpeed
    }
  })

  return (
    <group>
      {/* Main Earth sphere */}
      <Sphere ref={ref || earthRef} args={[1, 64, 64]}>
        <meshPhongMaterial 
          map={earthDayTexture}
          emissive="#001122" 
          emissiveIntensity={0.1}
          shininess={5}
          color={textureLoaded ? "#ffffff" : "#2233ff"}
        />
      </Sphere>
      
      {/* Cloud layer */}
      <Sphere ref={cloudsRef} args={[1.02, 64, 64]}>
        <meshPhongMaterial 
          map={cloudsTexture}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
          color="#ffffff"
          shininess={0}
        />
      </Sphere>
    </group>
  )
})

Earth.displayName = 'Earth'

export default Earth 