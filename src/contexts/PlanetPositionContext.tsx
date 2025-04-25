import React, { createContext, useState, ReactNode, useMemo } from 'react'

interface PlanetPositionContextType {
  moonPosition: [number, number, number];
  setMoonPosition: (pos: [number, number, number]) => void;
  earthPosition: [number, number, number];
  marsPosition: [number, number, number];
}

export const PlanetPositionContext = createContext<PlanetPositionContextType>({
  moonPosition: [3, 0, 0],
  setMoonPosition: () => {},
  earthPosition: [0, 0, 0],
  marsPosition: [0, 0, 16]
})

interface PlanetPositionProviderProps {
  children: ReactNode;
}

export const PlanetPositionProvider: React.FC<PlanetPositionProviderProps> = ({ children }) => {
  const [moonPosition, setMoonPosition] = useState<[number, number, number]>([3, 0, 0])
  
  // These are fixed positions that don't change
  const earthPosition: [number, number, number] = [0, 0, 0]
  const marsPosition: [number, number, number] = [0, 0, 16]
  
  const contextValue = useMemo(() => ({ 
    moonPosition, 
    setMoonPosition, 
    earthPosition, 
    marsPosition 
  }), [moonPosition])
  
  return React.createElement(
    PlanetPositionContext.Provider,
    { value: contextValue },
    children
  )
}

// For backward compatibility
export const MoonPositionContext = createContext<{ 
  position: [number, number, number];
  setPosition: (pos: [number, number, number]) => void; 
}>({
  position: [0, 0, 0],
  setPosition: () => {}
})

export const MoonPositionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<[number, number, number]>([3, 0, 0])
  
  const contextValue = useMemo(() => ({ position, setPosition }), [position])
  
  return React.createElement(
    MoonPositionContext.Provider,
    { value: contextValue },
    children
  )
} 