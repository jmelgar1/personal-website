import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Text, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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
  
  // Use a direct DOM approach to handle wheel events on the container
  useEffect(() => {
    const htmlElement = htmlRef.current;
    if (!htmlElement) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (htmlRef.current) {
        htmlRef.current.scrollTop += e.deltaY;
        e.preventDefault(); // Prevent default scrolling behavior
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
        onWheel={(e) => {
          e.stopPropagation();
          // Handle scrolling in the effect hook instead
        }}
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
          onWheel={(e) => {
            e.stopPropagation();
            e.currentTarget.scrollTop += e.deltaY;
            e.preventDefault();
          }}
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
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>Experience</h2>
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
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>Projects</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>Dark Matter Mapper</h3>
            <p style={{ color: '#ffffff', opacity: 0.8 }}>Project for this random stuf blah blah blah blah</p>
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
        <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>About Me</h2>
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