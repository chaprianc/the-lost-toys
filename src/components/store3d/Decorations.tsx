import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

const CANDY = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0', '#c77dff', '#ff9770'];

/** Floating balloon bunch */
const Balloon = ({
  position,
  color,
  phase,
}: {
  position: [number, number, number];
  color: string;
  phase: number;
}) => {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 0.9 + phase) * 0.12;
    ref.current.rotation.z = Math.sin(t * 0.6 + phase) * 0.08;
  });
  return (
    <group ref={ref} position={position}>
      <mesh scale={[1, 1.25, 1]} castShadow>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.36, 0]}>
        <coneGeometry args={[0.06, 0.12, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.1, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

/** Triangular bunting garland strung between two X points */
const Bunting = ({
  fromX,
  toX,
  z,
  y,
}: {
  fromX: number;
  toX: number;
  z: number;
  y: number;
}) => {
  const count = 12;
  const flags = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const x = fromX + (toX - fromX) * t;
    const sag = Math.sin(t * Math.PI) * 0.35;
    return { x, y: y - sag, color: CANDY[i % CANDY.length] };
  });
  return (
    <group>
      {flags.map((f, i) => (
        <group key={i} position={[f.x, f.y, z]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.16, 0.34, 3]} />
            <meshStandardMaterial color={f.color} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Stack of colorful building blocks */
const BlockStack = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {[0, 1, 2, 3].map((i) => (
      <mesh
        key={i}
        position={[Math.sin(i) * 0.06, 0.18 + i * 0.36, Math.cos(i) * 0.06]}
        rotation={[0, i * 0.4, 0]}
        castShadow
      >
        <boxGeometry args={[0.36, 0.36, 0.36]} />
        <meshStandardMaterial color={CANDY[i % CANDY.length]} roughness={0.4} />
      </mesh>
    ))}
  </group>
);

/** Spinning pinwheel / carousel style ceiling mobile */
const CeilingMobile = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.35;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[0.7, 0.7, 0.06, 24]} />
          <meshStandardMaterial color="#ffd166" />
        </mesh>
        {CANDY.map((c, i) => {
          const a = (i / CANDY.length) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.6, -0.3, Math.sin(a) * 0.6]}>
              <sphereGeometry args={[0.14, 14, 14]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.35} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

/** Potted plant for a homely corner */
const Plant = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.22, 0]} castShadow>
      <cylinderGeometry args={[0.26, 0.2, 0.44, 16]} />
      <meshStandardMaterial color="#e07a5f" />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <mesh
          key={i}
          position={[Math.cos(a) * 0.16, 0.68, Math.sin(a) * 0.16]}
          rotation={[Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5]}
        >
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color={i % 2 ? '#57cc99' : '#38a3a5'} />
        </mesh>
      );
    })}
  </group>
);

interface DecorationsProps {
  room: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export const Decorations = ({ room }: DecorationsProps) => {
  const width = room.maxX - room.minX;

  // Checkerboard floor tiles (colored accents only, over the base floor)
  const tiles: { x: number; z: number; color: string }[] = [];
  const step = 2;
  for (let x = room.minX + step / 2; x < room.maxX; x += step) {
    for (let z = room.minZ + step / 2; z < room.maxZ; z += step) {
      const ix = Math.round((x - room.minX) / step);
      const iz = Math.round((z - room.minZ) / step);
      if ((ix + iz) % 2 === 0) continue;
      tiles.push({ x, z, color: (ix + iz) % 4 === 1 ? '#ffc9d8' : '#bfe6f7' });
    }
  }

  return (
    <group>
      {/* Colored floor tiles */}
      {tiles.map((t, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[t.x, 0.01, t.z]} receiveShadow>
          <planeGeometry args={[step * 0.96, step * 0.96]} />
          <meshStandardMaterial color={t.color} />
        </mesh>
      ))}

      {/* Central welcome rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 6]}>
        <circleGeometry args={[2.2, 40]} />
        <meshStandardMaterial color="#ff9e8a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 6]}>
        <ringGeometry args={[1.3, 1.6, 40]} />
        <meshStandardMaterial color="#fff1e6" />
      </mesh>

      {/* Candy stripes along the side walls */}
      {Array.from({ length: 8 }, (_, i) => {
        const z = room.minZ + 1.5 + i * 3;
        return (
          <group key={`stripe-${i}`}>
            <mesh position={[room.minX + 0.05, 1.7, z]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[1.4, 3.4]} />
              <meshStandardMaterial color={CANDY[i % CANDY.length]} opacity={0.8} transparent />
            </mesh>
            <mesh position={[room.maxX - 0.05, 1.7, z]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[1.4, 3.4]} />
              <meshStandardMaterial
                color={CANDY[(i + 3) % CANDY.length]}
                opacity={0.8}
                transparent
              />
            </mesh>
          </group>
        );
      })}

      {/* Bunting garlands across the room */}
      <Bunting fromX={room.minX + 0.5} toX={room.maxX - 0.5} z={4} y={3.05} />
      <Bunting fromX={room.minX + 0.5} toX={room.maxX - 0.5} z={-3} y={3.05} />

      {/* Balloon bunches at the entrance */}
      {[-3.4, -2.7, -3.1].map((x, i) => (
        <Balloon
          key={i}
          position={[x, 2.1 + i * 0.25, 8.4 + i * 0.3]}
          color={CANDY[i]}
          phase={i * 1.7}
        />
      ))}
      {[6.6, 7.2].map((x, i) => (
        <Balloon
          key={`b2-${i}`}
          position={[x - 0.6, 2.2 + i * 0.2, -8]}
          color={CANDY[i + 3]}
          phase={i * 2.3}
        />
      ))}

      {/* Ceiling mobiles */}
      <group scale={0.62}>
        <CeilingMobile position={[-9.7, 4.3, 3]} />
        <CeilingMobile position={[9.7, 4.3, -5]} />
      </group>

      {/* Corner props */}
      <BlockStack position={[-6.6, 0, 8.4]} />
      <BlockStack position={[6.4, 0, 5.4]} />
      <Plant position={[-6.8, 0, -10.6]} />
      <Plant position={[6.8, 0, -10.6]} />

      {/* Warm glow strips near the ceiling */}
      <mesh position={[0, 3.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 0.5, 6]} />
        <meshStandardMaterial color="#fff8e7" emissive="#ffe9b8" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
};
