import React, { useRef, useContext } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Sphere } from '@react-three/drei';
import type { Mesh } from 'three';
import { DoubleSide } from 'three';
import { MoonPositionContext } from '../contexts/MoonPositionContext';

interface MoonProps {
  earthRef: React.RefObject<Mesh>;
  orbitSpeed?: number;
  orbitRadius?: number;
}

const Moon: React.FC<MoonProps> = ({
  earthRef,
  orbitSpeed = 0.02,
  orbitRadius = 5,
}) => {
  const moonRef = useRef<Mesh>(null);
  const { setPosition } = useContext(MoonPositionContext);
  const moonTexture = useTexture('/textures/moon_map.png');

  useFrame(({ clock }) => {
    if (moonRef.current && earthRef.current) {
      const time = clock.getElapsedTime();
      const angle = time * orbitSpeed;
      const x = Math.cos(angle) * orbitRadius + earthRef.current.position.x;
      const z = Math.sin(angle) * orbitRadius + earthRef.current.position.z;

      // Update Moon position
      moonRef.current.position.set(x, 0, z);
      moonRef.current.rotation.y = -angle;

      // Update context
      setPosition([x, 0, z]);
      
      // Debug moon position updates (log every few seconds to avoid console spam)
      if (Math.floor(time) % 5 === 0 && Math.floor(time * 10) % 10 === 0) {
        console.log('Moon updated position:', [x, 0, z]);
      }
    }
  });

  return (
    <group>
      <Sphere ref={moonRef} args={[0.27, 32, 32]}>
        <meshStandardMaterial
          map={moonTexture}
          emissive="#111111"
          emissiveIntensity={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
      <Sphere args={[0.28, 32, 32]}>
        <meshStandardMaterial
          color="#666666"
          transparent={true}
          opacity={0.1}
          depthWrite={false}
          side={DoubleSide}
        />
      </Sphere>
    </group>
  );
};

export default Moon;