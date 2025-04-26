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

 useEffect(() => {
  let velocity = 0;
  let lastScrollTime = 0;
  let animationFrameId: number | null = null;
  const decayRate = 0.92; // Controls how quickly the zoom slows down (0 to 1, closer to 1 is slower decay)
  const zoomSensitivity = 0.002; // Adjusts how much each scroll impacts velocity
  const minVelocityThreshold = 0.001; // Stop animation when velocity is below this

  const animateZoom = (timestamp: number) => {
    if (Math.abs(velocity) < minVelocityThreshold) {
      velocity = 0;
      animationFrameId = null;
      return;
    }

    // Apply velocity to zoom
    const newZoom = Math.min(Math.max(2, zoom + velocity), 20);
    if (newZoom !== zoom) {
      setZoom(newZoom);
      console.log('Inertia zoom:', zoom, '->', newZoom);
    }

    // Decay velocity
    velocity *= decayRate;

    // Continue animation
    animationFrameId = requestAnimationFrame(animateZoom);
  };

  const handleWheel = (e: WheelEvent) => {
    // Skip if the event target is within a tab content panel
    if ((e.target as HTMLElement)?.closest('[data-tab-content="true"]')) {
      return;
    }

    if (e.deltaY !== 0) {
      e.preventDefault();

      // Update velocity based on scroll direction and intensity
      const scrollDelta = e.deltaY * zoomSensitivity;
      velocity += scrollDelta;
      lastScrollTime = performance.now();

      // Ensure immediate zoom response
      const zoomFactor = scrollDelta;
      const newZoom = Math.min(Math.max(2, zoom + zoomFactor), 20);

      if (newZoom !== zoom) {
        setZoom(newZoom);
        console.log('Wheel zoom:', zoom, '->', newZoom);
      }

      // Cancel any existing animation and start a new one
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(animateZoom);
    }
  };

  // Add wheel event listener to the canvas element
  if (canvasRef.current) {
    canvasRef.current.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('wheel', handleWheel);
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }
}, [zoom, setZoom]);useEffect(() => {
  let velocity = 0;
  let lastScrollTime = 0;
  let animationFrameId: number | null = null;
  const decayRate = 0.92; // Controls how quickly the zoom slows down (0 to 1, closer to 1 is slower decay)
  const zoomSensitivity = 0.002; // Adjusts how much each scroll impacts velocity
  const minVelocityThreshold = 0.001; // Stop animation when velocity is below this

  const animateZoom = (timestamp: number) => {
    if (Math.abs(velocity) < minVelocityThreshold) {
      velocity = 0;
      animationFrameId = null;
      return;
    }

    // Apply velocity to zoom
    const newZoom = Math.min(Math.max(2, zoom + velocity), 20);
    if (newZoom !== zoom) {
      setZoom(newZoom);
      console.log('Inertia zoom:', zoom, '->', newZoom);
    }

    // Decay velocity
    velocity *= decayRate;

    // Continue animation
    animationFrameId = requestAnimationFrame(animateZoom);
  };

  const handleWheel = (e: WheelEvent) => {
    // Skip if the event target is within a tab content panel
    if ((e.target as HTMLElement)?.closest('[data-tab-content="true"]')) {
      return;
    }

    if (e.deltaY !== 0) {
      e.preventDefault();

      // Update velocity based on scroll direction and intensity
      const scrollDelta = e.deltaY * zoomSensitivity;
      velocity += scrollDelta;
      lastScrollTime = performance.now();

      // Ensure immediate zoom response
      const zoomFactor = scrollDelta;
      const newZoom = Math.min(Math.max(2, zoom + zoomFactor), 20);

      if (newZoom !== zoom) {
        setZoom(newZoom);
        console.log('Wheel zoom:', zoom, '->', newZoom);
      }

      // Cancel any existing animation and start a new one
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(animateZoom);
    }
  };

  // Add wheel event listener to the canvas element
  if (canvasRef.current) {
    canvasRef.current.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('wheel', handleWheel);
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }
}, [zoom, setZoom]);

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