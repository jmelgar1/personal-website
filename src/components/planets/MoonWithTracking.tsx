import React, { useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import Moon from './Moon'
import type { Mesh } from 'three'
import { MoonPositionContext } from '../contexts/MoonPositionContext'

interface MoonWithTrackingProps {
  earthRef: React.RefObject<Mesh>;
}

const MoonWithTracking: React.FC<MoonWithTrackingProps> = ({ earthRef }) => {
  const { setPosition } = useContext(MoonPositionContext)
  
  // Track the moon's position using useFrame
  useFrame(({ clock }) => {
    if (earthRef.current) {
      const time = clock.getElapsedTime()
      const orbitSpeed = 0.02
      const orbitRadius = 3
      
      // Calculate orbit position - same calculation as in Moon component
      const angle = time * orbitSpeed
      const x = Math.cos(angle) * orbitRadius + earthRef.current.position.x
      const z = Math.sin(angle) * orbitRadius + earthRef.current.position.z
      
      // Update the position in context
      setPosition([x, 0, z])
    }
  })
  
  return React.createElement(Moon, { earthRef })
}

export default MoonWithTracking 