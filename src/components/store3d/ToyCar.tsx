import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group } from 'three';

interface ToyCarProps {
  position: [number, number, number];
  rotationY?: number;
}

/** A big colorful ride-on toy car that greets visitors at the store entrance. */
export const ToyCar = ({ position, rotationY = 0 }: ToyCarProps) => {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.4) * 0.04;
    }
  });

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.6, 1.3]} />
        <meshStandardMaterial color="#e63946" />
      </mesh>
      {/* Cabin */}
      <mesh position={[-0.15, 1.05, 0]} castShadow>
        <boxGeometry args={[1.2, 0.5, 1.1]} />
        <meshStandardMaterial color="#ffd166" />
      </mesh>
      {/* Windshield */}
      <mesh position={[0.48, 1.0, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.42, 0.5, 1.02]} />
        <meshStandardMaterial color="#a8dadc" />
      </mesh>
      {/* Bumpers */}
      {[1.2, -1.2].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]} castShadow>
          <boxGeometry args={[0.14, 0.28, 1.35]} />
          <meshStandardMaterial color="#f1faee" />
        </mesh>
      ))}
      {/* Headlights */}
      {[0.45, -0.45].map((z) => (
        <mesh key={z} position={[1.24, 0.62, z]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#fff8e1" emissive="#ffe082" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Wheels */}
      {[
        [0.8, 0.7],
        [0.8, -0.7],
        [-0.8, 0.7],
        [-0.8, -0.7],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.22, 20]} />
          <meshStandardMaterial color="#2b2d42" />
        </mesh>
      ))}
      {/* Welcome flag */}
      <Html position={[0, 1.95, 0]} center distanceFactor={9} occlude={false}>
        <div
          style={{
            direction: 'rtl',
            whiteSpace: 'nowrap',
            background: '#e63946',
            color: '#fff7ec',
            border: '3px solid #ffd166',
            padding: '6px 18px',
            borderRadius: 14,
            fontSize: 18,
            fontWeight: 800,
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          }}
        >
          🚗 ברוכים הבאים
        </div>
      </Html>
    </group>
  );
};
