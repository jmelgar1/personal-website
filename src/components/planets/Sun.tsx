import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  DirectionalLight, 
  TextureLoader, 
  Color, 
  PointLight,
  Texture
} from 'three'
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js'

const Sun: React.FC = () => {
  const directionalLightRef = useRef<DirectionalLight>(null)
  const pointLightRef = useRef<PointLight>(null)
  const [textures, setTextures] = useState<Texture[]>([])
  const [texturesLoaded, setTexturesLoaded] = useState(false)
  const { scene } = useThree()
  
  // Position the Sun to create optimal lens flare effect
  const sunPosition = [25, 10, -50]

  // Load textures with the correct paths that work in the app
  useEffect(() => {
    console.log('Loading lens flare textures from /textures/lensflare/...');
    
    const textureLoader = new TextureLoader();
    const texturesToLoad = [
      '/textures/lensflare/lensflare0.png',
      '/textures/lensflare/lensflare1.png',
      '/textures/lensflare/lensflare2.png'
    ];
    
    const loadedTextures: Texture[] = [];
    let loaded = 0;
    
    texturesToLoad.forEach((path, index) => {
      textureLoader.load(
        path,
        (texture) => {
          console.log(`Successfully loaded ${path}`);
          loadedTextures[index] = texture;
          loaded++;
          
          if (loaded === texturesToLoad.length) {
            console.log('All textures loaded successfully');
            setTextures(loadedTextures);
            setTexturesLoaded(true);
          }
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture from ${path}:`, error);
        }
      );
    });
  }, []);
  
  // Create lens flare effect when textures are loaded
  useEffect(() => {
    if (!directionalLightRef.current || !texturesLoaded || textures.length !== 3) {
      return;
    }
    
    console.log('Creating lens flare with loaded textures');
      
    try {
      // Create lens flare
      const lensflare = new Lensflare();
      
      // Add elements to lens flare with different sizes and colors for a rich sun look
      lensflare.addElement(new LensflareElement(textures[0], 900, 0, new Color(0xffffff)));
      lensflare.addElement(new LensflareElement(textures[1], 175, 0.6, new Color(0xff8800)));
      lensflare.addElement(new LensflareElement(textures[1], 225, 0.7, new Color(0x00ffff)));
      lensflare.addElement(new LensflareElement(textures[1], 275, 0.9, new Color(0xffaa00)));
      lensflare.addElement(new LensflareElement(textures[2], 125, 1.0, new Color(0xff0000)));
      lensflare.addElement(new LensflareElement(textures[1], 200, 1.25, new Color(0xffffbb)));
      
      // Add lens flare to the directional light
      directionalLightRef.current.add(lensflare);
      
      console.log('Lens flare added to Sun');
      
      // Clean up on unmount
      return () => {
        if (directionalLightRef.current) {
          directionalLightRef.current.remove(lensflare);
        }
      };
    } catch (error) {
      console.error('Error creating lens flare:', error);
    }
  }, [texturesLoaded, textures]);

  // Update directional light to always point at the scene center
  useFrame(() => {
    if (directionalLightRef.current) {
      directionalLightRef.current.position.set(sunPosition[0], sunPosition[1], sunPosition[2]);
      directionalLightRef.current.target.position.set(0, 0, 0);
      directionalLightRef.current.target.updateMatrixWorld();
    }
  });

  return React.createElement('group', 
    { position: sunPosition },
    
    // Directional light with lens flare - this is now our sun
    React.createElement('directionalLight', {
      ref: directionalLightRef,
      color: "#FFFFFF",
      intensity: 7,  // High intensity since this is the sun
      position: sunPosition,
      castShadow: false
    }),
    
    // Additional point light for the sun's glow and overall scene illumination
    React.createElement('pointLight', {
      ref: pointLightRef,
      color: "#FFF4E0",
      intensity: 3.5,
      distance: 1000,
      decay: 0.5
    })
  )
}

export default Sun 