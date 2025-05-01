import React from 'react'
import { useAppState } from '../../contexts/AppStateContext'

const ControlsPanel: React.FC = () => {
  const { earthRotateSpeed } = useAppState()
  
  return (
    <div 
      style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '20px', 
        color: 'white', 
        background: 'rgba(0,0,0,0.5)', 
        padding: '10px',
        borderRadius: '5px',
        zIndex: 10,
        pointerEvents: 'auto'
      }} 
    >
      <p>Controls:</p>
      <p>• Mouse drag to rotate view</p>
      <p>• Scroll to zoom</p>
      <p>• W/A/S/D keys to move forward/left/backward/right</p>
      <p>• Space/Shift to move up/down</p>
      <p>• Hold Control for faster movement</p>
      <p>{`• Press 'R' to toggle Earth rotation: ${earthRotateSpeed > 0 ? 'ON' : 'OFF'}`}</p>
      <p>• Press '+'/'-' to zoom in/out</p>
    </div>
  )
}

export default ControlsPanel 