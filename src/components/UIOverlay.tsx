import React, { ReactNode } from 'react'
import TabMenu from './TabMenu'

interface UIOverlayProps {
  children?: ReactNode;
  onTabChange?: (tab: string) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ children, onTabChange }) => {
  return React.createElement('div', 
    { 
      style: { 
        position: 'absolute', 
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      } 
    },
    // Tab Menu at the top
    React.createElement('div',
      {
        style: {
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 15
        }
      },
      React.createElement(TabMenu, { 
        onTabChange 
      })
    ),
    
    // Container for any additional UI elements passed as children
    React.createElement('div', 
      { 
        style: { 
          pointerEvents: 'none',
          position: 'relative',
          height: '100%'
        } 
      },
      children
    )
  )
}

export default UIOverlay 