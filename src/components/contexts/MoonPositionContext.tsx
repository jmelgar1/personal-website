import React, { createContext, useState, ReactNode } from 'react'

interface MoonPositionContextType {
  position: [number, number, number];
  setPosition: (pos: [number, number, number]) => void;
}

export const MoonPositionContext = createContext<MoonPositionContextType>({
  position: [0, 0, 0],
  setPosition: () => {}
})

interface MoonPositionProviderProps {
  children: ReactNode;
}

export const MoonPositionProvider: React.FC<MoonPositionProviderProps> = ({ children }) => {
  const [position, setPosition] = useState<[number, number, number]>([3, 0, 0])
  
  return React.createElement(
    MoonPositionContext.Provider,
    { value: { position, setPosition } },
    children
  )
} 