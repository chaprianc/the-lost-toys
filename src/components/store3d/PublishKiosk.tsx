import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { TextPlate } from './TextPlate';
import { dragState } from './PlayerControls';

interface PublishKioskProps {
  position: [number, number, number];
  rotationY?: number;
  onPublish: () => void;
}

/**
 * A "publish your toy" kiosk standing near the store entrance.
 * Clicking it takes the visitor to the publishing form.
 */
export const PublishKiosk = ({ position, rotationY = 0, onPublish }: PublishKioskProps) => {
  const [hovered, setHovered] = useState(false);
  const arrow = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (arrow.current) {
      arrow.current.position.y = 2.5 + Math.sin(clock.getElapsedTime() * 1.6) * 0.08;
    }
  });

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (dragState.dragging) return;
        onPublish();
      }}
    >
      {/* base cabinet */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.1, 0.7]} />
        <meshStandardMaterial color={hovered ? '#3f8f45' : '#2e7d32'} />
      </mesh>
      <mesh position={[0, 1.14, 0]} castShadow>
        <boxGeometry args={[1.45, 0.1, 0.85]} />
        <meshStandardMaterial color="#fff4e4" />
      </mesh>

      {/* tilted screen */}
      <group position={[0, 1.5, 0.06]} rotation={[-0.35, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.25, 0.8, 0.08]} />
          <meshStandardMaterial color="#4a2c14" />
        </mesh>
        <TextPlate
          lines={['פרסום צעצוע', 'לחצו כאן']}
          width={1.1}
          height={0.66}
          position={[0, 0, 0.05]}
          bg="#fffdf8"
          color="#2f4d15"
        />
      </group>

      {/* top sign post */}
      <mesh position={[0, 2.05, -0.1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 10]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
      <group ref={arrow} position={[0, 2.5, -0.1]}>
        <mesh castShadow>
          <boxGeometry args={[2.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#f7b267" />
        </mesh>
        <TextPlate
          lines={['רוצים למכור צעצוע?']}
          width={1.95}
          height={0.38}
          position={[0, 0, 0.06]}
          bg="#f7b267"
          color="#4a2c14"
        />
        <TextPlate
          lines={['רוצים למכור צעצוע?']}
          width={1.95}
          height={0.38}
          position={[0, 0, -0.06]}
          rotation={[0, Math.PI, 0]}
          bg="#f7b267"
          color="#4a2c14"
        />
      </group>

      {/* small toy sample on the counter */}
      <mesh position={[0.45, 1.28, 0.18]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[-0.45, 1.3, 0.18]} castShadow>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <meshStandardMaterial color="#4cc9f0" />
      </mesh>
    </group>
  );
};
