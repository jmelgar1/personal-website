import React from 'react'
import { useAppState } from '../../contexts/AppStateContext'

const DebugOverlay: React.FC = () => {
  const { 
    zoom, 
    activeTab, 
    isFocused, 
    cameraInfo,
    earthRotateSpeed,
    focusedPanel
  } = useAppState()
  
  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        color: 'lime', 
        background: 'rgba(0,0,0,0.7)', 
        padding: '5px 10px',
        borderRadius: '5px',
        zIndex: 100,
        fontFamily: 'monospace',
        fontSize: '14px',
        pointerEvents: 'none',
        userSelect: 'none',
        maxWidth: '300px',
        overflow: 'hidden'
      }} 
    >
      <div>{`Zoom (State): ${zoom.toFixed(4)}`}</div>
      <div>{`Active Tab: ${activeTab}`}</div>
      <div>{`Camera Mode: ${isFocused ? 'Focused' : 'Free'}`}</div>
      <div>{`Camera Position:`}</div>
      <div style={{ marginLeft: '10px' }}>
        {`X: ${cameraInfo.position[0].toFixed(2)} Y: ${cameraInfo.position[1].toFixed(2)} Z: ${cameraInfo.position[2].toFixed(2)}`}
      </div>
      <div>{`Camera Target:`}</div>
      <div style={{ marginLeft: '10px' }}>
        {`X: ${cameraInfo.target[0].toFixed(2)} Y: ${cameraInfo.target[1].toFixed(2)} Z: ${cameraInfo.target[2].toFixed(2)}`}
      </div>
      <div>{`Camera Distance: ${cameraInfo.distance.toFixed(4)}`}</div>
      
      {/* Display focused object info if available */}
      {focusedPanel.isActive && focusedPanel.position && (
        <>
          <div style={{ 
            marginTop: '5px', 
            paddingTop: '5px', 
            borderTop: '1px solid rgba(255,255,255,0.3)'
          }}>
            {`Focused Object: ${focusedPanel.type || 'Unknown'}`}
          </div>
          <div>{`Position:`}</div>
          <div style={{ marginLeft: '10px' }}>
            {`X: ${focusedPanel.position.x.toFixed(2)} Y: ${focusedPanel.position.y.toFixed(2)} Z: ${focusedPanel.position.z.toFixed(2)}`}
          </div>
          {focusedPanel.normal && (
            <>
              <div>{`Normal Vector:`}</div>
              <div style={{ marginLeft: '10px' }}>
                {`X: ${focusedPanel.normal.x.toFixed(2)} Y: ${focusedPanel.normal.y.toFixed(2)} Z: ${focusedPanel.normal.z.toFixed(2)}`}
              </div>
            </>
          )}
        </>
      )}
      
      <div style={{ 
        marginTop: '5px', 
        paddingTop: '5px', 
        borderTop: '1px solid rgba(255,255,255,0.3)'
      }}>
        Tip: Double-click to toggle focus
      </div>
    </div>
  )
}

export default DebugOverlay 