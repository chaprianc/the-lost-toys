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

const SKIN_TONES = ['#f6d0ae', '#e5ad7d', '#bd7b52', '#815037'];
const HAIR_COLORS = ['#2b1d18', '#5a3825', '#9a5d2e', '#d4a55f', '#202020'];
const PANTS_COLORS = ['#263d5a', '#415a77', '#51406d', '#3d5143', '#6b4935'];

const stableIndex = (value: string, length: number) =>
  [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % length;

/** Lightweight, human-proportioned cartoon avatar for the player and store visitors. */
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
  const appearanceKey = `${avatar.gender}-${avatar.shirt}-${avatar.name}`;
  const skin = SKIN_TONES[stableIndex(appearanceKey, SKIN_TONES.length)];
  const hair = HAIR_COLORS[stableIndex(`${appearanceKey}-hair`, HAIR_COLORS.length)];
  const pants = PANTS_COLORS[stableIndex(`${appearanceKey}-pants`, PANTS_COLORS.length)];
  const shoes = isGirl ? '#d94f7c' : '#294f8a';

  useFrame((state, delta) => {
    const character = root.current;
    if (!character) return;

    let moving = playerState.moving;
    if (path) {
      const phase = state.clock.elapsedTime * path.speed + path.offset;
      const progress = (Math.sin(phase) + 1) / 2;
      const x = THREE.MathUtils.lerp(path.from[0], path.to[0], progress);
      const z = THREE.MathUtils.lerp(path.from[1], path.to[1], progress);
      const direction = Math.cos(phase) >= 0 ? 1 : -1;
      const dx = (path.to[0] - path.from[0]) * direction;
      const dz = (path.to[1] - path.from[1]) * direction;
      character.position.set(x, 0, z);
      character.rotation.y = Math.atan2(dx, dz);
      moving = true;
    } else {
      character.position.set(playerState.x, 0, playerState.z);
      character.rotation.y = playerState.yaw + Math.PI;
    }

    idle.current += delta;
    if (moving) step.current += delta * 8;
    const swing = moving ? Math.sin(step.current) * 0.45 : 0;

    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.75;
    if (armR.current) armR.current.rotation.x = swing * 0.75;

    const bob = moving
      ? Math.abs(Math.sin(step.current)) * 0.035
      : Math.sin(idle.current * 2) * 0.01;
    character.position.y = bob;

    if (head.current) {
      head.current.rotation.z = moving
        ? Math.sin(step.current) * 0.025
        : Math.sin(idle.current * 1.4) * 0.025;
    }
  });

  return (
    <group ref={root}>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.14} />
      </mesh>

      {/* Longer legs and smaller shoes create more human proportions. */}
      <group ref={legL} position={[-0.105, 0.58, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.38, 4, 10]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.51, 0.055]} castShadow scale={[1, 0.7, 1.45]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={shoes} roughness={0.55} />
        </mesh>
      </group>
      <group ref={legR} position={[0.105, 0.58, 0]}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.38, 4, 10]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.51, 0.055]} castShadow scale={[1, 0.7, 1.45]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={shoes} roughness={0.55} />
        </mesh>
      </group>

      {/* Torso, shoulders and neck. */}
      <mesh position={[0, 1.02, 0]} castShadow scale={[1, 1.12, 0.72]}>
        <capsuleGeometry args={[0.2, 0.34, 4, 14]} />
        <meshStandardMaterial color={avatar.shirt} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow scale={[1.15, 0.55, 0.78]}>
        <sphereGeometry args={[0.19, 14, 12]} />
        <meshStandardMaterial color={pants} roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.36, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.085, 0.16, 12]} />
        <meshStandardMaterial color={skin} roughness={0.62} />
      </mesh>

      {/* Arms and hands. */}
      <group ref={armL} position={[-0.255, 1.23, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.052, 0.34, 4, 9]} />
          <meshStandardMaterial color={avatar.shirt} roughness={0.68} />
        </mesh>
        <mesh position={[0, -0.42, 0]} castShadow>
          <sphereGeometry args={[0.065, 12, 10]} />
          <meshStandardMaterial color={skin} roughness={0.62} />
        </mesh>
      </group>
      <group ref={armR} position={[0.255, 1.23, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.052, 0.34, 4, 9]} />
          <meshStandardMaterial color={avatar.shirt} roughness={0.68} />
        </mesh>
        <mesh position={[0, -0.42, 0]} castShadow>
          <sphereGeometry args={[0.065, 12, 10]} />
          <meshStandardMaterial color={skin} roughness={0.62} />
        </mesh>
      </group>

      {/* Smaller head with subtler facial features. */}
      <group ref={head} position={[0, 1.62, 0]}>
        <mesh castShadow scale={[0.92, 1.08, 0.9]}>
          <sphereGeometry args={[0.205, 22, 20]} />
          <meshStandardMaterial color={skin} roughness={0.58} />
        </mesh>

        {[-0.19, 0.19].map((x) => (
          <mesh key={x} position={[x, -0.005, 0]}>
            <sphereGeometry args={[0.045, 10, 9]} />
            <meshStandardMaterial color={skin} roughness={0.6} />
          </mesh>
        ))}

        <mesh position={[0, 0.055, -0.015]} scale={[0.95, 0.72, 0.95]}>
          <sphereGeometry args={[0.213, 22, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hair} roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.115, 0.13]} rotation={[0.45, 0, 0]} scale={[1.55, 0.55, 0.65]}>
          <sphereGeometry args={[0.1, 14, 12]} />
          <meshStandardMaterial color={hair} roughness={0.82} />
        </mesh>

        {isGirl && (
          <>
            <mesh position={[-0.18, -0.05, -0.02]} scale={[0.65, 1.6, 0.75]}>
              <sphereGeometry args={[0.095, 12, 10]} />
              <meshStandardMaterial color={hair} roughness={0.82} />
            </mesh>
            <mesh position={[0.18, -0.05, -0.02]} scale={[0.65, 1.6, 0.75]}>
              <sphereGeometry args={[0.095, 12, 10]} />
              <meshStandardMaterial color={hair} roughness={0.82} />
            </mesh>
          </>
        )}

        {[-0.07, 0.07].map((x) => (
          <group key={x} position={[x, 0.015, 0.18]}>
            <mesh scale={[1, 0.72, 0.45]}>
              <sphereGeometry args={[0.03, 12, 10]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.017]}>
              <sphereGeometry args={[0.014, 10, 8]} />
              <meshStandardMaterial color="#2d221d" roughness={0.25} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, -0.035, 0.195]} scale={[0.6, 1, 0.8]}>
          <sphereGeometry args={[0.026, 10, 8]} />
          <meshStandardMaterial color={skin} roughness={0.58} />
        </mesh>
        <mesh position={[0, -0.09, 0.188]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.04, 0.009, 8, 14, Math.PI]} />
          <meshStandardMaterial color="#9c4f49" roughness={0.5} />
        </mesh>
      </group>

      {avatar.name && (
        <TextPlate
          lines={[avatar.name]}
          width={1.1}
          height={0.3}
          position={[0, 2.04, 0]}
          bg="#ffffff"
          color="#4a2c14"
        />
      )}
    </group>
  );
};
