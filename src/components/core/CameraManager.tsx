import React from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useAppState } from '../../contexts/AppStateContext'

// Camera info collector component - extracts camera information and updates the context
const CameraManager: React.FC = () => {
  const { camera, controls } = useThree()
  const { setCameraInfo } = useAppState()
  
  useFrame(() => {
    // Get camera position
    const position = camera.position.toArray() as [number, number, number]
    
    // Get camera target from controls if available
    let target: [number, number, number] = [0, 0, 0]
    if (controls && 'target' in controls) {
      // @ts-ignore - we know OrbitControls has target property
      const targetObj = controls.target
      // @ts-ignore - accessing target properties
      target = [targetObj.x || 0, targetObj.y || 0, targetObj.z || 0]
    }
    
    // Calculate distance
    const distance = Math.sqrt(
      Math.pow(position[0] - target[0], 2) +
      Math.pow(position[1] - target[1], 2) +
      Math.pow(position[2] - target[2], 2)
    )
    
    // Send info to context
    setCameraInfo({
      position,
      target,
      distance
    })
  })
  
  // This component doesn't render anything
  return null
}

export default CameraManager 