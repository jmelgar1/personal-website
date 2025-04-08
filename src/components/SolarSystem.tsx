import React, { Suspense, useState, useEffect, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls, Environment, useProgress, Html } from '@react-three/drei'
import Earth from './planets/Earth'

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

const SolarSystem: React.FC<SolarSystemProps> = ({ className }) => {
  const [autoRotate, setAutoRotate] = useState(true)
  const [zoom, setZoom] = useState(3)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        setAutoRotate(prev => !prev)
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

  // Create canvas children
  const canvasChildren = React.createElement(Suspense, 
    { fallback: React.createElement(Loader) },
    React.createElement('ambientLight', { intensity: 0.2 }),
    React.createElement('pointLight', { position: [10, 10, 10], intensity: 1.5 }),
    React.createElement(Earth),
    React.createElement(Stars, { radius: 100, depth: 50, count: 5000, factor: 4 }),
    React.createElement(OrbitControls, { 
      enableZoom: true, 
      enablePan: true,
      enableRotate: true,
      zoomSpeed: 0.6,
      autoRotate: autoRotate,
      autoRotateSpeed: 0.5
    }),
    React.createElement(Environment, { preset: 'night' })
  )

  return React.createElement('div', 
    { 
      className: className, 
      style: { width: '100%', height: '100vh', position: 'relative' } 
    },
    // UI overlay
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
          zIndex: 100
        } 
      },
      React.createElement('p', {}, 'Controls:'),
      React.createElement('p', {}, '• Mouse drag to rotate view'),
      React.createElement('p', {}, '• Scroll to zoom'),
      React.createElement('p', {}, `• Press 'R' to toggle auto-rotation: ${autoRotate ? 'ON' : 'OFF'}`),
      React.createElement('p', {}, `• Press '+'/'-' to zoom in/out`)
    ),
    // Canvas with all props in a single object
    React.createElement(Canvas, {
      camera: { position: [0, 0, zoom], fov: 60 },
      style: { background: 'black' },
      children: canvasChildren
    })
  )
}

export default SolarSystem 