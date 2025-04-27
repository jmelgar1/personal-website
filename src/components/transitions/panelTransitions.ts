import { Camera } from 'three'
import { MutableRefObject } from 'react'
import * as THREE from 'three'

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

// Panel-specific constants
const PANEL_FOCUS_DISTANCE = 2.8; // How close to zoom in to the panel
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