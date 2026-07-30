import { Suspense, useState } from 'react';
import { Html, Image } from '@react-three/drei';
import type { Toy } from '@/hooks/useToys';
import { dragState } from './PlayerControls';

interface ToyBoxProps {
  toy: Toy;
  position: [number, number, number];
  onSelect: (toy: Toy) => void;
  inCart: boolean;
}

const Fallback = () => (
  <mesh>
    <boxGeometry args={[0.7, 0.7, 0.08]} />
    <meshStandardMaterial color="#e8d9c5" />
  </mesh>
);

const ToyImage = ({ url }: { url: string }) => (
  <Image url={url} scale={[0.72, 0.72]} position={[0, 0, 0.06]} transparent />
);

export const ToyBox = ({ toy, position, onSelect, inCart }: ToyBoxProps) => {
  const [hovered, setHovered] = useState(false);
  const image = toy.images?.[0];

  return (
    <group
      position={position}
      scale={hovered ? 1.08 : 1}
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
        <boxGeometry args={[0.8, 0.8, 0.12]} />
        <meshStandardMaterial color={inCart ? '#7bc47f' : hovered ? '#ffd6a5' : '#fffaf3'} />
      </mesh>

      {image ? (
        <Suspense fallback={<Fallback />}>
          <ToyImage url={image} />
        </Suspense>
      ) : (
        <Fallback />
      )}

      {/* Label */}
      <Html
        position={[0, -0.56, 0.14]}
        center
        distanceFactor={5}
        occlude={false}
        style={{ pointerEvents: 'none', direction: 'rtl' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            background: '#fffdf8',
            border: '2px solid #6b4423',
            borderRadius: 999,
            padding: '5px 12px',
            fontSize: 17,
            fontWeight: 800,
            color: '#2a1c11',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}
        >
          <span>{toy.toy_name}</span>
          <span
            style={{
              background: '#2e7d32',
              color: '#fff',
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            ₪{toy.price}
          </span>
        </div>
      </Html>

      {hovered && (
        <Html position={[0, 0.62, 0.1]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              background: '#6b4423',
              color: '#fff',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            לחצו לצפייה
          </div>
        </Html>
      )}
    </group>
  );
};
