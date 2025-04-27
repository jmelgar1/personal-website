import { Camera } from 'three'
import { MutableRefObject } from 'react'

interface PlanetTransitionParams {
  camera: Camera;
  controls: any;
  fromTab: string;
  toTab: string;
  moonPosition: [number, number, number];
  earthPosition: [number, number, number];
  marsPosition: [number, number, number];
  target: [number, number, number];
  zoom: number;
  isUserInteractingRef: MutableRefObject<boolean>;
  animationFrameRef: MutableRefObject<number | null>;
  setZoom?: (zoom: number) => void;
}

// We'll keep these as reference but won't force them on the user
const PLANET_OPTIMAL_ZOOM = {
  'About Me': 3, // Earth
  'Experience': 2, // Moon (closer view)
  'Projects': 4 // Mars (further away)
}

export const planetTransition = ({
  camera,
  controls,
  fromTab,
  toTab,
  moonPosition,
  earthPosition,
  marsPosition,
  target,
  zoom,
  isUserInteractingRef,
  animationFrameRef,
  setZoom
}: PlanetTransitionParams) => {
  // Get current camera position and target
  const startPosition = [...camera.position.toArray()]
  const startTarget = controls ? [...controls.target.toArray()] : [0, 0, 0]
  
  // Determine end target based on destination tab
  let endTarget: [number, number, number]
  switch(toTab) {
    case 'About Me':
      endTarget = [...earthPosition] // Earth from context
      break
    case 'Experience':
      endTarget = [...moonPosition] // Moon's position from context
      break
    case 'Projects':
      endTarget = [...marsPosition] // Mars from context
      break
    default:
      endTarget = [...earthPosition]
  }
  
  // Use current zoom level - don't change it
  const currentZoom = zoom;
  
  console.log(`Transition: ${fromTab} → ${toTab}`)
  console.log(`Maintaining current zoom: ${currentZoom.toFixed(4)}`)
  
  // Calculate current distance from camera to target
  const startDist = Math.sqrt(
    Math.pow(startPosition[0] - startTarget[0], 2) +
    Math.pow(startPosition[1] - startTarget[1], 2) +
    Math.pow(startPosition[2] - startTarget[2], 2)
  )
  
  console.log(`Current camera distance: ${startDist.toFixed(4)}`)
  
  // Calculate transition path using current zoom
  
  // End position based on new target with same relative offset/zoom
  // These calculations maintain the same relative viewing angle and distance
  let endPosition: [number, number, number]
  
  // Calculate a vector from target to camera
  const dirX = (startPosition[0] - startTarget[0]) / startDist
  const dirY = (startPosition[1] - startTarget[1]) / startDist
  const dirZ = (startPosition[2] - startTarget[2]) / startDist
  
  // Set end position using the same distance and similar angle
  endPosition = [
    endTarget[0] + dirX * currentZoom,
    endTarget[1] + dirY * currentZoom, 
    endTarget[2] + dirZ * currentZoom
  ]
  
  // For a more natural arc, calculate a mid-point that's higher than direct path
  const midPoint: [number, number, number] = [
    (startPosition[0] + endPosition[0]) / 2,
    Math.max(startPosition[1], endPosition[1]) + currentZoom * 0.75, // Higher arc
    (startPosition[2] + endPosition[2]) / 2
  ]
  
  const startTime = Date.now()
  const duration = 2000 // Longer, smoother transition (2 seconds)
  
  const animateTransition = () => {
    if (isUserInteractingRef.current) {
      // User took control, stop animation
      console.log('Transition interrupted by user interaction')
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
      
      // Log final distance for verification
      const finalDistance = Math.sqrt(
        Math.pow(camera.position.x - endTarget[0], 2) +
        Math.pow(camera.position.y - endTarget[1], 2) +
        Math.pow(camera.position.z - endTarget[2], 2)
      )
      
      console.log('Animation complete, final camera distance:', finalDistance.toFixed(4))
      
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