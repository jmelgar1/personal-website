import React, { useRef, useEffect } from 'react'
import Canvas3D from '../core/Canvas3D'
import CameraManager from '../core/CameraManager'
import UIOverlay from '../ui/UIOverlay'
import TabContent from '../ui/TabContent'
import PlanetControls from '../controls/PlanetControls'
import PlanetarySystem from './PlanetarySystem'
import DebugOverlay from '../ui/DebugOverlay'
import ControlsPanel from '../ui/ControlsPanel'
import { AppStateProvider, useAppState } from '../../contexts/AppStateContext'
import { PlanetPositionProvider, PlanetPositionContext } from '../../contexts/PlanetPositionContext'

// Component to integrate TabContent with planet positions from context
const TabContentWithContext = () => {
  const { activeTab } = useAppState()
  const planetPositions = React.useContext(PlanetPositionContext)

  // Pass planet positions to TabContent
  return (
    <TabContent 
      activeTab={activeTab} 
      moonPosition={planetPositions.moonPosition}
      earthPosition={planetPositions.earthPosition}
      marsPosition={planetPositions.marsPosition}
    />
  )
}

// Inner component with all the functionality and wrapped in contexts
const SolarSystemInner: React.FC<{ className?: string }> = ({ className }) => {
  const { 
    zoom, 
    setZoom, 
    activeTab, 
    setActiveTab, 
    cameraTarget,
    isFocused,
    setIsFocused,
    setEarthRotateSpeed,
    setCloudsRotateSpeed
  } = useAppState()
  const planetPositions = React.useContext(PlanetPositionContext)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wheelVelocityRef = useRef(0)
  const momentumFrameRef = useRef<number | null>(null)

  // Implement keyboard zoom handling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        setEarthRotateSpeed(prev => prev === 0 ? 0.05 : 0)
        setCloudsRotateSpeed(prev => prev === 0 ? 0.07 : 0)
      }
      
      // Zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault() // Prevent any default browser actions
        const newZoom = Math.max(2, zoom - 0.5)
        console.log('Zoom in:', zoom, '->', newZoom)
        setZoom(newZoom)
      }
      
      // Zoom out
      if (e.key === '-' || e.key === '_') {
        e.preventDefault() // Prevent any default browser actions
        const newZoom = Math.min(20, zoom + 0.5)
        console.log('Zoom out:', zoom, '->', newZoom)
        setZoom(newZoom)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [zoom, setZoom, setEarthRotateSpeed, setCloudsRotateSpeed])

  // Add wheel event handler with smooth momentum scrolling
  useEffect(() => {
    const animateMomentum = () => {
      const velocity = wheelVelocityRef.current
      if (Math.abs(velocity) < 0.001) {
        wheelVelocityRef.current = 0
        return
      }
      setZoom(prevZoom => {
        const next = Math.min(Math.max(2, prevZoom + velocity), 20)
        return next
      })
      wheelVelocityRef.current *= 0.77
      momentumFrameRef.current = requestAnimationFrame(animateMomentum)
    }

    const handleWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement)?.closest('[data-tab-content="true"]')) return
      e.preventDefault()
      // Scroll down should zoom out (increase zoom), scroll up zoom in (decrease zoom)
      const delta = Math.sign(e.deltaY) * 0.2
      wheelVelocityRef.current += delta
      if (momentumFrameRef.current !== null) {
        cancelAnimationFrame(momentumFrameRef.current)
      }
      momentumFrameRef.current = requestAnimationFrame(animateMomentum)
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
    }
    return () => {
      if (canvas) canvas.removeEventListener('wheel', handleWheel)
      if (momentumFrameRef.current !== null) cancelAnimationFrame(momentumFrameRef.current)
    }
  }, [setZoom])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    console.log('Tab changed to:', tab)
  }

  // Handle focus state change from PlanetControls
  const handleFocusChange = (focused: boolean) => {
    setIsFocused(focused)
    console.log('Focus state changed:', focused ? 'Focused' : 'Free camera')
  }

  // Handle canvas ref from Canvas3D
  const handleCanvasRef = (ref: React.RefObject<HTMLCanvasElement>) => {
    if (ref.current) {
      canvasRef.current = ref.current;
    }
  };

  return (
    <div 
      className={className}
      style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}
    >
      <Canvas3D onCanvasRef={handleCanvasRef}>
        {/* Planetary system - includes Earth, Moon, Mars, Sun */}
        <PlanetarySystem />
        
        {/* Content panels */}
        <TabContentWithContext />
        
        {/* Controls for camera and interactions */}
        <PlanetControls
          zoom={zoom}
          target={cameraTarget}
          activeTab={activeTab}
          moonPosition={planetPositions.moonPosition}
          setZoom={setZoom}
          onFocusChange={handleFocusChange}
        />
        
        {/* Camera tracking */}
        <CameraManager />
      </Canvas3D>
      
      {/* UI overlay with tabs */}
      <UIOverlay onTabChange={handleTabChange} />
      
      {/* Control information panel */}
      <ControlsPanel />
      
      {/* Debug information overlay */}
      <DebugOverlay />
    </div>
  )
}

// Wrapper component that provides all contexts
const SolarSystem: React.FC<{ className?: string }> = (props) => {
  return (
    <AppStateProvider>
      <PlanetPositionProvider>
        <SolarSystemInner {...props} />
      </PlanetPositionProvider>
    </AppStateProvider>
  )
}

export default SolarSystem 