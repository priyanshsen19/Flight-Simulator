import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


export function CessnaModel() {
  const { scene } = useGLTF('/cesna_airplane.glb');
  const propeller = useRef();
  const planeGroup = useRef();

  useEffect(() => {
    // ✅ Force the internal model to rotate and face -Z (Three.js forward)
   scene.rotation.set(0, -Math.PI / 2, 0); 

    // Optional: add spinning propeller
    const prop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: "gray" })
    );
    prop.rotation.x = Math.PI / 2;
    prop.position.set(0, 0.2, 2.3);
    propeller.current = prop;
    planeGroup.current?.add(prop);
  }, [scene]);


  useFrame(() => {
    if (propeller.current) {
      propeller.current.rotation.z += 0.3;
    }
  });

  return (
  <group ref={planeGroup} scale={0.5}>
    <primitive object={scene} />
  </group>
);
}
