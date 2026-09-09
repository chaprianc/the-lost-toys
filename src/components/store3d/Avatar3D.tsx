import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Group } from 'three';
import { playerState } from './PlayerControls';
import type { AvatarProfile } from '@/hooks/useAvatar';
import { TextPlate } from './TextPlate';

interface VisitorPath {
  from: [number, number];
  to: [number, number];
  speed: number;
  offset: number;
}

interface Avatar3DProps {
  avatar: AvatarProfile;
  path?: VisitorPath;
}

/** Cute cartoon third-person character that walks around the store with the player. */
export const Avatar3D = ({ avatar, path }: Avatar3DProps) => {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const step = useRef(0);
  const idle = useRef(0);

  const isGirl = avatar.gender === 'girl';
  const skin = '#ffd9b8';
  const hair = isGirl ? '#8a4a2a' : '#4a2f1c';
  const shoes = isGirl ? '#ff5c8a' : '#2f6fd0';
  const pants = isGirl ? '#6c4bd1' : '#3d5a80';

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;

    let moving = playerState.moving;
    if (path) {
      const phase = state.clock.elapsedTime * path.speed + path.offset;
      const progress = (Math.sin(phase) + 1) / 2;
      const x = THREE.MathUtils.lerp(path.from[0], path.to[0], progress);
      const z = THREE.MathUtils.lerp(path.from[1], path.to[1], progress);
      const direction = Math.cos(phase) >= 0 ? 1 : -1;
      const dx = (path.to[0] - path.from[0]) * direction;
      const dz = (path.to[1] - path.from[1]) * direction;
      g.position.set(x, 0, z);
      g.rotation.y = Math.atan2(dx, dz);
      moving = true;
    } else {
      g.position.set(playerState.x, 0, playerState.z);
      g.rotation.y = playerState.yaw + Math.PI;
    }

    idle.current += delta;
    if (moving) step.current += delta * 9;
    const swing = moving ? Math.sin(step.current) * 0.6 : 0;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8;
    if (armR.current) armR.current.rotation.x = swing * 0.8;

    const bob = moving
      ? Math.abs(Math.sin(step.current)) * 0.05
      : Math.sin(idle.current * 2) * 0.015;
    g.position.y = bob;
    if (head.current) {
      head.current.rotation.z = moving ? Math.sin(step.current) * 0.06 : Math.sin(idle.current * 1.6) * 0.05;
    }
  });

  return (
    <group ref={root}>
      {/* shadow blob */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>

      {/* legs + shoes */}
      <group ref={legL} position={[-0.11, 0.44, 0]}>
        <mesh position={[0, -0.16, 0]} castShadow>
          <capsuleGeometry args={[0.072, 0.24, 4, 10]} />
          <meshStandardMaterial color={pants} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.33, 0.045]} castShadow>
          <sphereGeometry args={[0.095, 14, 12]} />
          <meshStandardMaterial color={shoes} roughness={0.5} />
        </mesh>
      </group>
      <group ref={legR} position={[0.11, 0.44, 0]}>
        <mesh position={[0, -0.16, 0]} castShadow>
          <capsuleGeometry args={[0.072, 0.24, 4, 10]} />
          <meshStandardMaterial color={pants} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.33, 0.045]} castShadow>
          <sphereGeometry args={[0.095, 14, 12]} />
          <meshStandardMaterial color={shoes} roughness={0.5} />
        </mesh>
      </group>

      {/* body */}
      {isGirl ? (
        <>
          <mesh position={[0, 0.62, 0]} castShadow>
            <coneGeometry args={[0.29, 0.42, 20]} />
            <meshStandardMaterial color={avatar.shirt} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.86, 0]} castShadow>
            <capsuleGeometry args={[0.16, 0.16, 4, 14]} />
            <meshStandardMaterial color={avatar.shirt} roughness={0.65} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 0.76, 0]} castShadow>
          <capsuleGeometry args={[0.185, 0.3, 4, 14]} />
          <meshStandardMaterial color={avatar.shirt} roughness={0.65} />
        </mesh>
      )}

      {/* arms + hands */}
      <group ref={armL} position={[-0.24, 0.92, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.2, 4, 10]} />
          <meshStandardMaterial color={avatar.shirt} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.27, 0]} castShadow>
          <sphereGeometry args={[0.068, 14, 12]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>
      <group ref={armR} position={[0.24, 0.92, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.2, 4, 10]} />
          <meshStandardMaterial color={avatar.shirt} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.27, 0]} castShadow>
          <sphereGeometry args={[0.068, 14, 12]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      </group>

      {/* head group (big & cute) */}
      <group ref={head} position={[0, 1.24, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.235, 26, 24]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>

        {/* hair cap */}
        <mesh position={[0, 0.045, 0]}>
          <sphereGeometry args={[0.245, 26, 24, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
          <meshStandardMaterial color={hair} roughness={0.8} />
        </mesh>
        {/* fringe */}
        <mesh position={[0, 0.1, 0.15]} rotation={[0.5, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 14]} />
          <meshStandardMaterial color={hair} roughness={0.8} />
        </mesh>

        {isGirl ? (
          <>
            {/* pigtails */}
            <mesh position={[-0.235, -0.02, -0.03]}>
              <sphereGeometry args={[0.1, 16, 14]} />
              <meshStandardMaterial color={hair} roughness={0.8} />
            </mesh>
            <mesh position={[0.235, -0.02, -0.03]}>
              <sphereGeometry args={[0.1, 16, 14]} />
              <meshStandardMaterial color={hair} roughness={0.8} />
            </mesh>
            {/* bow */}
            <mesh position={[0, 0.2, 0.1]} rotation={[0.3, 0, 0]}>
              <torusGeometry args={[0.06, 0.026, 12, 20]} />
              <meshStandardMaterial color="#ff477e" roughness={0.4} />
            </mesh>
          </>
        ) : (
          /* little cap brim */
          <mesh position={[0, 0.16, 0.16]} rotation={[-0.35, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.02, 18]} />
            <meshStandardMaterial color={avatar.shirt} roughness={0.6} />
          </mesh>
        )}

        {/* eyes: white + pupil + sparkle */}
        {[-0.082, 0.082].map((x) => (
          <group key={x} position={[x, 0.02, 0.2]}>
            <mesh>
              <sphereGeometry args={[0.045, 16, 14]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.032]}>
              <sphereGeometry args={[0.026, 14, 12]} />
              <meshStandardMaterial color="#241a12" roughness={0.2} />
            </mesh>
            <mesh position={[0.012, 0.014, 0.052]}>
              <sphereGeometry args={[0.009, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* rosy cheeks */}
        <mesh position={[-0.15, -0.06, 0.17]}>
          <sphereGeometry args={[0.045, 14, 12]} />
          <meshStandardMaterial color="#ff9aa8" transparent opacity={0.7} roughness={0.9} />
        </mesh>
        <mesh position={[0.15, -0.06, 0.17]}>
          <sphereGeometry args={[0.045, 14, 12]} />
          <meshStandardMaterial color="#ff9aa8" transparent opacity={0.7} roughness={0.9} />
        </mesh>

        {/* smile */}
        <mesh position={[0, -0.075, 0.205]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.05, 0.012, 10, 16, Math.PI]} />
          <meshStandardMaterial color="#b2503f" roughness={0.5} />
        </mesh>

        {/* nose */}
        <mesh position={[0, -0.015, 0.228]}>
          <sphereGeometry args={[0.022, 12, 10]} />
          <meshStandardMaterial color="#f3b891" roughness={0.6} />
        </mesh>
      </group>

      {avatar.name && (
        <TextPlate
          lines={[avatar.name]}
          width={1.1}
          height={0.3}
          position={[0, 1.82, 0]}
          bg="#ffffff"
          color="#4a2c14"
        />
      )}
    </group>
  );
};
