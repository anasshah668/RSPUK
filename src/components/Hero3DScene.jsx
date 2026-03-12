import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import LetterR3D from './LetterR3D';

const Hero3DScene = () => {
  return (
    <div className="w-full h-full min-h-[500px] md:min-h-[600px]">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} />
        <pointLight position={[0, 10, 0]} intensity={0.6} />
        
        <Suspense fallback={null}>
          <LetterR3D />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3DScene;
