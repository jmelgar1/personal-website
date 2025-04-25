import React, { Suspense, useState, useEffect, useRef, useContext } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Stars, Environment, useProgress, Html } from '@react-three/drei'
import Earth from './planets/Earth'
import Sun from './planets/Sun'
import Mars from './planets/Mars'
import Moon from './planets/Moon'
import UIOverlay from './UIOverlay'
import TabContent from './TabContent'
import PlanetControls from './controls/PlanetControls'
import { MoonPositionProvider, MoonPositionContext } from './contexts/MoonPositionContext'
import type { Mesh } from 'three'

// Loader component that shows progress
function Loader() {
  const { progress } = useProgress()
  return React.createElement(Html, { center: true }, 
    React.createElement('div', { className: 'loading' }, `${progress.toFixed(0)}% loaded`)
  )
}

// Camera info collector component - stays inside Canvas
const CameraInfoCollector = ({ onCameraInfoUpdate }: { onCameraInfoUpdate: (info: any) => void }) => {
  const { camera, controls } = useThree()
  
  useFrame(() => {
    // Get camera position
    const position = camera.position.toArray()
    
    // Get camera target from controls if available
    let target = [0, 0, 0]
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
    
    // Send info to parent component
    onCameraInfoUpdate({
      position,
      target,
      distance
    })
  })
  
  // This component doesn't render anything
  return null
}

// Component to integrate TabContent with moon position from context
const TabContentWithContext = ({ activeTab }: { activeTab: string }) => {
  const { position: moonPosition } = useContext(MoonPositionContext)
  // Set fixed positions for Earth and Mars since they don't move
  const earthPosition: [number, number, number] = [0, 0, 0]
  const marsPosition: [number, number, number] = [0, 0, 16]
  
  // Pass all planet positions to TabContent
  return <TabContent 
    activeTab={activeTab} 
    moonPosition={moonPosition as [number, number, number]}
    earthPosition={earthPosition}
    marsPosition={marsPosition}
  />
}

interface SolarSystemProps {
  className?: string
}

// Inner component that has access to the MoonPositionContext
const SolarSystemInner: React.FC<SolarSystemProps> = ({ className }) => {
  const { position: moonPosition } = useContext(MoonPositionContext)
  const [earthRotateSpeed, setEarthRotateSpeed] = useState(0.05)
  const [cloudsRotateSpeed, setCloudsRotateSpeed] = useState(0.07)
  const [zoom, setZoom] = useState(3)
  const [activeTab, setActiveTab] = useState('About Me')
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0])
  const [isFocused, setIsFocused] = useState(true) // Track if camera is focused on a planet
  const [cameraInfo, setCameraInfo] = useState({
    position: [0, 0, 0],
    target: [0, 0, 0],
    distance: 0
  })
  
  // Refs for the Canvas and planets
  const canvasRef = useRef(null)
  const earthRef = useRef<Mesh>(null)
  const marsRef = useRef<Mesh>(null)

  // Update camera target when tab changes
  useEffect(() => {
    // The controls now handle camera target based on active tab
    // This useEffect just sets initial planet positions
    switch(activeTab) {
      case 'About Me':
        setCameraTarget([0, 0, 0]) // Earth position
        break
      case 'Experience':
        // Moon position handled by context
        break
      case 'Projects':
        setCameraTarget([0, 0, 13]) // Mars position
        break
      default:
        setCameraTarget([0, 0, 0])
    }
  }, [activeTab])

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
  }, [zoom, setZoom])

  // Add wheel event handler to manage scroll zooming directly
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check the element directly under the mouse cursor
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
      if (elementUnderMouse && elementUnderMouse.closest('[data-tab-content="true"]')) {
        // Mouse is over tab content; do not prevent default, allowing scrolling
        return;
      }
      
      // Mouse is not over tab content; prevent default and handle zoom
      if (e.deltaY !== 0) {
        e.preventDefault();
        const zoomFactor = 0.2 * Math.sign(e.deltaY);
        const newZoom = Math.min(Math.max(2, zoom + zoomFactor), 20);
        if (newZoom !== zoom) {
          console.log('Wheel zoom:', zoom, '->', newZoom);
          setZoom(newZoom);
        }
      }
    };
    
    const canvas = canvasRef.current as HTMLElement | null;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, [zoom, canvasRef.current]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    console.log('Tab changed to:', tab)
  }

  // Handle focus state change from PlanetControls
  const handleFocusChange = (focused: boolean) => {
    setIsFocused(focused)
    console.log('Focus state changed:', focused ? 'Focused' : 'Free camera')
  }

  return React.createElement('div', 
    { 
      className: className, 
      style: { width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' } 
    },
    // 3D Canvas as the primary element
    React.createElement(Canvas, {
      ref: canvasRef,
      camera: { position: [0, 0, zoom], fov: 60 },
      shadows: false,
      style: { 
        background: 'black',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        outline: 'none',
        touchAction: 'none'
      },
      children: React.createElement(Suspense, 
        { fallback: React.createElement(Loader) },
        // Add a simple ambient light for visibility without shadows
        React.createElement('ambientLight', { intensity: 0.2 }),

        // Earth with Moon
        React.createElement('group', { position: [0, 0, 0] },
          React.createElement(Earth, { 
            ref: earthRef, 
            rotationSpeed: earthRotateSpeed,
            cloudsRotationSpeed: cloudsRotateSpeed 
          }),
          React.createElement(Moon, { earthRef })
        ),
        
        // Mars positioned further out
        React.createElement('group', { position: [0, 0, 16] },
          React.createElement(Mars, { ref: marsRef, rotationSpeed: 0.04 })
        ),
        
        // Sun is now the main light source
        React.createElement(Sun),
        
        // Add the 3D TabContent directly in the scene
        React.createElement(TabContentWithContext, { activeTab }),
        
        React.createElement(Stars, { radius: 100, depth: 50, count: 5000, factor: 2.5 }),
        React.createElement(PlanetControls, { 
          zoom,
          target: cameraTarget,
          activeTab,
          moonPosition,
          setZoom,
          onFocusChange: handleFocusChange // Pass focus change handler
        }),
        React.createElement(Environment, { preset: 'night' }),
        
        // Add camera info collector - this doesn't render anything visible
        React.createElement(CameraInfoCollector, { 
          onCameraInfoUpdate: setCameraInfo 
        })
      )
    }),
    
    // UI Overlay with pointer-events: none for most elements - now without TabContent
    React.createElement(UIOverlay, { 
      onTabChange: handleTabChange 
    },
      // Controls info panel
      React.createElement('div', 
        { 
          style: { 
            position: 'absolute', 
            bottom: '20px', 
            left: '20px', 
            color: 'white', 
            background: 'rgba(0,0,0,0.5)', 
            padding: '10px',
            borderRadius: '5px',
            zIndex: 10,
            pointerEvents: 'auto'
          } 
        },
        React.createElement('p', {}, 'Controls:'),
        React.createElement('p', {}, '• Mouse drag to rotate view'),
        React.createElement('p', {}, '• Scroll to zoom'),
        React.createElement('p', {}, `• Press 'R' to toggle Earth rotation: ${earthRotateSpeed > 0 ? 'ON' : 'OFF'}`),
        React.createElement('p', {}, `• Press '+'/'-' to zoom in/out`)
      )
    ),
    
    // Debug overlay outside the Canvas - updated to show focus state
    React.createElement('div', 
      { 
        style: { 
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
        } 
      },
      React.createElement('div', {}, `Zoom (State): ${zoom.toFixed(4)}`),
      React.createElement('div', {}, `Active Tab: ${activeTab}`),
      React.createElement('div', {}, `Camera Mode: ${isFocused ? 'Focused' : 'Free'}`),
      React.createElement('div', {}, `Camera Position:`),
      React.createElement('div', { style: { marginLeft: '10px' }}, 
        `X: ${cameraInfo.position[0].toFixed(2)} Y: ${cameraInfo.position[1].toFixed(2)} Z: ${cameraInfo.position[2].toFixed(2)}`
      ),
      React.createElement('div', {}, `Camera Target:`),
      React.createElement('div', { style: { marginLeft: '10px' }}, 
        `X: ${cameraInfo.target[0].toFixed(2)} Y: ${cameraInfo.target[1].toFixed(2)} Z: ${cameraInfo.target[2].toFixed(2)}`
      ),
      React.createElement('div', {}, `Camera Distance: ${cameraInfo.distance.toFixed(4)}`),
      React.createElement('div', { 
        style: { 
          marginTop: '5px', 
          paddingTop: '5px', 
          borderTop: '1px solid rgba(255,255,255,0.3)'
        }
      }, 'Tip: Double-click to toggle focus')
    )
  )
}

// Main component that wraps the inner component with the MoonPositionProvider
const SolarSystem: React.FC<SolarSystemProps> = (props) => {
  return React.createElement(
    MoonPositionProvider,
    { children: React.createElement(SolarSystemInner, props) }
  )
}

export default SolarSystem 