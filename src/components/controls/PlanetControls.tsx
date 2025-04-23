import React, { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { planetTransition } from '../utils/transitions'
import type { Mesh } from 'three'

export interface PlanetControlsProps {
  zoom: number;
  target: [number, number, number];
  activeTab: string;
  moonPosition: [number, number, number];
}

const PlanetControls: React.FC<PlanetControlsProps> = ({ zoom, target, activeTab, moonPosition }) => {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const isUserInteractingRef = useRef(false)
  const lastTabChangeRef = useRef(activeTab)
  const animationFrameRef = useRef<number | null>(null)
  
  // Track when user is manually controlling the camera
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current
      
      const handleStart = () => {
        isUserInteractingRef.current = true
      }
      
      const handleEnd = () => {
        isUserInteractingRef.current = false
      }
      
      controls.addEventListener('start', handleStart)
      controls.addEventListener('end', handleEnd)
      
      return () => {
        controls.removeEventListener('start', handleStart)
        controls.removeEventListener('end', handleEnd)
      }
    }
  }, [controlsRef.current])
  
  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
  
  // Track tab changes to reset camera targeting and start transition
  useEffect(() => {
    if (activeTab !== lastTabChangeRef.current) {
      // Cancel any existing animation
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      const prevTab = lastTabChangeRef.current
      lastTabChangeRef.current = activeTab
      isUserInteractingRef.current = false
      
      // Start a smooth transition between planets
      planetTransition({
        camera,
        controls: controlsRef.current,
        fromTab: prevTab,
        toTab: activeTab,
        moonPosition,
        target,
        zoom,
        isUserInteractingRef,
        animationFrameRef
      })
    }
  }, [activeTab, camera, moonPosition, target, zoom])
  
  // Use frame to continuously update target when following the moon (but only when not transitioning)
  useFrame(() => {
    if (controlsRef.current && 
        activeTab === 'Experience' && 
        !isUserInteractingRef.current && 
        animationFrameRef.current === null) {
      controlsRef.current.target.set(...moonPosition)
    }
  })
  
  // Handle zoom changes separately
  useEffect(() => {
    if (controlsRef.current && animationFrameRef.current === null) {
      // Don't adjust zoom during transitions or if user is manually controlling
      if (!isUserInteractingRef.current) {
        // Force the orbit controls to use the new zoom distance
        const effectiveTarget = activeTab === 'Experience' ? moonPosition : target
        
        // Calculate direction vector from target to camera
        const dirX = camera.position.x - effectiveTarget[0]
        const dirY = camera.position.y - effectiveTarget[1]
        const dirZ = camera.position.z - effectiveTarget[2]
        
        // Get the length of this vector
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ)
        
        if (length > 0) {
          // Normalize the direction vector
          const normX = dirX / length
          const normY = dirY / length
          const normZ = dirZ / length
          
          // Set camera position at the desired distance from target
          camera.position.set(
            effectiveTarget[0] + normX * zoom,
            effectiveTarget[1] + normY * zoom,
            effectiveTarget[2] + normZ * zoom
          )
          
          // Update controls
          controlsRef.current.update()
        }
      }
    }
  }, [zoom, camera, activeTab, moonPosition, target, animationFrameRef.current])

  return React.createElement(OrbitControls, { 
    ref: controlsRef,
    enableZoom: true, 
    enablePan: true,
    enableRotate: true,
    zoomSpeed: 0.6,
    rotateSpeed: 0.8,
    minDistance: 2,
    maxDistance: 20,
    dampingFactor: 0.1,
    autoRotate: false,
    makeDefault: true
  })
}

export default PlanetControls 