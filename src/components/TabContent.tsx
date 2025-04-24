import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Text, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events'

interface TabContentProps {
  activeTab: string;
  moonPosition?: [number, number, number];
  marsPosition?: [number, number, number];
  earthPosition?: [number, number, number];
}

// Holographic panel common styles and effects
const HolographicPanel: React.FC<{ position: [number, number, number], children: React.ReactNode }> = ({ position, children }) => {
  const groupRef = useRef<THREE.Group>(null)
  const htmlRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [scale, setScale] = useState(0.25)
  
  // Add subtle floating animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y += Math.sin(clock.getElapsedTime() * 2) * 0.0005
      // Subtle rotation for holographic effect
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.02
      
      // Smoothly animate scale when hover state changes
      if (hovered && scale < 0.28) {
        setScale(prev => Math.min(0.28, prev + 0.005))
      } else if (!hovered && scale > 0.25) {
        setScale(prev => Math.max(0.25, prev - 0.005))
      }
    }
  })
  
  // Use a direct DOM approach to handle wheel events on the container
  useEffect(() => {
    const htmlElement = htmlRef.current;
    if (!htmlElement) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      // Don't prevent default so the HTML element can scroll
    };

    const handleMouseEnter = () => {
      setHovered(true);
      document.body.style.cursor = 'auto';
    };

    const handleMouseLeave = () => {
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
    setHovered(true);
  }, []);
  
  const handlePointerLeave = useCallback(() => {
    setHovered(false);
  }, []);
  
  return (
    <group ref={groupRef} position={position}>
      {/* Holographic scanline effect - only subtle wireframe now */}
      <mesh position={[0, 0, 0.01]} scale={hovered ? 1.1 : 1}>
        <planeGeometry args={[6, 4.5]} />
        <meshBasicMaterial
          color="#80ccff"
          opacity={0.00}
          transparent={true}
          wireframe={true}
        />
      </mesh>
      
      {/* Content container with ref for direct DOM access */}
      <Html
        transform
        scale={scale}
        position={[0, 0, 0.02]}
        style={{
          width: '22em',
          height: '16em',
          padding: '1.2em',
          color: 'white',
          backdropFilter: 'blur(2px)',
          borderRadius: '10px',
          pointerEvents: 'auto', 
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <div 
          ref={htmlRef}
          style={{ 
            height: '100%', 
            overflow: 'auto',
            paddingRight: '10px'
          }}
          data-tab-content="true"
        >
          {children}
        </div>
      </Html>
    </group>
  )
}

// Experience content - positioned next to Moon
const ExperienceContent: React.FC<{ moonPosition?: [number, number, number] }> = ({ moonPosition = [3, 0, 1] }) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Use useFrame to continuously update position relative to the moon's orbit
  useFrame(() => {
    if (groupRef.current && moonPosition) {
      groupRef.current.position.set(
        moonPosition[0] + 2,  // Offset to the right of the moon
        moonPosition[1] + 0.5, // Slightly above the moon
        moonPosition[2]       // Same Z position as the moon
      )
    }
  })
  
  return (
    <group ref={groupRef}>
      <HolographicPanel position={[0, 0, 0]}>
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', fontSize: '1.5em' }}>Experience</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Software Engineer II</h3>
            <p style={{ color: '#ffffff', opacity: 0.9, marginBottom: '5px' }}>Dick's Sporting Goods • 2023 - Present</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 1.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 2.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 3.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 4.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 5.</p>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Network Engineer Intern</h3>
            <p style={{ color: '#ffffff', opacity: 0.9, marginBottom: '5px' }}>Dick's Sporting Goods • 2022</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 1.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 2.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 3 - extra content for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 4 - extra content for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 5 - extra content for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 6 - extra content for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Thing 7 - extra content for scrolling test.</p>
          </li>
        </ul>
      </HolographicPanel>
    </group>
  )
}

// Projects content - positioned next to Mars
const ProjectsContent: React.FC<{ marsPosition?: [number, number, number] }> = ({ marsPosition = [0, 0, 16] }) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Use useFrame to continuously update position relative to Mars
  useFrame(() => {
    if (groupRef.current && marsPosition) {
      groupRef.current.position.set(
        marsPosition[0] + 2.5,  // Offset to the right of Mars
        marsPosition[1] + 0,    // Same height as Mars
        marsPosition[2]         // Same Z position as Mars
      )
    }
  })
  
  return (
    <group ref={groupRef}>
      <HolographicPanel position={[0, 0, 0]}>
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', fontSize: '1.5em' }}>Projects</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Dark Matter Mapper</h3>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Project for this ballsack.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Extra details for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>More details for scrolling test.</p>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Meal Planner</h3>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>that one project balls.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Extra details for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>More details for scrolling test.</p>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>something else idk</h3>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>hello hello hello.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Extra details for scrolling test.</p>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>More details for scrolling test.</p>
          </li>
        </ul>
      </HolographicPanel>
    </group>
  )
}

// About Me content - positioned next to Earth
const AboutMeContent: React.FC<{ earthPosition?: [number, number, number] }> = ({ earthPosition = [0, 0, 0] }) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Use useFrame to continuously update position relative to Earth
  useFrame(() => {
    if (groupRef.current && earthPosition) {
      groupRef.current.position.set(
        earthPosition[0] + 2.5,  // Offset to the right of Earth
        earthPosition[1] + 0,    // Same height as Earth
        earthPosition[2]         // Same Z position as Earth
      )
    }
  })
  
  return (
    <group ref={groupRef}>
      <HolographicPanel position={[0, 0, 0]}>
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', fontSize: '1.5em' }}>About Me</h2>
        <p style={{ color: '#ffffff', opacity: 0.9, lineHeight: '1.4' }}>Hi! I'm Josh Melgar, a full-stack software engineer with a passion for creating cool stuff.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>some random stuff here.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>some random stuff here.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>Extra paragraph for scrolling test.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>Extra paragraph for scrolling test.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>Extra paragraph for scrolling test.</p>
        <p style={{ color: '#ffffff', opacity: 0.8, lineHeight: '1.4' }}>Extra paragraph for scrolling test.</p>
      </HolographicPanel>
    </group>
  )
}

// Main content switcher - now returns 3D components
const TabContent: React.FC<TabContentProps> = ({ 
  activeTab, 
  moonPosition = [3, 0, 1],
  marsPosition = [0, 0, 16],
  earthPosition = [0, 0, 0]
}) => {
  switch (activeTab) {
    case 'Experience':
      return <ExperienceContent moonPosition={moonPosition} />
    case 'Projects':
      return <ProjectsContent marsPosition={marsPosition} />
    case 'About Me':
      return <AboutMeContent earthPosition={earthPosition} />
    default:
      return null
  }
}

export default TabContent 