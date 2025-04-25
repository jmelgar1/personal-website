import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import HolographicPanel from '../entities/ui/HolographicPanel'

interface AboutMeContentProps {
  earthPosition?: [number, number, number];
}

// About Me content - positioned next to Earth
const AboutMeContent: React.FC<AboutMeContentProps> = ({ earthPosition = [0, 0, 0] }) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Use useFrame to continuously update position relative to Earth
  useFrame(() => {
    if (groupRef.current && earthPosition) {
      groupRef.current.position.set(
        earthPosition[0] + 2.5,  // Offset to the right of Earth
        earthPosition[1] + 0,    // Same height as Earth
        earthPosition[2]         // Same Z position as Earth
      )
    }
  })
  
  return (
    <group ref={groupRef}>
      <HolographicPanel position={[0, 0, 0]}>
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>About Me</h2>
        <p style={{ color: '#ffffff', opacity: 0.9, lineHeight: '1.4' }}>Hi! I'm Josh Melgar, a full-stack software engineer with a passion for creating cool stuff.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>some random stuff here.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>some random stuff here.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>Extra paragraph for scrolling test.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>Extra paragraph for scrolling test.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>Extra paragraph for scrolling test.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>Extra paragraph for scrolling test.</p>
      </HolographicPanel>
    </group>
  )
}

export default AboutMeContent 