import React, { Suspense, useState, useEffect, useRef, useContext } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Environment, useProgress, Html } from '@react-three/drei'
import Earth from './planets/Earth'
import Sun from './planets/Sun'
import Mars from './planets/Mars'
import MoonWithTracking from './planets/MoonWithTracking'
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
      if (e.deltaY !== 0) {
        e.preventDefault()
        
        // Zoom in/out based on wheel direction
        const zoomFactor = 0.2 * Math.sign(e.deltaY)
        const newZoom = Math.min(Math.max(2, zoom + zoomFactor), 20)
        
        if (newZoom !== zoom) {
          console.log('Wheel zoom:', zoom, '->', newZoom)
          setZoom(newZoom)
        }
      }
    }
    
    // Add wheel event listener to the canvas element
    const canvas = canvasRef.current as HTMLElement | null
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      
      return () => {
        canvas.removeEventListener('wheel', handleWheel)
      }
    }
  }, [zoom, canvasRef.current])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    console.log('Tab changed to:', tab)
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
          React.createElement(MoonWithTracking, { earthRef })
        ),
        
        // Mars positioned further out
        React.createElement('group', { position: [0, 0, 13] },
          React.createElement(Mars, { ref: marsRef, rotationSpeed: 0.04 })
        ),
        
        // Sun is now the main light source
        React.createElement(Sun),
        React.createElement(Stars, { radius: 100, depth: 50, count: 5000, factor: 2.5 }),
        React.createElement(PlanetControls, { 
          zoom,
          target: cameraTarget,
          activeTab,
          moonPosition
        }),
        React.createElement(Environment, { preset: 'night' })
      )
    }),
    
    // UI Overlay with pointer-events: none for most elements
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
      ),
      
      // Tab Content
      React.createElement(TabContent, { activeTab })
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