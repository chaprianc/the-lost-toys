import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { TextPlate } from './TextPlate';

interface StoreLifeDetailsProps {
  room: { minX: number; maxX: number; minZ: number };
}

const WallClock = ({ position }: { position: [number, number, number] }) => {
  const hourHand = useRef<Group>(null);
  const minuteHand = useRef<Group>(null);
  const secondHand = useRef<Group>(null);
  const lastSecond = useRef(-1);

  useFrame(() => {
    const now = new Date();
    if (now.getSeconds() === lastSecond.current) return;
    lastSecond.current = now.getSeconds();
    const minutes = now.getMinutes() + now.getSeconds() / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    if (hourHand.current) hourHand.current.rotation.z = -(hours / 12) * Math.PI * 2;
    if (minuteHand.current) minuteHand.current.rotation.z = -(minutes / 60) * Math.PI * 2;
    if (secondHand.current) secondHand.current.rotation.z = -(now.getSeconds() / 60) * Math.PI * 2;
  });

  return (
    <group position={position}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.11, 32]} />
        <meshStandardMaterial color="#6b4423" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <circleGeometry args={[0.48, 32]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.42} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * 0.39, Math.cos(angle) * 0.39, 0.075]}
          >
            <boxGeometry args={[0.035, 0.085, 0.018]} />
            <meshStandardMaterial color="#4a2c14" />
          </mesh>
        );
      })}
      <group ref={hourHand} position={[0, 0, 0.09]}>
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.055, 0.28, 0.025]} />
          <meshStandardMaterial color="#3c2b22" />
        </mesh>
      </group>
      <group ref={minuteHand} position={[0, 0, 0.1]}>
        <mesh position={[0, 0.19, 0]}>
          <boxGeometry args={[0.035, 0.38, 0.022]} />
          <meshStandardMaterial color="#3c2b22" />
        </mesh>
      </group>
      <group ref={secondHand} position={[0, 0, 0.11]}>
        <mesh position={[0, 0.21, 0]}>
          <boxGeometry args={[0.014, 0.42, 0.018]} />
          <meshStandardMaterial color="#d1495b" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.125]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial color="#d1495b" />
      </mesh>
    </group>
  );
};

const CeilingFan = ({ position }: { position: [number, number, number] }) => {
  const blades = useRef<Group>(null);
  useFrame((_, delta) => {
    if (blades.current) blades.current.rotation.y += delta * 0.8;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.45, 10]} />
        <meshStandardMaterial color="#5b5149" metalness={0.25} roughness={0.5} />
      </mesh>
      <group ref={blades}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.2, 0.18, 16]} />
          <meshStandardMaterial color="#65574d" roughness={0.55} />
        </mesh>
        {Array.from({ length: 5 }, (_, index) => (
          <group key={index} rotation={[0, (index / 5) * Math.PI * 2, 0]}>
            <mesh position={[0.72, 0, 0]} rotation={[0, 0.08, 0]} castShadow>
              <boxGeometry args={[1.25, 0.045, 0.26]} />
              <meshStandardMaterial color="#9a7048" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, -0.17, 0]}>
        <sphereGeometry args={[0.17, 16, 12]} />
        <meshStandardMaterial color="#fff1ba" emissive="#ffe39b" emissiveIntensity={1.25} />
      </mesh>
    </group>
  );
};

const ShopProps = ({ room }: StoreLifeDetailsProps) => (
  <group>
    {/* Recycling bin. */}
    <group position={[room.minX + 0.62, 0, -8.4]}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.23, 0.76, 18]} />
        <meshStandardMaterial color="#496b61" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.29, 0.29, 0.08, 18]} />
        <meshStandardMaterial color="#365249" roughness={0.72} />
      </mesh>
    </group>

    {/* Slightly imperfect delivery boxes near the service area. */}
    {[
      { position: [room.maxX - 0.72, 0.28, -10.7] as [number, number, number], size: [0.72, 0.56, 0.7] as [number, number, number], turn: 0.09 },
      { position: [room.maxX - 1.3, 0.22, -10.35] as [number, number, number], size: [0.62, 0.44, 0.58] as [number, number, number], turn: -0.16 },
    ].map((box, index) => (
      <group key={index} position={box.position} rotation={[0, box.turn, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={box.size} />
          <meshStandardMaterial color={index ? '#cfa978' : '#d9b786'} roughness={0.92} />
        </mesh>
        <mesh position={[0, box.size[1] / 2 + 0.008, 0]}>
          <boxGeometry args={[0.11, 0.015, box.size[2] * 0.96]} />
          <meshStandardMaterial color="#a88058" roughness={0.88} />
        </mesh>
      </group>
    ))}

    {/* Wall posters add believable merchandising without extra image files. */}
    <TextPlate
      lines={['צעצועים שמחים', 'בית חדש']}
      width={2.3}
      height={0.88}
      position={[-4.55, 1.25, room.minZ + 0.14]}
      bg="#f9c8d4"
      color="#6a3040"
    />
    <TextPlate
      lines={['שומרים על העולם', 'קונים יד שנייה']}
      width={2.3}
      height={0.88}
      position={[-7.86, 1.25, -1.5]}
      rotation={[0, Math.PI / 2, 0]}
      bg="#c8e6d0"
      color="#285d3b"
    />
  </group>
);

export const StoreLifeDetails = ({ room }: StoreLifeDetailsProps) => (
  <group>
    <WallClock position={[-6.35, 2.55, room.minZ + 0.18]} />
    <CeilingFan position={[0, 3.05, -1.4]} />
    <ShopProps room={room} />
  </group>
);
