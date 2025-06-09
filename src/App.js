import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { CessnaModel } from './CessnaModel';
import { CityModel } from './CityModel';
import { OrbitControls } from '@react-three/drei';

function FollowPlaneCamera({ controlsRef, planeRef }) {
  useFrame(() => {
    if (!planeRef.current || !controlsRef.current) return;

    const target = planeRef.current.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const offset = controlsRef.current.object.position.clone().sub(controlsRef.current.target);
    controlsRef.current.target.copy(target);
    controlsRef.current.object.position.copy(target.clone().add(offset));
    controlsRef.current.update();
  });

  return null;
}

function AircraftController({ controlsRef, planeRef, setCrashed }) {
  const velocity = useRef(new THREE.Vector3());
  const speed = useRef(0.5);

  useFrame(() => {
    const plane = planeRef.current;
    if (!plane) return;

    // Rotation
    if (controlsRef.current.ArrowLeft) plane.rotation.y += 0.02;
    if (controlsRef.current.ArrowRight) plane.rotation.y -= 0.02;
    if (controlsRef.current.W) plane.rotation.x = Math.max(-0.5, plane.rotation.x - 0.01);
    if (controlsRef.current.S) plane.rotation.x = Math.min(0.5, plane.rotation.x + 0.01);

    const direction = new THREE.Vector3(0, 0, -1).applyEuler(plane.rotation).normalize();
    velocity.current.copy(direction).multiplyScalar(speed.current);
    plane.position.add(velocity.current);

    // Out-of-bounds check
    const bounds = 120;
    if (Math.abs(plane.position.x) > bounds || Math.abs(plane.position.z) > bounds) {
      plane.rotation.y -= 0.03; // steer back gently
    }

    // Altitude check
    if (plane.position.y > 120) {
      plane.position.set(0, 20, 0);
      plane.rotation.set(0, Math.PI, 0);
      speed.current = 0.5;
    }

    // Crash check
    if (plane.position.y < 2) {
      setCrashed(true);
    }
  });

  return null;
}

export default function App() {
  const orbitRef = useRef();
  const planeRef = useRef();
  const [crashed, setCrashed] = useState(false);
  const controlsRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    W: false,
    S: false,
  });

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

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 50, 100], fov: 75, near: 1, far: 300 }}
      >
        <fog attach="fog" args={['#87ceeb', 150, 300]} />
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

        <AircraftController
          controlsRef={controlsRef}
          planeRef={planeRef}
          setCrashed={setCrashed}
        />

        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }}
        />
        <FollowPlaneCamera controlsRef={orbitRef} planeRef={planeRef} />
      </Canvas>

      {crashed && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            zIndex: 999,
          }}
        >
          <h2 style={{ color: 'red' }}>💥 Crash Detected!</h2>
          <button
            onClick={() => {
              setCrashed(false);
              planeRef.current.position.set(0, 20, 0);
              planeRef.current.rotation.set(0, Math.PI, 0);
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
