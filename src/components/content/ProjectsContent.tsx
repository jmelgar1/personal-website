import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import HolographicPanel from '../entities/ui/HolographicPanel'

interface ProjectsContentProps {
  marsPosition?: [number, number, number];
}

// Projects content - positioned next to Mars
const ProjectsContent: React.FC<ProjectsContentProps> = ({ marsPosition = [0, 0, 16] }) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Use useFrame to continuously update position relative to Mars
  useFrame(() => {
    if (groupRef.current && marsPosition) {
      groupRef.current.position.set(
        marsPosition[0] + 2.5,  // Offset to the right of Mars
        marsPosition[1] + 0,    // Same height as Mars
        marsPosition[2]         // Same Z position as Mars
      )
    }
  })
  
  return (
    <group ref={groupRef}>
      <HolographicPanel position={[0, 0, 0]}>
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>Projects</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Dark Matter Mapper</h3>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Project for this random stuf blah blah blah blah</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Extra details for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>More details for scrolling test.</p>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Meal Planner</h3>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>that one project balls.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Extra details for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>More details for scrolling test.</p>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>something else idk</h3>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>hello hello hello.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Extra details for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>More details for scrolling test.</p>
          </li>
        </ul>
      </HolographicPanel>
    </group>
  )
}

export default ProjectsContent 