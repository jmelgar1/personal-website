import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Sphere } from '@react-three/drei'
import type { Mesh } from 'three'
import { DoubleSide } from 'three'

interface MoonProps {
  earthRef: React.RefObject<Mesh>;
  orbitSpeed?: number;
  orbitRadius?: number;
}

const Moon: React.FC<MoonProps> = ({ 
  earthRef, 
  orbitSpeed = 0.02,
  orbitRadius = 3
}) => {
  const moonRef = useRef<Mesh>(null)
  
  // Load moon texture
  const moonTexture = useTexture('/textures/moon_map.png')
  
  // Update moon position to orbit around Earth
  useFrame(({ clock }) => {
    if (moonRef.current && earthRef.current) {
      const time = clock.getElapsedTime()
      
      // Calculate orbit position
      const angle = time * orbitSpeed
      const x = Math.cos(angle) * orbitRadius
      const z = Math.sin(angle) * orbitRadius
      
      // Update moon position relative to Earth
      moonRef.current.position.x = earthRef.current.position.x + x
      moonRef.current.position.z = earthRef.current.position.z + z
      
      // Rotate moon to face Earth
      moonRef.current.rotation.y = -angle
    }
  })

  return (
    <group>
      {/* Main Moon sphere */}
      <Sphere ref={moonRef} args={[0.27, 32, 32]}>
        <meshStandardMaterial 
          map={moonTexture}
          emissive="#111111"
          emissiveIntensity={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Subtle atmosphere glow */}
      <Sphere args={[0.28, 32, 32]}>
        <meshStandardMaterial 
          color="#666666"
          transparent={true}
          opacity={0.1}
          depthWrite={false}
          side={DoubleSide}
        />
      </Sphere>
    </group>
  )
}

export default Moon 