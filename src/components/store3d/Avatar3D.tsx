import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Group } from 'three';
import { playerState } from './PlayerControls';
import type { AvatarProfile } from '@/hooks/useAvatar';
import { TextPlate } from './TextPlate';

interface Avatar3DProps {
  avatar: AvatarProfile;
}

/** Third-person character that walks around the store with the player. */
export const Avatar3D = ({ avatar }: Avatar3DProps) => {
  const root = useRef<Group>(null);
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const armL = useRef<THREE.Mesh>(null);
  const armR = useRef<THREE.Mesh>(null);
  const step = useRef(0);

  const isGirl = avatar.gender === 'girl';
  const skin = '#f6c8a0';
  const hair = isGirl ? '#6b3e26' : '#3b2617';

  useFrame((_, delta) => {
    const g = root.current;
    if (!g) return;
    g.position.set(playerState.x, 0, playerState.z);
    g.rotation.y = playerState.yaw + Math.PI;

    if (playerState.moving) step.current += delta * 9;
    const swing = playerState.moving ? Math.sin(step.current) * 0.5 : 0;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.7;
    if (armR.current) armR.current.rotation.x = swing * 0.7;
    g.position.y = playerState.moving ? Math.abs(Math.sin(step.current)) * 0.04 : 0;
  });

  return (
    <group ref={root}>
      {/* legs */}
      <mesh ref={legL} position={[-0.12, 0.38, 0]} castShadow>
        <capsuleGeometry args={[0.075, 0.36, 4, 8]} />
        <meshStandardMaterial color="#3d5a80" />
      </mesh>
      <mesh ref={legR} position={[0.12, 0.38, 0]} castShadow>
        <capsuleGeometry args={[0.075, 0.36, 4, 8]} />
        <meshStandardMaterial color="#3d5a80" />
      </mesh>

      {/* body */}
      {isGirl ? (
        <mesh position={[0, 0.78, 0]} castShadow>
          <coneGeometry args={[0.32, 0.62, 16]} />
          <meshStandardMaterial color={avatar.shirt} />
        </mesh>
      ) : (
        <mesh position={[0, 0.82, 0]} castShadow>
          <capsuleGeometry args={[0.19, 0.36, 4, 12]} />
          <meshStandardMaterial color={avatar.shirt} />
        </mesh>
      )}

      {/* arms */}
      <mesh ref={armL} position={[-0.28, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.32, 4, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh ref={armR} position={[0.28, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.32, 4, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      {/* head */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.19, 20, 20]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* hair */}
      <mesh position={[0, 1.38, 0]}>
        <sphereGeometry args={[0.2, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      {isGirl && (
        <>
          <mesh position={[-0.19, 1.24, -0.02]}>
            <sphereGeometry args={[0.09, 14, 14]} />
            <meshStandardMaterial color={hair} />
          </mesh>
          <mesh position={[0.19, 1.24, -0.02]}>
            <sphereGeometry args={[0.09, 14, 14]} />
            <meshStandardMaterial color={hair} />
          </mesh>
          <mesh position={[0, 1.47, 0.12]}>
            <torusGeometry args={[0.07, 0.025, 10, 18]} />
            <meshStandardMaterial color="#ff477e" />
          </mesh>
        </>
      )}
      {/* eyes */}
      <mesh position={[-0.07, 1.32, 0.17]}>
        <sphereGeometry args={[0.026, 10, 10]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
      <mesh position={[0.07, 1.32, 0.17]}>
        <sphereGeometry args={[0.026, 10, 10]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>

      {avatar.name && (
        <TextPlate
          lines={[avatar.name]}
          width={1.1}
          height={0.3}
          position={[0, 1.78, 0]}
          bg="#ffffff"
          color="#4a2c14"
        />
      )}
    </group>
  );
};
