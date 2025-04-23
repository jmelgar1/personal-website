import { Camera, Object3D } from 'three'
import { MutableRefObject } from 'react'

interface PlanetTransitionParams {
  camera: Camera;
  controls: any;
  fromTab: string;
  toTab: string;
  moonPosition: [number, number, number];
  target: [number, number, number];
  zoom: number;
  isUserInteractingRef: MutableRefObject<boolean>;
  animationFrameRef: MutableRefObject<number | null>;
}

export const planetTransition = ({
  camera,
  controls,
  fromTab,
  toTab,
  moonPosition,
  target,
  zoom,
  isUserInteractingRef,
  animationFrameRef
}: PlanetTransitionParams) => {
  // Get current camera position and target
  const startPosition = [...camera.position.toArray()]
  const startTarget = controls ? [...controls.target.toArray()] : [0, 0, 0]
  
  // Determine end target based on destination tab
  let endTarget: [number, number, number]
  switch(toTab) {
    case 'About Me':
      endTarget = [0, 0, 0] // Earth
      break
    case 'Experience':
      endTarget = [...moonPosition] // Moon's current position
      break
    case 'Projects':
      endTarget = [0, 0, 13] // Mars
      break
    default:
      endTarget = [0, 0, 0]
  }
  
  // Calculate transition path
  const cameraDistance = zoom
  
  // End position based on target with proper offset
  let endPosition: [number, number, number]
  switch(toTab) {
    case 'About Me':
      endPosition = [endTarget[0] + cameraDistance, endTarget[1] + cameraDistance/2, endTarget[2] + cameraDistance]
      break
    case 'Experience':
      endPosition = [
        endTarget[0] + cameraDistance/1.5, 
        endTarget[1] + cameraDistance/2, 
        endTarget[2] + cameraDistance/1.5
      ]
      break
    case 'Projects':
      endPosition = [endTarget[0] - cameraDistance, endTarget[1] + cameraDistance/2, endTarget[2] + cameraDistance]
      break
    default:
      endPosition = [endTarget[0] + cameraDistance, endTarget[1] + cameraDistance/2, endTarget[2] + cameraDistance]
  }
  
  // For a more natural arc, calculate a mid-point that's higher than direct path
  const midPoint: [number, number, number] = [
    (startPosition[0] + endPosition[0]) / 2,
    Math.max(startPosition[1], endPosition[1]) + cameraDistance * 0.75, // Higher arc
    (startPosition[2] + endPosition[2]) / 2
  ]
  
  const startTime = Date.now()
  const duration = 2000 // Longer, smoother transition (2 seconds)
  
  const animateTransition = () => {
    if (isUserInteractingRef.current) {
      // User took control, stop animation
      animationFrameRef.current = null
      return
    }
    
    const now = Date.now()
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Ease in-out function for smoother movement
    const easeProgress = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    
    // For target, move directly from start to end
    if (controls) {
      // Interpolate between start and end targets
      const newTargetX = startTarget[0] + (endTarget[0] - startTarget[0]) * easeProgress
      const newTargetY = startTarget[1] + (endTarget[1] - startTarget[1]) * easeProgress
      const newTargetZ = startTarget[2] + (endTarget[2] - startTarget[2]) * easeProgress
      
      controls.target.set(newTargetX, newTargetY, newTargetZ)
    }
    
    // For position, use quadratic Bezier curve for arc motion
    if (progress < 1) {
      // Quadratic Bezier curve through midPoint for camera position
      // First interpolation: start to mid
      const t1x = startPosition[0] + (midPoint[0] - startPosition[0]) * easeProgress * 2
      const t1y = startPosition[1] + (midPoint[1] - startPosition[1]) * easeProgress * 2
      const t1z = startPosition[2] + (midPoint[2] - startPosition[2]) * easeProgress * 2
      
      // Second interpolation: mid to end
      const t2x = midPoint[0] + (endPosition[0] - midPoint[0]) * easeProgress * 2
      const t2y = midPoint[1] + (endPosition[1] - midPoint[1]) * easeProgress * 2
      const t2z = midPoint[2] + (endPosition[2] - midPoint[2]) * easeProgress * 2
      
      // Final interpolation between the two
      let finalX, finalY, finalZ
      
      if (easeProgress < 0.5) {
        // First half of animation - use t1 values
        const adjustedProgress = easeProgress * 2 // Scale 0-0.5 to 0-1
        finalX = startPosition[0] + (t1x - startPosition[0]) * adjustedProgress
        finalY = startPosition[1] + (t1y - startPosition[1]) * adjustedProgress
        finalZ = startPosition[2] + (t1z - startPosition[2]) * adjustedProgress
      } else {
        // Second half of animation - use t2 values
        const adjustedProgress = (easeProgress - 0.5) * 2 // Scale 0.5-1 to 0-1
        finalX = midPoint[0] + (endPosition[0] - midPoint[0]) * adjustedProgress
        finalY = midPoint[1] + (endPosition[1] - midPoint[1]) * adjustedProgress
        finalZ = midPoint[2] + (endPosition[2] - midPoint[2]) * adjustedProgress
      }
      
      camera.position.set(finalX, finalY, finalZ)
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animateTransition)
    } else {
      // Animation complete
      camera.position.set(endPosition[0], endPosition[1], endPosition[2])
      if (controls) {
        controls.target.set(endTarget[0], endTarget[1], endTarget[2])
      }
      animationFrameRef.current = null
    }
    
    // Update controls
    if (controls) {
      controls.update()
    }
  }
  
  // Start animation
  animationFrameRef.current = requestAnimationFrame(animateTransition)
} 