import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import HolographicPanel from './HolographicPanel'
import contentData from '../../../data/contentData'

export type ContentType = 'aboutMe' | 'projects' | 'experience'

interface HolographicContentProps {
  type: ContentType;
  planetPosition?: [number, number, number];
  offset?: [number, number, number];
}

const HolographicContent: React.FC<HolographicContentProps> = ({ 
  type, 
  planetPosition = [0, 0, 0],
  offset = [2.5, 0, 0]
}) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Use useFrame to continuously update position relative to the planet
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        planetPosition[0] + offset[0],
        planetPosition[1] + offset[1],
        planetPosition[2] + offset[2]
      )
    }
  })

  const renderAboutMe = () => (
    <>
      <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>
        {contentData.aboutMe.title}
      </h2>
      {contentData.aboutMe.paragraphs.map((paragraph, index) => (
        <p key={index} style={{ color: '#ffffff', opacity: index === 0 ? 0.9 : 0.8, lineHeight: '1.4' }}>
          {paragraph}
        </p>
      ))}
    </>
  )

  const renderProjects = () => (
    <>
      <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>
        {contentData.projects.title}
      </h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {contentData.projects.items.map((project, projectIndex) => (
          <li key={projectIndex} style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>
              {project.title}
            </h3>
            {project.details.map((detail, detailIndex) => (
              <p key={detailIndex} style={{ color: '#ffffff', opacity: 0.8 }}>
                {detail}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </>
  )

  const renderExperience = () => (
    <>
      <h2 style={{ color: '#ffffff', textShadow: '0 0 8px #00a2ff', marginBottom: '0.8em', marginTop: 0, fontSize: '1.5em' }}>
        {contentData.experience.title}
      </h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {contentData.experience.items.map((job, jobIndex) => (
          <li key={jobIndex} style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#00a2ff', textShadow: '0 0 5px #00a2ff', marginBottom: '5px' }}>
              {job.title}
            </h3>
            {job.subtitle && (
              <p style={{ color: '#ffffff', opacity: 0.9, marginBottom: '5px' }}>
                {job.subtitle}
              </p>
            )}
            {job.details.map((detail, detailIndex) => (
              <p key={detailIndex} style={{ color: '#ffffff', opacity: 0.8 }}>
                {detail}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </>
  )

  const renderContent = () => {
    switch (type) {
      case 'aboutMe':
        return renderAboutMe()
      case 'projects':
        return renderProjects()
      case 'experience':
        return renderExperience()
      default:
        return <p>Content not found</p>
    }
  }
  
  return (
    <group ref={groupRef}>
      <HolographicPanel position={[0, 0, 0]}>
        {renderContent()}
      </HolographicPanel>
    </group>
  )
}

export default HolographicContent