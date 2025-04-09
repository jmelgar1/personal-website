import React from 'react'

interface TabContentProps {
  activeTab: string;
}

// Common styles for content panels
const contentPanelStyle = {
  position: 'absolute' as const,
  bottom: '100px',
  right: '30px',
  maxWidth: '400px',
  color: 'white',
  background: 'rgba(0, 0, 0, 0.5)',
  padding: '20px',
  borderRadius: '10px',
  backdropFilter: 'blur(10px)',
  pointerEvents: 'auto' // Enable pointer events ONLY for the content panel
}

// Experience content
const ExperienceContent: React.FC = () => {
  return React.createElement('div', 
    { style: contentPanelStyle },
    React.createElement('h2', {}, 'Experience'),
    React.createElement('ul', 
      { style: { listStyleType: 'none', padding: 0 } },
      React.createElement('li', { style: { marginBottom: '15px' } },
        React.createElement('h3', {}, 'Software Engineer II'),
        React.createElement('p', {}, "Dick's Sporting Goods • 2023 - Present"),
        React.createElement('p', {}, 'Thing 1.'),
        React.createElement('p', {}, 'Thing 2.'),
        React.createElement('p', {}, 'Thing 3.'),
        React.createElement('p', {}, 'Thing 4.'),
        React.createElement('p', {}, 'Thing 5.')
      ),
      React.createElement('li', { style: { marginBottom: '15px' } },
        React.createElement('h3', {}, 'Network Engineer Intern'),
        React.createElement('p', {}, "Dick's Sporting Goods • 2022"),
        React.createElement('p', {}, 'Thing 1.'),
        React.createElement('p', {}, 'Thing 2.')
      )
    )
  )
}

// Projects content
const ProjectsContent: React.FC = () => {
  return React.createElement('div', 
    { style: contentPanelStyle },
    React.createElement('h2', {}, 'Projects'),
    React.createElement('ul', 
      { style: { listStyleType: 'none', padding: 0 } },
      React.createElement('li', { style: { marginBottom: '15px' } },
        React.createElement('h3', {}, 'Dark Matter Mapper'),
        React.createElement('p', {}, 'Project for this ballsack.')
      ),
      React.createElement('li', { style: { marginBottom: '15px' } },
        React.createElement('h3', {}, 'Meal Planner'),
        React.createElement('p', {}, 'that one project balls.')
      ),
      React.createElement('li', { style: { marginBottom: '15px' } },
        React.createElement('h3', {}, 'something else idk'),
        React.createElement('p', {}, 'hello hello hello.')
      )
    )
  )
}

// About Me content
const AboutMeContent: React.FC = () => {
  return React.createElement('div', 
    { style: contentPanelStyle },
    React.createElement('h2', {}, 'About Me'),
    React.createElement('p', {}, 'Hi! I\'m Josh Melgar, a full-stack software engineer with a passion for creating cool stuff.'),
    React.createElement('p', {}, 'some random stuff here.'),
    React.createElement('p', {}, 'some random stuff here.')
  )
}

// Main content switcher
const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'Experience':
      return React.createElement(ExperienceContent)
    case 'Projects':
      return React.createElement(ProjectsContent)
    case 'About Me':
      return React.createElement(AboutMeContent)
    default:
      return null
  }
}

export default TabContent 