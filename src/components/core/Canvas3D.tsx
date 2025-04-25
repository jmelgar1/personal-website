import React, { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Environment, useProgress, Html } from '@react-three/drei'
import { useAppState } from '../../contexts/AppStateContext'

// Loader component that shows progress
function Loader() {
  const { progress } = useProgress()
  return React.createElement(Html, { center: true }, 
    React.createElement('div', { className: 'loading' }, `${progress.toFixed(0)}% loaded`)
  )
}

interface Canvas3DProps {
  children: React.ReactNode;
  onCanvasRef?: (ref: React.RefObject<HTMLCanvasElement>) => void;
}

const Canvas3D: React.FC<Canvas3DProps> = ({ children, onCanvasRef }) => {
  const { zoom } = useAppState()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Pass the ref up to parent if needed
  React.useEffect(() => {
    if (onCanvasRef && canvasRef.current) {
      onCanvasRef(canvasRef)
    }
  }, [onCanvasRef, canvasRef])
  
  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, zoom], fov: 60 }}
      shadows={false}
      style={{ 
        background: 'black',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        outline: 'none',
        touchAction: 'none'
      }}
    >
      <Suspense fallback={<Loader />}>
        {/* Basic scene elements */}
        <ambientLight intensity={0.2} />
        <Stars radius={100} depth={50} count={5000} factor={2.5} />
        <Environment preset="night" />
        
        {/* Render children (planets, controls, etc.) */}
        {children}
      </Suspense>
    </Canvas>
  )
}

export default Canvas3D 