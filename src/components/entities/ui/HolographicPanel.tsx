import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HolographicPanelProps {
  position: [number, number, number];
  children: React.ReactNode;
  onHover?: (isHovered: boolean, position: THREE.Vector3, normal: THREE.Vector3) => void;
}

// Holographic panel common styles and effects
const HolographicPanel: React.FC<HolographicPanelProps> = ({ position, children, onHover }) => {
  const groupRef = useRef<THREE.Group>(null)
  const htmlRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [scale, setScale] = useState(0.25)
  const lastPosition = useRef(new THREE.Vector3())
  
  // Update position and notify parent when position changes while hovered
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
      
      // If panel is hovered and position has changed, notify parent
      if (hovered && onHover) {
        const currentPosition = new THREE.Vector3()
        groupRef.current.getWorldPosition(currentPosition)
        
        // Check if position has changed significantly
        if (!currentPosition.equals(lastPosition.current) && currentPosition.distanceTo(lastPosition.current) > 0.001) {
          
          // Calculate normal vector (the direction the panel is facing)
          // For a panel, we want the normal to point outward from the front face
          const normal = new THREE.Vector3(0, 0, 1) // Start with default forward vector
          
          // Apply the group's rotation to get the world-space normal
          const normalMatrix = new THREE.Matrix4()
          normalMatrix.extractRotation(groupRef.current.matrixWorld)
          normal.applyMatrix4(normalMatrix)
          
          // Notify parent about position update
          onHover(true, currentPosition, normal)
          
          // Update last position
          lastPosition.current.copy(currentPosition)
        }
      }
    }
  })
  
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
      
      // Notify parent component about hover state change with position and normal vector
      if (onHover && groupRef.current) {
        const panelPosition = new THREE.Vector3();
        groupRef.current.getWorldPosition(panelPosition);
        
        // Store initial position
        lastPosition.current.copy(panelPosition);
        
        // Calculate normal vector (the direction the panel is facing)
        const normal = new THREE.Vector3(0, 0, 1); // Default panel faces +Z direction
        
        // Apply the group's rotation to get the world-space normal
        const normalMatrix = new THREE.Matrix4()
        normalMatrix.extractRotation(groupRef.current.matrixWorld)
        normal.applyMatrix4(normalMatrix)
        
        onHover(true, panelPosition, normal);
      }
    };

    const handleMouseLeave = () => {
      console.log('Mouse left HTML element');
      setHovered(false);
      document.body.style.cursor = 'grab';
      
      // Notify parent about hover end
      if (onHover && groupRef.current) {
        const panelPosition = new THREE.Vector3();
        groupRef.current.getWorldPosition(panelPosition);
        
        const normal = new THREE.Vector3(0, 0, 1);
        
        // Apply the group's rotation to get the world-space normal
        const normalMatrix = new THREE.Matrix4()
        normalMatrix.extractRotation(groupRef.current.matrixWorld)
        normal.applyMatrix4(normalMatrix)
        
        onHover(false, panelPosition, normal);
      }
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
  }, [onHover]);
  
  // For Three.js pointer events
  const handlePointerEnter = useCallback(() => {
    console.log('Pointer entered Three.js element');
    setHovered(true);
    
    // Notify parent component about hover state change
    if (onHover && groupRef.current) {
      const panelPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(panelPosition);
      
      const normal = new THREE.Vector3(0, 0, 1);
      
      // Apply the group's rotation to get the world-space normal
      const normalMatrix = new THREE.Matrix4()
      normalMatrix.extractRotation(groupRef.current.matrixWorld)
      normal.applyMatrix4(normalMatrix)
      
      onHover(true, panelPosition, normal);
    }
  }, [onHover]);
  
  const handlePointerLeave = useCallback(() => {
    console.log('Pointer left Three.js element');
    setHovered(false);
    
    // Notify parent about hover end
    if (onHover && groupRef.current) {
      const panelPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(panelPosition);
      
      const normal = new THREE.Vector3(0, 0, 1);
      
      // Apply the group's rotation to get the world-space normal
      const normalMatrix = new THREE.Matrix4()
      normalMatrix.extractRotation(groupRef.current.matrixWorld)
      normal.applyMatrix4(normalMatrix)
      
      onHover(false, panelPosition, normal);
    }
  }, [onHover]);
  
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