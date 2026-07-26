import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Toy } from '@/hooks/useToys';
import { ShelfUnit } from './ShelfUnit';
import { PlayerControls, type Collider, type JoystickVector, dragState } from './PlayerControls';

export const ROOM = { minX: -8, maxX: 8, minZ: -12, maxZ: 12 };

const SHELVES: { position: [number, number, number]; rotationY: number; color: string }[] = [
  { position: [-4.5, 0, -6], rotationY: Math.PI / 2, color: '#f7b267' },
  { position: [-4.5, 0, 1], rotationY: Math.PI / 2, color: '#8ecae6' },
  { position: [4.5, 0, -6], rotationY: -Math.PI / 2, color: '#c8e6a0' },
  { position: [4.5, 0, 1], rotationY: -Math.PI / 2, color: '#ffadad' },
];

const COUNTER = { x: 0, z: -10.5, w: 3.4, d: 1.2 };

export const COLLIDERS: Collider[] = [
  ...SHELVES.map(({ position }) => ({
    minX: position[0] - 0.6,
    maxX: position[0] + 0.6,
    minZ: position[2] - 3,
    maxZ: position[2] + 3,
  })),
  {
    minX: COUNTER.x - COUNTER.w / 2,
    maxX: COUNTER.x + COUNTER.w / 2,
    minZ: COUNTER.z - COUNTER.d / 2,
    maxZ: COUNTER.z + COUNTER.d / 2,
  },
];

interface StoreSceneProps {
  toys: Toy[];
  joystick: React.MutableRefObject<JoystickVector>;
  onSelectToy: (toy: Toy) => void;
  onCheckout: () => void;
  isInCart: (id: string) => boolean;
  paused: boolean;
}

export const StoreScene = ({
  toys,
  joystick,
  onSelectToy,
  onCheckout,
  isInCart,
  paused,
}: StoreSceneProps) => {
  const width = ROOM.maxX - ROOM.minX;
  const depth = ROOM.maxZ - ROOM.minZ;

  return (
    <Canvas shadows camera={{ fov: 70, near: 0.1, far: 100 }} dpr={[1, 1.5]}>
      <color attach="background" args={['#fdf6ec']} />
      <fog attach="fog" args={['#fdf6ec', 18, 40]} />

      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#fff3e0', '#d9c5aa', 0.6]} />
      <directionalLight position={[6, 10, 6]} intensity={0.9} castShadow />
      <pointLight position={[0, 4, -6]} intensity={20} color="#ffd6a5" distance={18} />
      <pointLight position={[0, 4, 4]} intensity={20} color="#ffd6a5" distance={18} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#f2e2cd" />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.4, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#fffdf8" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.7, ROOM.minZ]}>
        <planeGeometry args={[width, 3.4]} />
        <meshStandardMaterial color="#ffe3c2" />
      </mesh>
      <mesh position={[0, 1.7, ROOM.maxZ]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, 3.4]} />
        <meshStandardMaterial color="#ffe3c2" />
      </mesh>
      <mesh position={[ROOM.minX, 1.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 3.4]} />
        <meshStandardMaterial color="#d8f0f5" />
      </mesh>
      <mesh position={[ROOM.maxX, 1.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 3.4]} />
        <meshStandardMaterial color="#d8f0f5" />
      </mesh>

      {/* Store sign near the entrance wall */}
      <Html position={[0, 2.8, ROOM.minZ + 0.2]} center distanceFactor={9} occlude={false}>
        <div
          style={{
            direction: 'rtl',
            whiteSpace: 'nowrap',
            background: '#6b4423',
            color: '#fff7ec',
            padding: '10px 26px',
            borderRadius: 16,
            fontSize: 22,
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
          }}
        >
          🧸 חנות הצעצועים 🚗
        </div>
      </Html>

      {SHELVES.map((shelf, i) => (
        <ShelfUnit
          key={i}
          position={shelf.position}
          rotationY={shelf.rotationY}
          color={shelf.color}
          toys={toys.slice(i * 4, i * 4 + 4)}
          onSelect={onSelectToy}
          isInCart={isInCart}
        />
      ))}

      {/* Checkout counter */}
      <group
        position={[COUNTER.x, 0, COUNTER.z]}
        onClick={(e) => {
          e.stopPropagation();
          if (dragState.dragging) return;
          onCheckout();
        }}
      >
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[COUNTER.w, 1.1, COUNTER.d]} />
          <meshStandardMaterial color="#b5651d" />
        </mesh>
        <mesh position={[0, 1.14, 0]} castShadow>
          <boxGeometry args={[COUNTER.w + 0.2, 0.1, COUNTER.d + 0.2]} />
          <meshStandardMaterial color="#fff4e4" />
        </mesh>
        <Html position={[0, 1.75, 0]} center distanceFactor={8} occlude={false}>
          <div
            style={{
              direction: 'rtl',
              whiteSpace: 'nowrap',
              background: '#2e7d32',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            💳 קופה
          </div>
        </Html>
      </group>

      <PlayerControls
        joystick={joystick}
        colliders={COLLIDERS}
        bounds={ROOM}
        enabled={!paused}
      />
    </Canvas>
  );
};
