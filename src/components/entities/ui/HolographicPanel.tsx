import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface HolographicPanelProps {
  position: [number, number, number];
  children: React.ReactNode;
}

// Holographic panel common styles and effects
const HolographicPanel: React.FC<HolographicPanelProps> = ({ position, children }) => {
  const groupRef = useRef<THREE.Group>(null)
  const htmlRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [scale, setScale] = useState(0.25)
  const { camera } = useThree()
  
  // Store original camera position and targets for hover transitions
  const originalPositionRef = useRef<THREE.Vector3 | null>(null)
  const originalTargetRef = useRef<THREE.Vector3 | null>(null)
  const transitionInProgressRef = useRef<boolean>(false)
  
  // Add subtle floating animation and handle scale changes
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y += Math.sin(clock.getElapsedTime() * 2) * 0.0005
      // Subtle rotation for holographic effect
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.02
      
      // Smoothly animate scale when hover state changes - make the effect more dramatic
      if (hovered && scale < 0.28) {
        setScale(prev => {
          const newScale = Math.min(0.28, prev + 0.015)
          return newScale
        })
      } else if (!hovered && scale > 0.25) {
        setScale(prev => {
          const newScale = Math.max(0.25, prev - 0.015)
          return newScale
        })
      }
    }
  })
  
  // Handle camera transition when hovering over panel
  useEffect(() => {
    if (!groupRef.current) return;
    
    // When hover state changes, handle camera transition
    if (hovered) {
      // Get controls and check if user is currently interacting
      const controls = (camera as any).userData.controls;
      if (!controls || 
          controls.isUserInteracting || 
          (controls.isTransitioning === true)) {
        return; // Don't transition if controls are being used or a transition is in progress
      }
      
      // Save original camera position and rotation
      if (!originalPositionRef.current) {
        originalPositionRef.current = camera.position.clone();
        originalTargetRef.current = new THREE.Vector3();
        
        // If controls exist, use their target (assuming OrbitControls)
        if (controls && controls.target) {
          originalTargetRef.current.copy(controls.target);
        }
      }
      
      // Calculate new position for camera to face panel
      const panelWorldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(panelWorldPos);
      
      // Start transition
      animateCameraToPanel(panelWorldPos);
    } else if (originalPositionRef.current) {
      // Transition back to original position when hover ends
      animateCameraBackToOriginal();
    }
    
    // Cleanup transition on unmount
    return () => {
      if (transitionInProgressRef.current) {
        transitionInProgressRef.current = false;
      }
    };
  }, [hovered, camera]);
  
  // Animate camera to face panel
  const animateCameraToPanel = (panelPosition: THREE.Vector3) => {
    if (!originalPositionRef.current || transitionInProgressRef.current) return;
    
    transitionInProgressRef.current = true;
    const startPos = camera.position.clone();
    const controls = (camera as any).userData.controls;
    
    if (!controls) {
      transitionInProgressRef.current = false;
      return;
    }
    
    const startTarget = controls.target.clone();
    const planetPos = startTarget.clone(); // The planet the camera is currently targeting
    
    // Calculate direction from planet to panel
    const panelToPlanetDir = new THREE.Vector3().subVectors(panelPosition, planetPos).normalize();
    
    // Calculate a position that's slightly offset from direct panel view
    // This creates a view that shows both panel and planet
    const offsetDistance = 3; // How far to offset from direct view
    const idealTarget = new THREE.Vector3().addVectors(
      planetPos,
      new THREE.Vector3().subVectors(panelPosition, planetPos).multiplyScalar(0.4)
    );
    
    // Calculate ideal camera position - opposite of panel relative to the planet
    const idealPos = new THREE.Vector3().addVectors(
      idealTarget,
      panelToPlanetDir.clone().multiplyScalar(-offsetDistance)
    );
    
    // Limit vertical movement to avoid weird angles
    idealPos.y = Math.min(Math.max(idealPos.y, planetPos.y - 1), planetPos.y + 2);
    
    // Animate
    const duration = 400; // ms - short transition
    const startTime = performance.now();
    
    const animate = () => {
      if (!transitionInProgressRef.current) return;
      
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out function
      const easeProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Interpolate position
      camera.position.lerpVectors(startPos, idealPos, easeProgress);
      
      // Interpolate target
      controls.target.lerpVectors(startTarget, idealTarget, easeProgress);
      
      // Update controls
      controls.update();
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        transitionInProgressRef.current = false;
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  };
  
  // Animate camera back to original position
  const animateCameraBackToOriginal = () => {
    if (!originalPositionRef.current || !originalTargetRef.current || transitionInProgressRef.current) return;
    
    transitionInProgressRef.current = true;
    const startPos = camera.position.clone();
    const controls = (camera as any).userData.controls;
    
    if (!controls) {
      transitionInProgressRef.current = false;
      return;
    }
    
    const startTarget = controls.target.clone();
    const targetPos = originalPositionRef.current;
    const targetTarget = originalTargetRef.current;
    
    // Animate
    const duration = 400; // ms - short transition
    const startTime = performance.now();
    
    const animate = () => {
      if (!transitionInProgressRef.current) return;
      
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease in-out function
      const easeProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Interpolate position
      camera.position.lerpVectors(startPos, targetPos, easeProgress);
      
      // Interpolate target
      controls.target.lerpVectors(startTarget, targetTarget, easeProgress);
      
      // Update controls
      controls.update();
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        transitionInProgressRef.current = false;
        // Clear original refs after returning
        originalPositionRef.current = null;
        originalTargetRef.current = null;
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  };
  
  // Use a direct DOM approach to handle wheel events on the container
  useEffect(() => {
    const htmlElement = htmlRef.current;
    if (!htmlElement) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (htmlRef.current) {
        htmlRef.current.scrollTop += e.deltaY;
        e.preventDefault();
      }
      e.stopPropagation();
    };

    const handleMouseEnter = () => {
      console.log('Mouse entered HTML element');
      setHovered(true);
      document.body.style.cursor = 'auto';
    };

    const handleMouseLeave = () => {
      console.log('Mouse left HTML element');
      setHovered(false);
      document.body.style.cursor = 'grab';
    };
    
    // Add event listeners directly to the HTML element
    htmlElement.addEventListener('wheel', handleWheel, { passive: false });
    htmlElement.addEventListener('mouseenter', handleMouseEnter);
    htmlElement.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      htmlElement.removeEventListener('wheel', handleWheel);
      htmlElement.removeEventListener('mouseenter', handleMouseEnter);
      htmlElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  // For Three.js pointer events
  const handlePointerEnter = useCallback(() => {
    console.log('Pointer entered Three.js element');
    setHovered(true);
  }, []);
  
  const handlePointerLeave = useCallback(() => {
    console.log('Pointer left Three.js element');
    setHovered(false);
  }, []);
  
  return (
    <group ref={groupRef} position={position}>  
      {/* Content container with ref for direct DOM access */}
      <Html
        transform
        scale={scale}
        position={[0, 0, 0]}
        style={{
          width: '22em',
          height: '20em',
          padding: '1.2em',
          color: 'white',
          backdropFilter: 'blur(2px)',
          borderRadius: '10px',
          pointerEvents: 'auto', 
          overflow: 'auto',
          transition: 'box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
          boxShadow: hovered ? '0 0 20px 5px #00a2ff, 0 0 5px #ffffff' : 'none',
          border: hovered ? '2px solid rgba(0, 162, 255, 0.7)' : 'none',
          backgroundColor: hovered ? 'rgba(0, 20, 40, 0.3)' : 'transparent'
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onWheel={(e) => e.stopPropagation()}
      >
        <style>
          {`
            .hover-content {
              height: 100%;
              overflow: auto;
              padding-right: 10px;
              transition: all 0.3s ease-in-out;
              position: relative;
              scrollbar-width: thin;
              scrollbar-color: rgba(0, 162, 255, 0.6) rgba(0, 0, 0, 0.2);
              scroll-behavior: smooth;
            }
            .hover-content::-webkit-scrollbar {
              width: 8px;
            }
            .hover-content::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
            }
            .hover-content::-webkit-scrollbar-thumb {
              background-color: rgba(0, 162, 255, 0.6);
              border-radius: 4px;
            }
            .hover-content:hover {
              transform: scale(1.05);
              box-shadow: 0 0 15px rgba(0, 162, 255, 0.6);
            }
            .hover-indicator {
              position: absolute;
              top: 10px;
              right: 10px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background-color: #00a2ff;
              opacity: 0;
              transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
              z-index: 10;
            }
            .hover-content:hover .hover-indicator {
              opacity: 1;
              transform: scale(1.2);
              box-shadow: 0 0 10px #00a2ff;
            }
          `}
        </style>
        <div 
          ref={htmlRef}
          className="hover-content"
          data-tab-content="true"
          title="Scroll to see more content"
          onMouseEnter={() => {
            console.log('Raw onMouseEnter triggered');
            setHovered(true);
          }}
          onMouseLeave={() => {
            console.log('Raw onMouseLeave triggered');
            setHovered(false);
          }}
          // Remove the duplicate wheel handler here and let the useEffect one handle it
          onWheel={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </Html>
      
      {/* More visible scroll indicator that shows on hover */}
      {hovered && (
        <Html
          transform
          position={[0, -1.4, 0.05]}
          scale={0.4}
        >
          <div style={{
            color: 'white',
            opacity: 0.9,
            textAlign: 'center',
            animation: 'fadeInOut 1.5s infinite',
            textShadow: '0 0 5px #00a2ff'
          }}>
            <style>
              {`
                @keyframes fadeInOut {
                  0%, 100% { opacity: 0.5; transform: translateY(0); }
                  50% { opacity: 1; transform: translateY(-5px); }
                }
              `}
            </style>
            ↕ Scroll to view more
          </div>
        </Html>
      )}
    </group>
  )
}

export default HolographicPanel 