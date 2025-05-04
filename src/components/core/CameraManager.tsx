import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useAppState } from '../../contexts/AppStateContext'
import * as THREE from 'three'

// Camera info collector component - extracts camera information and updates the context
const CameraManager: React.FC = () => {
  const { camera, controls } = useThree()
  const { 
    setCameraInfo, 
    focusedPanel, 
    setCameraTarget,
    activeTab
  } = useAppState()
  
  // Reference to track camera transition
  const targetPosition = useRef<THREE.Vector3 | null>(null)
  const transitionSpeed = 0.05 // Speed of camera transition
  
  // Keep track of original quaternion when starting to focus
  const originalQuaternion = useRef<THREE.Quaternion | null>(null)
  const targetQuaternion = useRef<THREE.Quaternion | null>(null)
  
  // Track tab changes to prevent immediate control takeover
  const previousTabRef = useRef(activeTab)
  const tabChangeTimerRef = useRef<number | null>(null)
  const isTransitioningRef = useRef(false)
  
  // Handle tab changes
  useEffect(() => {
    // If tab changed
    if (previousTabRef.current !== activeTab) {
      isTransitioningRef.current = true
      
      // Clear any existing timer
      if (tabChangeTimerRef.current !== null) {
        window.clearTimeout(tabChangeTimerRef.current)
      }
      
      // Set a timer to end transition period
      tabChangeTimerRef.current = window.setTimeout(() => {
        isTransitioningRef.current = false
        tabChangeTimerRef.current = null
      }, 1500) // 1.5 second transition period
      
      // Update previous tab reference
      previousTabRef.current = activeTab
      
      // Reset target position
      targetPosition.current = null
      originalQuaternion.current = null
      targetQuaternion.current = null
    }
    
    return () => {
      // Clean up timer on unmount
      if (tabChangeTimerRef.current !== null) {
        window.clearTimeout(tabChangeTimerRef.current)
      }
    }
  }, [activeTab])
  
  useFrame(() => {
    // Get camera position
    const position = camera.position.toArray() as [number, number, number]
    
    // Get camera target from controls if available
    let target: [number, number, number] = [0, 0, 0]
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
    
    // Send info to context
    setCameraInfo({
      position,
      target,
      distance
    })
    
    // Disable controls during tab transitions
    if (controls && 'enabled' in controls) {
      // @ts-ignore
      controls.enabled = !isTransitioningRef.current
    }
    
    // Handle focused panel - position camera in front of the panel
    if (focusedPanel.isActive && focusedPanel.position && focusedPanel.normal && controls && 'target' in controls) {
      // Set the controls target to the panel position
      // @ts-ignore
      controls.target.copy(focusedPanel.position)
      
      // Store original camera quaternion on first frame of focusing
      if (!originalQuaternion.current) {
        originalQuaternion.current = camera.quaternion.clone()
      }
      
      // Calculate ideal camera position in front of panel
      // Use the panel's normal vector to determine "front" direction
      // If normal is not available or zero, use a default direction
      const frontDirection = focusedPanel.normal.clone().normalize()
      if (frontDirection.lengthSq() === 0) {
        frontDirection.set(0, 0, 1)
      }
      
      // Position camera at a fixed distance in front of panel
      const fixedDistance = 4 // Distance from panel to camera
      const idealPosition = focusedPanel.position.clone().add(
        frontDirection.multiplyScalar(fixedDistance)
      )
      
      // Calculate target quaternion (orientation) that would make camera look at panel
      // but only do this once at the start of focus to avoid continuous recalculation
      if (!targetQuaternion.current) {
        const lookAtMatrix = new THREE.Matrix4()
        const upVector = new THREE.Vector3(0, 1, 0) // Use world up as reference
        
        lookAtMatrix.lookAt(
          idealPosition,
          focusedPanel.position,
          upVector
        )
        
        targetQuaternion.current = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix)
      }
      
      // Set target position for smooth transition
      if (!targetPosition.current) {
        targetPosition.current = idealPosition.clone()
      } else {
        targetPosition.current.lerp(idealPosition, 0.1) // Smooth transition to new position
      }
      
      // Move camera smoothly to target position
      camera.position.lerp(targetPosition.current, transitionSpeed)
      
      // Smoothly interpolate camera quaternion to target quaternion
      if (targetQuaternion.current) {
        camera.quaternion.slerp(targetQuaternion.current, transitionSpeed * 0.8)
      }
      
      // Update camera target in app state
      setCameraTarget([
        focusedPanel.position.x,
        focusedPanel.position.y,
        focusedPanel.position.z
      ])
    } else {
      // Reset target position when not focused
      targetPosition.current = null
      originalQuaternion.current = null
      targetQuaternion.current = null
    }
  })
  
  // This component doesn't render anything
  return null
}

export default CameraManager 