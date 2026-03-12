import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const LetterR3D = () => {
  const groupRef = useRef();

  // Animate rotation and position
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[1, 1, 1]}>
      {/* Left vertical bar */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[0.8, 6, 1.5]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.4}
          roughness={0.6}
          emissive="#1f2937"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Top horizontal bar */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[3, 0.8, 1.5]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.4}
          roughness={0.6}
          emissive="#1f2937"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Middle horizontal bar */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[2, 0.8, 1.5]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.4}
          roughness={0.6}
          emissive="#1f2937"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Right diagonal leg */}
      <mesh position={[1.5, -1.5, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.8, 3.5, 1.5]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.4}
          roughness={0.6}
          emissive="#1f2937"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Top right corner */}
      <mesh position={[1.5, 2.5, 0]}>
        <boxGeometry args={[0.8, 0.8, 1.5]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.4}
          roughness={0.6}
          emissive="#1f2937"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Bottom right corner */}
      <mesh position={[2, -2.5, 0]}>
        <boxGeometry args={[0.8, 0.8, 1.5]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.4}
          roughness={0.6}
          emissive="#1f2937"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
};

export default LetterR3D;
