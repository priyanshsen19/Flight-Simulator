import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { CessnaModel } from './CessnaModel';
import { CityModel } from './CityModel';
import { OrbitControls } from '@react-three/drei';

// function CameraFollower({ planeRef, isUserRotating }) {
//   const { camera } = useThree();

//   useFrame(() => {
//     if (!planeRef.current || isUserRotating) return;

//     const plane = planeRef.current;
//     const offset = new THREE.Vector3(0, 5, 10).applyQuaternion(plane.quaternion);
//     const desiredPosition = plane.position.clone().add(offset);

//     camera.position.lerp(desiredPosition, 0.1);
//     camera.lookAt(plane.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
//   });

//   return null;
// }

function FollowPlaneCamera({ controlsRef, planeRef }) {
  useFrame(() => {
    if (!planeRef.current || !controlsRef.current) return;

    const target = planeRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0));

    // ✅ Maintain the user-set camera angle, just move it with the plane
    const offset = controlsRef.current.object.position.clone().sub(controlsRef.current.target);
    controlsRef.current.target.copy(target);
    controlsRef.current.object.position.copy(target.clone().add(offset));

    controlsRef.current.update();
  });

  return null;
}

function AircraftController({ controlsRef, planeRef }) {
  const velocity = useRef(new THREE.Vector3());
  const speed = useRef(0.5); // Constant speed

  useFrame(() => {
    const plane = planeRef.current;
    if (!plane) return;

    // Rotation
    if (controlsRef.current.ArrowLeft) plane.rotation.y += 0.02;
    if (controlsRef.current.ArrowRight) plane.rotation.y -= 0.02;
    if (controlsRef.current.W) plane.rotation.x = Math.max(-0.5, plane.rotation.x - 0.01);
    if (controlsRef.current.S) plane.rotation.x = Math.min(0.5, plane.rotation.x + 0.01);

    // ✅ Always move forward based on rotation
    const direction = new THREE.Vector3(0, 0, -1)
      .applyEuler(plane.rotation)
      .normalize();

    velocity.current.copy(direction).multiplyScalar(speed.current);
    plane.position.add(velocity.current);
  });

  return null;
}

export default function App() {
  const orbitRef = useRef();
  const [isUserRotating, setIsUserRotating] = useState(false);
  const controlsRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    W: false,
    S: false,
  });

  const planeRef = useRef();

  useEffect(() => {
    const downHandler = (e) => {
      if (e.code === 'ArrowUp') controlsRef.current.ArrowUp = true;
      if (e.code === 'ArrowDown') controlsRef.current.ArrowDown = true;
      if (e.code === 'ArrowLeft') controlsRef.current.ArrowLeft = true;
      if (e.code === 'ArrowRight') controlsRef.current.ArrowRight = true;
      if (e.code === 'KeyW') controlsRef.current.W = true;
      if (e.code === 'KeyS') controlsRef.current.S = true;
    };

    const upHandler = (e) => {
      if (e.code === 'ArrowUp') controlsRef.current.ArrowUp = false;
      if (e.code === 'ArrowDown') controlsRef.current.ArrowDown = false;
      if (e.code === 'ArrowLeft') controlsRef.current.ArrowLeft = false;
      if (e.code === 'ArrowRight') controlsRef.current.ArrowRight = false;
      if (e.code === 'KeyW') controlsRef.current.W = false;
      if (e.code === 'KeyS') controlsRef.current.S = false;
    };

    const onMouseDown = (e) => {
      if (e.button === 0 || e.button === 1 || e.button === 2) setIsUserRotating(true);
    };

    const onMouseUp = () => setIsUserRotating(false);

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas shadows camera={{ position: [0, 50, 100], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 50, 10]} intensity={1} castShadow />
        <Environment preset="sunset" />
        <Stars radius={300} depth={60} count={5000} factor={4} fade />

        <Suspense fallback={null}>
          <CityModel />
          <group ref={planeRef} position={[0, 20, 0]}>
            <CessnaModel />
          </group>
        </Suspense>

        <AircraftController controlsRef={controlsRef} planeRef={planeRef} />
        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          target={[0, 1.5, 0]} // will be dynamically updated
          mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }}
        />
        <FollowPlaneCamera controlsRef={orbitRef} planeRef={planeRef} />
      </Canvas>
    </div>
  );
}
