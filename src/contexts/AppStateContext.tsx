import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction } from 'react'

interface AppStateContextType {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  earthRotateSpeed: number;
  setEarthRotateSpeed: Dispatch<SetStateAction<number>>;
  cloudsRotateSpeed: number;
  setCloudsRotateSpeed: Dispatch<SetStateAction<number>>;
  isFocused: boolean;
  setIsFocused: Dispatch<SetStateAction<boolean>>;
  cameraTarget: [number, number, number];
  setCameraTarget: Dispatch<SetStateAction<[number, number, number]>>;
  cameraInfo: {
    position: [number, number, number];
    target: [number, number, number];
    distance: number;
  };
  setCameraInfo: Dispatch<SetStateAction<{
    position: [number, number, number];
    target: [number, number, number];
    distance: number;
  }>>;
}

const defaultCameraInfo = {
  position: [0, 0, 0] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  distance: 0
}

export const AppStateContext = createContext<AppStateContextType>({
  activeTab: 'About Me',
  setActiveTab: () => {},
  zoom: 3,
  setZoom: () => {},
  earthRotateSpeed: 0.05,
  setEarthRotateSpeed: () => {},
  cloudsRotateSpeed: 0.07,
  setCloudsRotateSpeed: () => {},
  isFocused: true,
  setIsFocused: () => {},
  cameraTarget: [0, 0, 0],
  setCameraTarget: () => {},
  cameraInfo: defaultCameraInfo,
  setCameraInfo: () => {},
})

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('About Me')
  const [zoom, setZoom] = useState(3)
  const [earthRotateSpeed, setEarthRotateSpeed] = useState(0.05)
  const [cloudsRotateSpeed, setCloudsRotateSpeed] = useState(0.07)
  const [isFocused, setIsFocused] = useState(true)
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0])
  const [cameraInfo, setCameraInfo] = useState(defaultCameraInfo)
  
  // Update camera target when tab changes
  React.useEffect(() => {
    // The controls now handle camera target based on active tab
    // This useEffect just sets initial planet positions
    switch(activeTab) {
      case 'About Me':
        setCameraTarget([0, 0, 0]) // Earth position
        break
      case 'Experience':
        // Moon position handled by context
        break
      case 'Projects':
        setCameraTarget([0, 0, 13]) // Mars position
        break
      default:
        setCameraTarget([0, 0, 0])
    }
  }, [activeTab])
  
  const contextValue = useMemo(() => ({
    activeTab,
    setActiveTab,
    zoom,
    setZoom,
    earthRotateSpeed,
    setEarthRotateSpeed,
    cloudsRotateSpeed,
    setCloudsRotateSpeed,
    isFocused,
    setIsFocused,
    cameraTarget,
    setCameraTarget,
    cameraInfo,
    setCameraInfo,
  }), [
    activeTab, 
    zoom, 
    earthRotateSpeed, 
    cloudsRotateSpeed, 
    isFocused,
    cameraTarget,
    cameraInfo
  ])
  
  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  )
}

export const useAppState = () => useContext(AppStateContext) 