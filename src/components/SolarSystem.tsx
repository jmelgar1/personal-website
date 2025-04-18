import React, { Suspense, useState, useEffect, ReactNode, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls, Environment, useProgress, Html } from '@react-three/drei'
import Earth from './planets/Earth'
import Sun from './planets/Sun'
import Moon from './planets/Moon'
import Mars from './planets/Mars'
import UIOverlay from './UIOverlay'
import TabContent from './TabContent'
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

// Enhanced Controls component
interface ControlsProps {
  zoom: number;
}

const Controls: React.FC<ControlsProps> = ({ zoom }) => {
  return React.createElement(OrbitControls, { 
    enableZoom: true, 
    enablePan: true,
    enableRotate: true,
    zoomSpeed: 0.6,
    rotateSpeed: 0.8, // Increased rotation speed
    minDistance: 2,
    maxDistance: 20,
    dampingFactor: 0.1,
    autoRotate: false,
    makeDefault: true
  })
}

const SolarSystem: React.FC<SolarSystemProps> = ({ className }) => {
  const [earthRotateSpeed, setEarthRotateSpeed] = useState(0.05)
  const [zoom, setZoom] = useState(3)
  const [activeTab, setActiveTab] = useState('Experience')
  
  // Refs for the Canvas and Earth elements
  const canvasRef = useRef(null)
  const earthRef = useRef<Mesh>(null)
  const marsRef = useRef<Mesh>(null)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        setEarthRotateSpeed(prev => prev === 0 ? 0.05 : 0)
      }
      if (e.key === '+') {
        setZoom(prev => Math.max(1.5, prev - 0.5))
      }
      if (e.key === '-') {
        setZoom(prev => Math.min(10, prev + 0.5))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    console.log('Tab changed to:', tab)
  }

  // SIMPLIFIED VERSION - Make Canvas the primary element that covers everything
  return React.createElement('div', 
    { 
      className: className, 
      style: { width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' } 
    },
    // 3D Canvas as the primary element
    React.createElement(Canvas, {
      ref: canvasRef,
      camera: { position: [0, 0, zoom], fov: 60 },
      style: { 
        background: 'black',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        outline: 'none', // Remove focus outline
        touchAction: 'none' // Prevent default touch actions
      },
      children: React.createElement(Suspense, 
        { fallback: React.createElement(Loader) },
        React.createElement('ambientLight', { intensity: 0.2 }),
        React.createElement('pointLight', { position: [10, 10, 10], intensity: 1.5 }),
        
        // Earth with Moon
        React.createElement('group', { position: [0, 0, 0] },
          React.createElement(Earth, { ref: earthRef, rotationSpeed: earthRotateSpeed }),
          React.createElement(Moon, { earthRef })
        ),
        
        // Mars positioned further out
        React.createElement('group', { position: [10, 0, -1] },
          React.createElement(Mars, { ref: marsRef, rotationSpeed: 0.04 })
        ),
        
        React.createElement(Sun),
        React.createElement(Stars, { radius: 100, depth: 50, count: 5000, factor: 4 }),
        React.createElement(Controls, { zoom }),
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
            pointerEvents: 'auto' // Enable pointer events only for this panel
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

export default SolarSystem 