import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import HolographicPanel from '../entities/ui/HolographicPanel'

interface ExperienceContentProps {
  moonPosition?: [number, number, number];
}

// Experience content - positioned next to Moon
const ExperienceContent: React.FC<ExperienceContentProps> = ({ moonPosition = [3, 0, 1] }) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Use useFrame to continuously update position relative to the moon's orbit
  useFrame(() => {
    if (groupRef.current && moonPosition) {
      groupRef.current.position.set(
        moonPosition[0] + 2,  // Offset to the right of the moon
        moonPosition[1] + 0.5, // Slightly above the moon
        moonPosition[2]       // Same Z position as the moon
      )
    }
  })
  
  return (
    <group ref={groupRef}>
      <HolographicPanel position={[0, 0, 0]}>
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>Experience</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Software Engineer II</h3>
            <p style={{ color: '#ffffff', opacity: 0.9, marginBottom: '5px' }}>Dick's Sporting Goods • 2023 - Present</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 1.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 2.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 3.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 4.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 5.</p>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Network Engineer Intern</h3>
            <p style={{ color: '#ffffff', opacity: 0.9, marginBottom: '5px' }}>Dick's Sporting Goods • 2022</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 1.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 2.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 3 - extra content for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 4 - extra content for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 5 - extra content for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 6 - extra content for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 7 - extra content for scrolling test.</p>
          </li>
        </ul>
      </HolographicPanel>
    </group>
  )
}

export default ExperienceContent 