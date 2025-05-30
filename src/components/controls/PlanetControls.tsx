import React, { useEffect, useRef, useContext, forwardRef, useImperativeHandle, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { planetTransition } from '../transitions/planetTransitions'
import { panelTransition } from '../transitions/panelTransitions'
import { PlanetPositionContext } from '../../contexts/PlanetPositionContext'
import * as THREE from 'three'

export interface PlanetControlsProps {
  zoom: number;
  target: [number, number, number];
  activeTab: string;
  moonPosition: [number, number, number];
  setZoom?: (zoom: number) => void;
  onFocusChange?: (isFocused: boolean) => void;
  isPanelFocused?: boolean;
  focusedPanelPosition?: THREE.Vector3 | null;
  focusedPanelNormal?: THREE.Vector3 | null;
  previousCameraPosition?: THREE.Vector3 | null;
  previousCameraTarget?: THREE.Vector3 | null;
  panelAnimationRef?: React.MutableRefObject<number | null>;
  setIsPanelFocused?: (focused: boolean) => void;
  isUserInteractingRef?: React.MutableRefObject<boolean>;
  animationFrameRef?: React.MutableRefObject<number | null>;
}

const PlanetControls = forwardRef<any, PlanetControlsProps>(({ 
  zoom, 
  target, 
  activeTab,
  setZoom,
  onFocusChange,
  isPanelFocused,
  focusedPanelPosition,
  focusedPanelNormal,
  previousCameraPosition,
  previousCameraTarget,
  panelAnimationRef,
  setIsPanelFocused,
  isUserInteractingRef: externalUserInteractingRef,
  animationFrameRef: externalAnimationFrameRef
}, ref) => {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const internalUserInteractingRef = useRef(false)
  const lastTabChangeRef = useRef(activeTab)
  const internalAnimationFrameRef = useRef<number | null>(null)
  const isFocusedRef = useRef(true)
  const dragDistanceRef = useRef(0)
  const lastTargetRef = useRef<[number, number, number]>([0, 0, 0])
  const snapBackAnimationRef = useRef<number | null>(null)
  const planetPositions = useContext(PlanetPositionContext)
  
  // Keyboard controls state
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({})
  const cameraSpeed = useRef(0.15) // Base movement speed
  const speedModifier = useRef(2.5) // Speed multiplier when holding Control key
  
  // Use either external or internal refs
  const isUserInteractingRef = externalUserInteractingRef || internalUserInteractingRef
  const animationFrameRef = externalAnimationFrameRef || internalAnimationFrameRef
  
  // Forward ref to the controls
  useImperativeHandle(ref, () => controlsRef.current);
  
  // Constants for unfocusing behavior - increased threshold for more intentional unfocusing
  const UNFOCUS_DISTANCE_THRESHOLD = 10 // Requires more dragging to unfocus
  const SNAP_BACK_THRESHOLD = 5 // Below this we snap back to the planet
  const SNAP_BACK_SPEED = 0.1 // How quickly to snap back (0-1)
  
  // Get current focus target based on active tab
  const getCurrentFocusTarget = (): [number, number, number] => {
    if (activeTab === 'Experience') {
      return planetPositions.moonPosition
    } else if (activeTab === 'Projects') {
      return planetPositions.marsPosition
    } else {
      return planetPositions.earthPosition
    }
  }
  
  // Handle keyboard input for camera movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process keys we're interested in
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', ' ', 'shift', 'control'].includes(key)) {
        // Prevent default behaviors (e.g., scrolling with space)
        e.preventDefault()
        // Update keys state
        setKeysPressed(prev => ({ ...prev, [key]: true }))
        
        // Mark that user is interacting with controls
        isUserInteractingRef.current = true
        
        // Auto-unfocus from planet when using keyboard movement
        if (isFocusedRef.current && ['w', 'a', 's', 'd', ' ', 'shift'].includes(key)) {
          isFocusedRef.current = false
          if (onFocusChange) {
            onFocusChange(false)
          }
          console.log('Unfocused from planet due to keyboard movement')
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', ' ', 'shift', 'control'].includes(key)) {
        setKeysPressed(prev => {
          const newState = { ...prev }
          delete newState[key]
          return newState
        })
        
        // Check if any movement keys are still pressed
        const anyMovementKeyStillPressed = ['w', 'a', 's', 'd', ' ', 'shift'].some(
          k => keysPressed[k] && k !== key
        )
        
        // If no movement keys are pressed, stop marking as interacting
        if (!anyMovementKeyStillPressed) {
          isUserInteractingRef.current = false
        }
      }
    }
    
    // Ensure keyboard events don't get stuck when window loses focus
    const handleBlur = () => {
      setKeysPressed({})
      isUserInteractingRef.current = false
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [keysPressed, onFocusChange])
  
  // Process camera movement based on keys pressed (in animation frame)
  useFrame(() => {
    if (controlsRef.current && Object.keys(keysPressed).length > 0) {
      const controls = controlsRef.current
      
      // Check if any movement keys are pressed
      const isMoving = ['w', 'a', 's', 'd', ' ', 'shift'].some(key => keysPressed[key])
      
      if (isMoving) {
        // Calculate movement speed (faster when holding Control)
        const speed = cameraSpeed.current * (keysPressed['control'] ? speedModifier.current : 1)
        
        // Get camera's forward, right, and up vectors for movement relative to camera orientation
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize()
        const up = new THREE.Vector3(0, 1, 0) // World up vector for simplicity
        
        // Create movement vector
        const movementVector = new THREE.Vector3(0, 0, 0)
        
        // Forward/backward
        if (keysPressed['w']) movementVector.add(forward.clone().multiplyScalar(speed))
        if (keysPressed['s']) movementVector.add(forward.clone().multiplyScalar(-speed))
        
        // Left/right
        if (keysPressed['a']) movementVector.add(right.clone().multiplyScalar(-speed))
        if (keysPressed['d']) movementVector.add(right.clone().multiplyScalar(speed))
        
        // Up/down
        if (keysPressed[' ']) movementVector.add(up.clone().multiplyScalar(speed)) // Space = up
        if (keysPressed['shift']) movementVector.add(up.clone().multiplyScalar(-speed)) // Shift = down
        
        // Apply movement to both camera and target
        camera.position.add(movementVector)
        controls.target.add(movementVector)
        
        // Update controls
        controls.update()
      }
    }
  })
  
  // Handle panel focus changes
  useEffect(() => {
    if (!focusedPanelPosition || !focusedPanelNormal || !panelAnimationRef || !setIsPanelFocused) {
      return;
    }
    
    // Check for stored previous camera positions first
    const storedPreviousPosition = (controlsRef.current && controlsRef.current._previousCameraPosition) || null;
    const storedPreviousTarget = (controlsRef.current && controlsRef.current._previousCameraTarget) || null;
    
    // Use stored positions if available, otherwise fall back to provided props
    const effectivePreviousPosition = storedPreviousPosition || previousCameraPosition;
    const effectivePreviousTarget = storedPreviousTarget || previousCameraTarget;
    
    if (isPanelFocused) {
      // Start panel transition when focusing
      panelTransition({
        camera,
        controls: controlsRef.current,
        panelPosition: focusedPanelPosition,
        panelNormal: focusedPanelNormal,
        isEntering: true,
        previousTarget: effectivePreviousTarget || undefined,
        previousPosition: effectivePreviousPosition || undefined,
        isUserInteractingRef,
        animationFrameRef,
        panelAnimationRef,
        setPanelFocused: setIsPanelFocused
      });
    } else if (effectivePreviousPosition && effectivePreviousTarget) {
      // When leaving panel focus, transition back to previous position
      panelTransition({
        camera,
        controls: controlsRef.current,
        panelPosition: focusedPanelPosition,
        panelNormal: focusedPanelNormal,
        isEntering: false,
        previousTarget: effectivePreviousTarget,
        previousPosition: effectivePreviousPosition,
        isUserInteractingRef,
        animationFrameRef,
        panelAnimationRef,
        setPanelFocused: setIsPanelFocused
      });
      
      // Clear stored positions after using them
      if (controlsRef.current) {
        controlsRef.current._previousCameraPosition = null;
        controlsRef.current._previousCameraTarget = null;
      }
    }
  }, [isPanelFocused, focusedPanelPosition, focusedPanelNormal, previousCameraPosition, previousCameraTarget]);
  
  // Track when user is manually controlling the camera
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current
      
      const handleStart = () => {
        isUserInteractingRef.current = true
        dragDistanceRef.current = 0
        
        // If there's a snap-back animation in progress, cancel it
        if (snapBackAnimationRef.current !== null) {
          cancelAnimationFrame(snapBackAnimationRef.current)
          snapBackAnimationRef.current = null
        }
      }
      
      const handleEnd = () => {
        isUserInteractingRef.current = false
        
        // When user stops interacting, check if we should snap back or stay unfocused
        if (isFocusedRef.current && dragDistanceRef.current < UNFOCUS_DISTANCE_THRESHOLD) {
          // Small drag - start snap back animation
          startSnapBackAnimation()
        } else if (dragDistanceRef.current >= UNFOCUS_DISTANCE_THRESHOLD) {
          // Large drag - officially unfocus
          isFocusedRef.current = false
          if (onFocusChange) {
            onFocusChange(false)
          }
          console.log('Unfocused from planet due to intentional camera pull')
        }
        
        // Reset drag distance for next interaction
        dragDistanceRef.current = 0
      }
      
      const handleChange = () => {
        if (isUserInteractingRef.current && isFocusedRef.current) {
          const focusTarget = getCurrentFocusTarget()
          
          if (controls.target) {
            // Calculate how far we've dragged from the expected focus target
            const dx = controls.target.x - focusTarget[0]
            const dy = controls.target.y - focusTarget[1]
            const dz = controls.target.z - focusTarget[2]
            
            // Raw distance from focus target
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz)
            
            // Update cumulative drag distance (with scaling to make it feel right)
            // The squared term makes it harder to unfocus at first, but easier as you pull further
            dragDistanceRef.current += distance * distance * 0.05
            
            // Store last target position for smooth animations
            lastTargetRef.current = [
              controls.target.x,
              controls.target.y,
              controls.target.z
            ]
            
            // Visual feedback based on how close to unfocusing
            if (dragDistanceRef.current > SNAP_BACK_THRESHOLD) {
              const progress = Math.min(1, (dragDistanceRef.current - SNAP_BACK_THRESHOLD) / 
                                      (UNFOCUS_DISTANCE_THRESHOLD - SNAP_BACK_THRESHOLD))
            }
          }
        }
      }
      
      controls.addEventListener('start', handleStart)
      controls.addEventListener('end', handleEnd)
      controls.addEventListener('change', handleChange)
      
      return () => {
        controls.removeEventListener('start', handleStart)
        controls.removeEventListener('end', handleEnd)
        controls.removeEventListener('change', handleChange)
      }
    }
  }, [controlsRef.current, activeTab, planetPositions, onFocusChange])
  
  // Animation to snap back to the planet when user releases with small drag
  const startSnapBackAnimation = () => {
    if (!controlsRef.current) return;
    
    const focusTarget = getCurrentFocusTarget();
    const controls = controlsRef.current;
    const startTarget = [...lastTargetRef.current];
    
    const animateSnapBack = () => {
      // If user starts interacting again, cancel this animation
      if (isUserInteractingRef.current) {
        snapBackAnimationRef.current = null;
        return;
      }
      
      // Calculate new interpolated position
      const newX = startTarget[0] + (focusTarget[0] - startTarget[0]) * SNAP_BACK_SPEED;
      const newY = startTarget[1] + (focusTarget[1] - startTarget[1]) * SNAP_BACK_SPEED;
      const newZ = startTarget[2] + (focusTarget[2] - startTarget[2]) * SNAP_BACK_SPEED;
      
      // Update current target
      controls.target.set(newX, newY, newZ);
      controls.update();
      
      // Update start position for next frame
      startTarget[0] = newX;
      startTarget[1] = newY;
      startTarget[2] = newZ;
      
      // Check if we're close enough to the target to stop animating
      const remainingDistance = Math.sqrt(
        Math.pow(newX - focusTarget[0], 2) +
        Math.pow(newY - focusTarget[1], 2) +
        Math.pow(newZ - focusTarget[2], 2)
      );
      
      if (remainingDistance < 0.01) {
        // We've reached the target, stop animating
        controls.target.set(...focusTarget);
        controls.update();
        snapBackAnimationRef.current = null;
      } else {
        // Continue animation
        snapBackAnimationRef.current = requestAnimationFrame(animateSnapBack);
      }
    };
    
    // Start animation
    snapBackAnimationRef.current = requestAnimationFrame(animateSnapBack);
  };
  
  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (snapBackAnimationRef.current !== null) {
        cancelAnimationFrame(snapBackAnimationRef.current)
      }
      if (panelAnimationRef && panelAnimationRef.current !== null) {
        cancelAnimationFrame(panelAnimationRef.current)
      }
    }
  }, [])
  
  // Track tab changes to reset camera targeting and start transition
  useEffect(() => {
    if (activeTab !== lastTabChangeRef.current) {
      // Cancel any existing animations
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (snapBackAnimationRef.current !== null) {
        cancelAnimationFrame(snapBackAnimationRef.current)
      }
      if (panelAnimationRef && panelAnimationRef.current !== null) {
        cancelAnimationFrame(panelAnimationRef.current)
      }
      
      const prevTab = lastTabChangeRef.current
      lastTabChangeRef.current = activeTab
      isUserInteractingRef.current = false
      
      // Reset focused state when tab is changed
      isFocusedRef.current = true
      dragDistanceRef.current = 0
      
      // Notify that we're now focused
      if (onFocusChange) {
        onFocusChange(true)
      }
      
      // Start a smooth transition between planets
      planetTransition({
        camera,
        controls: controlsRef.current,
        fromTab: prevTab,
        toTab: activeTab,
        moonPosition: planetPositions.moonPosition,
        earthPosition: planetPositions.earthPosition,
        marsPosition: planetPositions.marsPosition,
        target,
        zoom,
        isUserInteractingRef,
        animationFrameRef,
        setZoom
      })
    }
  }, [activeTab, camera, planetPositions, target, zoom, setZoom, onFocusChange])
  
  // Use frame to continuously update target when following the moon (but only when not transitioning)
  useFrame(() => {
    if (controlsRef.current && 
        activeTab === 'Experience' && 
        !isUserInteractingRef.current && 
        animationFrameRef.current === null &&
        snapBackAnimationRef.current === null &&
        (!panelAnimationRef || panelAnimationRef.current === null) &&
        isFocusedRef.current && 
        !isPanelFocused) {
      controlsRef.current.target.set(...planetPositions.moonPosition)
    }
  })
  
  // Handle zoom changes separately
  useEffect(() => {
    if (controlsRef.current && 
        animationFrameRef.current === null && 
        snapBackAnimationRef.current === null &&
        (!panelAnimationRef || panelAnimationRef.current === null) &&
        !isUserInteractingRef.current && 
        isFocusedRef.current && 
        !isPanelFocused) {
      // Force the orbit controls to use the new zoom distance
      const effectiveTarget = activeTab === 'Experience' 
        ? planetPositions.moonPosition 
        : activeTab === 'Projects'
          ? planetPositions.marsPosition
          : planetPositions.earthPosition;
      
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
  }, [zoom, camera, activeTab, planetPositions, target, animationFrameRef.current, isPanelFocused])

  // For double-click focusing behavior
  const handleDoubleClick = (e: any) => {
    // Toggle focus state
    isFocusedRef.current = !isFocusedRef.current
    
    if (isFocusedRef.current) {
      // Refocus on the current planet
      const focusTarget = getCurrentFocusTarget()
      
      // Only update the controls target, not the camera position
      if (controlsRef.current) {
        controlsRef.current.target.set(...focusTarget)
      }
      
      console.log('Refocused on planet')
    }
    
    // Notify about focus change
    if (onFocusChange) {
      onFocusChange(isFocusedRef.current)
    }
  }

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
    makeDefault: true,
    onDoubleClick: handleDoubleClick
  })
})

export default PlanetControls 