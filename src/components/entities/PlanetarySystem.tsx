import React, { useRef } from 'react'
import Earth from './planets/Earth'
import Sun from './planets/Sun'
import Mars from './planets/Mars'
import Moon from './planets/Moon'
import { useAppState } from '../../contexts/AppStateContext'
import type { Mesh } from 'three'

const PlanetarySystem: React.FC = () => {
  const { earthRotateSpeed, cloudsRotateSpeed } = useAppState()
  const earthRef = useRef<Mesh>(null)
  const marsRef = useRef<Mesh>(null)
  
  return (
    <>
      {/* Earth with Moon */}
      <group position={[0, 0, 0]}>
        <Earth 
          ref={earthRef} 
          rotationSpeed={earthRotateSpeed} 
          cloudsRotationSpeed={cloudsRotateSpeed} 
        />
        <Moon earthRef={earthRef} />
      </group>
      
      {/* Mars positioned further out */}
      <group position={[0, 0, 16]}>
        <Mars ref={marsRef} rotationSpeed={0.04} />
      </group>
      
      {/* Sun is the main light source */}
      <Sun />
    </>
  )
}

export default PlanetarySystem 