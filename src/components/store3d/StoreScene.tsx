import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Toy } from '@/hooks/useToys';
import { CATEGORY_LABELS, CATEGORY_ICONS, type ToyCategory } from '@/types/toy';
import { ShelfUnit } from './ShelfUnit';
import { PlayerControls, type Collider, type JoystickVector, dragState } from './PlayerControls';
import { ToyCar } from './ToyCar';


export const ROOM = { minX: -8, maxX: 8, minZ: -12, maxZ: 12 };

const SHELVES: {
  position: [number, number, number];
  rotationY: number;
  color: string;
  category: ToyCategory;
}[] = [
  { position: [-4.5, 0, -6], rotationY: Math.PI / 2, color: '#f7b267', category: 'vehicles' },
  { position: [-4.5, 0, 1], rotationY: Math.PI / 2, color: '#8ecae6', category: 'dolls' },
  { position: [4.5, 0, -6], rotationY: -Math.PI / 2, color: '#c8e6a0', category: 'board-games' },
  { position: [4.5, 0, 1], rotationY: -Math.PI / 2, color: '#ffadad', category: 'educational' },
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
  { minX: 1.9, maxX: 3.5, minZ: 7.3, maxZ: 9.9 },
];


interface StoreSceneProps {
  toys: Toy[];
  joystick: React.MutableRefObject<JoystickVector>;
  onSelectToy: (toy: Toy) => void;
  onCheckout: () => void;
  isInCart: (id: string) => boolean;
  paused: boolean;
  activeCategory: ToyCategory | null;
  onSelectCategory: (category: ToyCategory) => void;
}

export const StoreScene = ({
  toys,
  joystick,
  onSelectToy,
  onCheckout,
  isInCart,
  paused,
  activeCategory,
  onSelectCategory,
}: StoreSceneProps) => {
  const width = ROOM.maxX - ROOM.minX;
  const depth = ROOM.maxZ - ROOM.minZ;

  const shelfCategories = SHELVES.map((s) => s.category) as string[];
  // Toys from categories without a dedicated shelf are spread across the shelves
  const leftovers = toys.filter((t) => !shelfCategories.includes(t.category));
  const byCategory = (category: ToyCategory) => {
    if (activeCategory && activeCategory !== category) return [];
    const index = shelfCategories.indexOf(category);
    const own = toys.filter((t) => t.category === category);
    const extra = leftovers.filter((_, i) => i % SHELVES.length === index);
    return [...own, ...extra].slice(0, 4);
  };



  return (
    <Canvas shadows camera={{ fov: 70, near: 0.1, far: 100 }} dpr={[1, 1.5]}>
      <color attach="background" args={['#fdf6ec']} />
      <fog attach="fog" args={['#fdf6ec', 18, 40]} />

      <ambientLight intensity={1.15} />
      <hemisphereLight args={['#ffffff', '#e8d8c0', 0.9]} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} castShadow />
      <directionalLight position={[-6, 8, 6]} intensity={0.5} />
      <pointLight position={[0, 3.2, -6]} intensity={26} color="#fff1dd" distance={20} />
      <pointLight position={[0, 3.2, 4]} intensity={26} color="#fff1dd" distance={20} />
      {/* Shelf wash lights so toy images stay bright and readable */}
      {SHELVES.map((shelf) => (
        <pointLight
          key={`light-${shelf.category}`}
          position={[shelf.position[0] * 0.62, 2.4, shelf.position[2]]}
          intensity={18}
          color="#ffffff"
          distance={9}
        />
      ))}

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

      {/* Big store sign mounted on the wall ahead of the entrance */}
      <group position={[0, 2.6, ROOM.minZ + 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[7.4, 1.35, 0.16]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[7, 1.05, 0.06]} />
          <meshStandardMaterial color="#f7b267" />
        </mesh>
        <Html position={[0, 0, 0.16]} transform scale={0.34} occlude={false}>
          <div
            style={{
              direction: 'rtl',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              color: '#4a2c14',
              textShadow: '0 2px 0 rgba(255,255,255,0.5)',
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1 }}>
              🧸 צעצועים עם סיפור 🚗
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>להורים חכמים</div>
          </div>
        </Html>
      </group>

      {/* Toy car greeting visitors at the entrance */}
      <ToyCar position={[2.7, 0, 8.6]} rotationY={-Math.PI / 2} />


      {SHELVES.map((shelf) => (
        <ShelfUnit
          key={shelf.category}
          position={shelf.position}
          rotationY={shelf.rotationY}
          color={shelf.color}
          label={CATEGORY_LABELS[shelf.category]}
          icon={CATEGORY_ICONS[shelf.category]}
          toys={byCategory(shelf.category)}
          onSelect={onSelectToy}
          isInCart={isInCart}
          active={activeCategory === shelf.category}
          dimmed={!!activeCategory && activeCategory !== shelf.category}
          onSignClick={() => onSelectCategory(shelf.category)}
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
