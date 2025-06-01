import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export function CityModel() {
  const gltf = useGLTF('/burnin_rubber_crash_n_burn_city.glb');

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [gltf]);

  return (
    <primitive object={gltf.scene} scale={4} position={[0, -1, 0]} />
  );
}
