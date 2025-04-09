import React, { useState, useEffect } from 'react'

interface TabMenuProps {
  onTabChange?: (tab: string) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('Experience')
  
  const tabs = ['Experience', 'Projects', 'About Me']
  
  // Call onTabChange when component mounts to ensure initial tab is set
  useEffect(() => {
    if (onTabChange) {
      onTabChange(activeTab)
    }
  }, [])
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
      console.log('Tab clicked:', tab)
    }
  }
  
  return React.createElement('div', 
    { 
      style: { 
        position: 'absolute', 
        top: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '30px',
        zIndex: 100,
        pointerEvents: 'none'
      } 
    },
    ...tabs.map(tab => 
      React.createElement('button', 
        { 
          key: tab,
          onClick: () => handleTabClick(tab),
          style: { 
            background: 'transparent',
            border: 'none',
            color: activeTab === tab ? '#ffffff' : 'rgba(255,255,255,0.6)',
            fontSize: '18px',
            fontWeight: activeTab === tab ? 'bold' : 'normal',
            cursor: 'pointer',
            padding: '10px 5px',
            borderBottom: activeTab === tab ? '2px solid white' : 'none',
            transition: 'all 0.3s ease',
            pointerEvents: 'auto'
          }
        },
        tab
      )
    )
  )
}

export default TabMenu 