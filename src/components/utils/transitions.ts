import { Camera } from 'three'
import { MutableRefObject } from 'react'
import * as THREE from 'three'

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

interface PanelTransitionParams {
  camera: Camera;
  controls: any;
  panelPosition: THREE.Vector3;
  panelNormal: THREE.Vector3;
  isEntering: boolean; // true when hovering, false when leaving
  previousTarget?: THREE.Vector3; // target to return to when leaving
  previousPosition?: THREE.Vector3; // camera position to return to when leaving
  isUserInteractingRef: MutableRefObject<boolean>;
  animationFrameRef: MutableRefObject<number | null>;
  panelAnimationRef: MutableRefObject<number | null>;
  setPanelFocused: (focused: boolean) => void;
}

// We'll keep these as reference but won't force them on the user
const PLANET_OPTIMAL_ZOOM = {
  'About Me': 3, // Earth
  'Experience': 2, // Moon (closer view)
  'Projects': 4 // Mars (further away)
}

// Panel-specific constants
const PANEL_FOCUS_DISTANCE = 2.8; // How close to zoom in to the panel (increased from 1.5)
const PANEL_TRANSITION_DURATION = 800; // ms

export const panelTransition = ({
  camera,
  controls,
  panelPosition,
  panelNormal,
  isEntering,
  previousTarget,
  previousPosition,
  isUserInteractingRef,
  animationFrameRef,
  panelAnimationRef,
  setPanelFocused
}: PanelTransitionParams) => {
  // Cancel any existing animations
  if (animationFrameRef.current !== null) {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }
  
  if (panelAnimationRef.current !== null) {
    cancelAnimationFrame(panelAnimationRef.current);
    panelAnimationRef.current = null;
  }
  
  // If user is interacting, don't start a new animation
  if (isUserInteractingRef.current) {
    return;
  }
  
  // Get current camera and control states
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  
  // Determine end position and target
  let endPosition: THREE.Vector3;
  let endTarget: THREE.Vector3;
  
  if (isEntering) {
    // When hovering over panel - focus on it
    endTarget = panelPosition.clone();
    
    // Position camera in front of the panel based on its normal vector
    // The normal points outward from the panel surface
    endPosition = panelPosition.clone().add(
      panelNormal.clone().multiplyScalar(PANEL_FOCUS_DISTANCE)
    );
    
    console.log('Transitioning to panel focus');
    setPanelFocused(true);
  } else {
    // When leaving panel - return to previous view if available
    // This should be a smooth transition, not an instant jump
    if (!previousTarget || !previousPosition) {
      console.warn('No previous camera position available for exiting panel focus');
      setPanelFocused(false);
      return;
    }
    
    endTarget = previousTarget.clone();
    endPosition = previousPosition.clone();
    
    console.log('Transitioning from panel focus back to previous view');
    // We'll set panelFocused to false at the end of the animation
  }
  
  // Set up animation
  const startTime = Date.now();
  // Use longer duration for exiting transitions to make it feel more natural
  const duration = isEntering ? PANEL_TRANSITION_DURATION : PANEL_TRANSITION_DURATION * 1.5;
  
  const animateTransition = () => {
    // If user starts interacting, cancel animation
    if (isUserInteractingRef.current) {
      console.log('Panel transition interrupted by user interaction');
      panelAnimationRef.current = null;
      if (!isEntering) setPanelFocused(false);
      return;
    }
    
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease in-out function for smoother movement
    const easeProgress = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    // Interpolate camera position
    const newPositionX = startPosition.x + (endPosition.x - startPosition.x) * easeProgress;
    const newPositionY = startPosition.y + (endPosition.y - startPosition.y) * easeProgress;
    const newPositionZ = startPosition.z + (endPosition.z - startPosition.z) * easeProgress;
    camera.position.set(newPositionX, newPositionY, newPositionZ);
    
    // Interpolate target
    const newTargetX = startTarget.x + (endTarget.x - startTarget.x) * easeProgress;
    const newTargetY = startTarget.y + (endTarget.y - startTarget.y) * easeProgress;
    const newTargetZ = startTarget.z + (endTarget.z - startTarget.z) * easeProgress;
    controls.target.set(newTargetX, newTargetY, newTargetZ);
    
    // Update controls
    controls.update();
    
    if (progress < 1) {
      // Continue animation
      panelAnimationRef.current = requestAnimationFrame(animateTransition);
    } else {
      // Animation complete
      camera.position.copy(endPosition);
      controls.target.copy(endTarget);
      controls.update();
      
      // Only now set panelFocused to false if we're exiting
      if (!isEntering) {
        setPanelFocused(false);
      }
      
      console.log(`Panel transition complete: ${isEntering ? 'entered panel focus' : 'exited panel focus'}`);
      panelAnimationRef.current = null;
    }
  };
  
  // Start animation
  panelAnimationRef.current = requestAnimationFrame(animateTransition);
};

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