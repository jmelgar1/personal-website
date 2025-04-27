import React from 'react'
import HolographicContent from '../entities/ui/HolographicContent'
import * as THREE from 'three'

interface TabContentProps {
  activeTab: string;
  moonPosition?: [number, number, number];
  marsPosition?: [number, number, number];
  earthPosition?: [number, number, number];
  onPanelHover?: (isHovered: boolean, position: THREE.Vector3, normal: THREE.Vector3) => void;
}

// Main content switcher - now returns 3D components
const TabContent: React.FC<TabContentProps> = ({ 
  activeTab, 
  moonPosition = [3, 0, 1],
  marsPosition = [0, 0, 16],
  earthPosition = [0, 0, 0],
  onPanelHover
}) => {
  switch (activeTab) {
    case 'Experience':
      return <HolographicContent type="experience" planetPosition={moonPosition} offset={[2, 0.5, 0]} onPanelHover={onPanelHover} />
    case 'Projects':
      return <HolographicContent type="projects" planetPosition={marsPosition} offset={[2.5, 0, 0]} onPanelHover={onPanelHover} />
    case 'About Me':
      return <HolographicContent type="aboutMe" planetPosition={earthPosition} offset={[2.5, 0, 0]} onPanelHover={onPanelHover} />
    default:
      return null
  }
}

export default TabContent 