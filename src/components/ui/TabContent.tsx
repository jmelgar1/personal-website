import React from 'react'
import ExperienceContent from '../content/ExperienceContent'
import ProjectsContent from '../content/ProjectsContent'
import AboutMeContent from '../content/AboutMeContent'

interface TabContentProps {
  activeTab: string;
  moonPosition?: [number, number, number];
  marsPosition?: [number, number, number];
  earthPosition?: [number, number, number];
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