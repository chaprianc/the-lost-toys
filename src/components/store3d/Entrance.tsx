import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { TextPlate } from './TextPlate';

interface EntranceProps {
  room: { minX: number; maxX: number; minZ: number; maxZ: number };
}

const GLASS = '#cdeaf5';

/** A small teddy bear shape used in the window displays */
const MiniTeddy = ({
  position,
  color = '#c89f6d',
}: {
  position: [number, number, number];
  color?: string;
}) => (
  <group position={position}>
    <mesh castShadow>
      <sphereGeometry args={[0.17, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.2, 0]} castShadow>
      <sphereGeometry args={[0.13, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
    <mesh position={[-0.1, 0.29, 0]}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0.1, 0.29, 0]}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </group>
);

/** Spinning pinwheel decoration */
const Pinwheel = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += d * 1.6;
  });
  return (
    <group position={position}>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
        <meshStandardMaterial color="#fffdf8" />
      </mesh>
      <group ref={ref as never}>
        {['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0'].map((c, i) => (
          <mesh key={c} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0.02]}>
            <planeGeometry args={[0.34, 0.14]} />
            <meshStandardMaterial color={c} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/**
 * Toy-shop style entrance: shop-front wall with glass double doors,
 * window displays, a striped awning, welcome mat and an entry arch.
 */
export const Entrance = ({ room }: EntranceProps) => {
  const doorL = useRef<Group>(null);
  const doorR = useRef<Group>(null);
  const z = room.maxZ - 0.08;

  // gentle swinging doors so the shop feels alive
  useFrame(({ clock }) => {
    const t = Math.sin(clock.getElapsedTime() * 0.7) * 0.12;
    if (doorL.current) doorL.current.rotation.y = t;
    if (doorR.current) doorR.current.rotation.y = -t;
  });

  return (
    <group>
      {/* ---- Shop front frame around the doors ---- */}
      <group position={[0, 0, z]} rotation={[0, Math.PI, 0]}>
        {/* side pillars */}
        {[-1.9, 1.9].map((x) => (
          <mesh key={x} position={[x, 1.25, 0]} castShadow>
            <boxGeometry args={[0.3, 2.5, 0.3]} />
            <meshStandardMaterial color="#6b4423" />
          </mesh>
        ))}
        {/* lintel */}
        <mesh position={[0, 2.6, 0]} castShadow>
          <boxGeometry args={[4.3, 0.35, 0.34]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        <TextPlate
          lines={['כניסה · ברוכים הבאים']}
          width={3.9}
          height={0.3}
          position={[0, 2.6, -0.19]}
          bg="#f7b267"
          color="#4a2c14"
        />

        {/* glass double doors */}
        <group ref={doorL} position={[-1.75, 0, 0]}>
          <group position={[0.85, 1.15, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 2.3, 0.07]} />
              <meshStandardMaterial color={GLASS} transparent opacity={0.45} roughness={0.1} />
            </mesh>
            <mesh position={[0.8, 0, 0]}>
              <boxGeometry args={[0.1, 2.3, 0.1]} />
              <meshStandardMaterial color="#8d5a2b" />
            </mesh>
            <mesh position={[0.62, 0, 0.09]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#ffd166" metalness={0.4} roughness={0.3} />
            </mesh>
          </group>
        </group>
        <group ref={doorR} position={[1.75, 0, 0]}>
          <group position={[-0.85, 1.15, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 2.3, 0.07]} />
              <meshStandardMaterial color={GLASS} transparent opacity={0.45} roughness={0.1} />
            </mesh>
            <mesh position={[-0.8, 0, 0]}>
              <boxGeometry args={[0.1, 2.3, 0.1]} />
              <meshStandardMaterial color="#8d5a2b" />
            </mesh>
            <mesh position={[-0.62, 0, 0.09]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#ffd166" metalness={0.4} roughness={0.3} />
            </mesh>
          </group>
        </group>

        {/* striped awning above the shop front */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh
            key={i}
            position={[-2 + i * 0.5, 3.02, -0.42]}
            rotation={[-0.5, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.5, 0.9, 0.05]} />
            <meshStandardMaterial color={i % 2 ? '#fffdf8' : '#ff6b6b'} />
          </mesh>
        ))}
      </group>

      {/* ---- Window displays flanking the doors ---- */}
      {[-5, 5].map((x) => (
        <group key={x} position={[x, 0, room.maxZ - 0.35]}>
          {/* Soft outdoor backdrop visible through the display glass. */}
          <mesh position={[0, 1.6, -0.09]}>
            <planeGeometry args={[3.35, 1.85]} />
            <meshBasicMaterial color="#bde4f3" />
          </mesh>
          {[-1.35, -0.75, -0.15, 0.5, 1.15].map((buildingX, index) => (
            <mesh
              key={buildingX}
              position={[buildingX, 1.15 + (index % 3) * 0.13, -0.075]}
            >
              <boxGeometry args={[0.48, 0.72 + (index % 3) * 0.25, 0.025]} />
              <meshStandardMaterial color={index % 2 ? '#d9c4a8' : '#c7b094'} roughness={0.9} />
            </mesh>
          ))}
          {/* window glass */}
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[3.4, 1.9, 0.06]} />
            <meshStandardMaterial
              color={GLASS}
              transparent
              opacity={0.2}
              roughness={0.06}
              metalness={0.08}
            />
          </mesh>
          {/* Wooden frame bars leave the view open instead of covering it. */}
          {[-1.78, 1.78].map((frameX) => (
            <mesh key={frameX} position={[frameX, 1.6, 0.035]} castShadow>
              <boxGeometry args={[0.14, 2.2, 0.1]} />
              <meshStandardMaterial color="#6b4423" roughness={0.72} />
            </mesh>
          ))}
          {[0.55, 2.65].map((frameY) => (
            <mesh key={frameY} position={[0, frameY, 0.035]} castShadow>
              <boxGeometry args={[3.7, 0.14, 0.1]} />
              <meshStandardMaterial color="#6b4423" roughness={0.72} />
            </mesh>
          ))}
          {/* Diagonal highlights suggest real reflected daylight. */}
          {[-0.72, 0.72].map((shineX) => (
            <mesh key={shineX} position={[shineX, 1.7, 0.055]} rotation={[0, 0, -0.42]}>
              <planeGeometry args={[0.12, 1.55]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
            </mesh>
          ))}
          {/* display ledge */}
          <mesh position={[0, 0.62, -0.22]} castShadow receiveShadow>
            <boxGeometry args={[3.4, 0.12, 0.6]} />
            <meshStandardMaterial color="#fff4e4" />
          </mesh>
          <MiniTeddy position={[-1, 0.85, -0.25]} />
          <MiniTeddy position={[1, 0.85, -0.25]} color="#e8b4b8" />
          <mesh position={[0, 0.85, -0.25]} castShadow>
            <boxGeometry args={[0.34, 0.34, 0.34]} />
            <meshStandardMaterial color="#4cc9f0" />
          </mesh>
          <TextPlate
            lines={['צעצועים חדשים']}
            width={2.2}
            height={0.3}
            position={[0, 2.45, -0.1]}
            rotation={[0, Math.PI, 0]}
            bg="#c8e6a0"
            color="#2f4d15"
          />
        </group>
      ))}

      {/* ---- Welcome mat + entry path ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, room.maxZ - 1.5]} receiveShadow>
        <planeGeometry args={[3.2, 1.5]} />
        <meshStandardMaterial color="#c1440e" />
      </mesh>
      <TextPlate
        lines={['ברוכים הבאים']}
        width={2.6}
        height={0.7}
        position={[0, 0.02, room.maxZ - 1.5]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        bg="#c1440e"
        color="#fff6e5"
      />

      {/* ---- Balloon arch just inside the door ---- */}
      {Array.from({ length: 11 }).map((_, i) => {
        const t = i / 10;
        const angle = Math.PI * t;
        const bx = -2.4 + t * 4.8;
        const by = 0.4 + Math.sin(angle) * 2.5;
        const colors = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0', '#c77dff'];
        return (
          <mesh key={i} position={[bx, by, room.maxZ - 2.6]} castShadow>
            <sphereGeometry args={[0.24, 16, 16]} />
            <meshStandardMaterial color={colors[i % colors.length]} roughness={0.25} />
          </mesh>
        );
      })}

      <Pinwheel position={[-3.2, 1.1, room.maxZ - 2.2]} />
      <Pinwheel position={[3.2, 1.1, room.maxZ - 2.2]} />
    </group>
  );
};
