import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Html, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TextPlate } from './TextPlate';
import { CONDITION_LABELS } from '@/types/toy';

import type { Toy } from '@/hooks/useToys';
import { dragState } from './PlayerControls';

interface ToyBoxProps {
  toy: Toy;
  position: [number, number, number];
  onSelect: (toy: Toy) => void;
  inCart: boolean;
}

const CARD_W = 1.4;
const CARD_H = 0.85;

const Fallback = () => (
  <mesh position={[0, 0, 0.07]}>
    <planeGeometry args={[CARD_W - 0.16, CARD_H - 0.16]} />
    <meshStandardMaterial color="#e8d9c5" />
  </mesh>
);

/**
 * Sharp toy photo: full anisotropic filtering + mipmaps so the picture stays
 * crisp from across the store and while the player is walking.
 */
const ToyImage = ({ url }: { url: string }) => {
  const texture = useTexture(url) as THREE.Texture;
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture, gl]);

  // Fit the photo inside the card without stretching it
  const size = useMemo<[number, number]>(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    const ratio = img?.width && img?.height ? img.width / img.height : 1;
    const maxW = CARD_W - 0.14;
    const maxH = CARD_H - 0.14;
    return ratio >= maxW / maxH ? [maxW, maxW / ratio] : [maxH * ratio, maxH];
  }, [texture]);

  return (
    <mesh position={[0, 0, 0.075]}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  );
};

export const ToyBox = ({ toy, position, onSelect, inCart }: ToyBoxProps) => {
  const [hovered, setHovered] = useState(false);
  const root = useRef<THREE.Group>(null);
  const image = toy.images?.[0];
  const createdAt = Date.parse(toy.created_at);
  const isNew = Number.isFinite(createdAt) && Date.now() - createdAt < 14 * 24 * 60 * 60 * 1000;

  useFrame((_, delta) => {
    if (!root.current) return;
    const target = hovered ? 1.065 : 1;
    const scale = THREE.MathUtils.lerp(root.current.scale.x, target, 1 - Math.exp(-14 * delta));
    root.current.scale.setScalar(scale);
    root.current.position.y = position[1] + (hovered ? 0.055 : 0);
  });

  return (
    <group
      ref={root}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (dragState.dragging) return;
        onSelect(toy);
      }}
    >
      {/* Toy box body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[CARD_W, CARD_H, 0.14]} />
        <meshStandardMaterial
          color={inCart ? '#7bc47f' : hovered ? '#ffd6a5' : '#fffaf3'}
          emissive={hovered ? '#ffbf69' : '#000000'}
          emissiveIntensity={hovered ? 0.18 : 0}
        />
      </mesh>

      {image ? (
        <Suspense fallback={<Fallback />}>
          <ToyImage url={image} />
        </Suspense>
      ) : (
        <Fallback />
      )}

      {(inCart || isNew) && (
        <TextPlate
          lines={[inCart ? 'נבחר 💛' : 'חדש']}
          width={0.5}
          height={0.18}
          position={[0.43, 0.31, 0.082]}
          bg={inCart ? '#2e7d32' : '#c1440e'}
          color="#ffffff"
        />
      )}

      {/* Price tag physically clipped to the shelf edge below the toy */}
      <group position={[0, -0.5, 0.32]}>
        <mesh castShadow>
          <boxGeometry args={[1.3, 0.3, 0.04]} />
          <meshStandardMaterial color="#fffdf8" />
        </mesh>
        <mesh position={[0, 0, -0.021]}>
          <boxGeometry args={[1.38, 0.36, 0.02]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        <TextPlate
          lines={[`₪${toy.price} · ${toy.toy_name}`]}
          width={1.24}
          height={0.26}
          position={[0, 0, 0.025]}
        />
      </group>

      {hovered && (
        <Html position={[0, CARD_H / 2 + 0.28, 0.1]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              background: '#6b4423',
              color: '#fff',
              borderRadius: 12,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: '0 6px 18px rgba(62, 36, 16, 0.28)',
            }}
          >
            <div>{toy.toy_name} · ₪{toy.price}</div>
            <div style={{ fontSize: 10, opacity: 0.82 }}>
              {CONDITION_LABELS[toy.condition]} · {toy.city} · לחצו לפרטים
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
