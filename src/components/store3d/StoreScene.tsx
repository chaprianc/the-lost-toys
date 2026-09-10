import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Toy } from '@/hooks/useToys';
import { CATEGORY_LABELS, CATEGORY_ICONS, type ToyCategory } from '@/types/toy';
import { ShelfUnit } from './ShelfUnit';
import { TextPlate } from './TextPlate';

import { PlayerControls, type Collider, type JoystickVector, dragState } from './PlayerControls';
import { ToyCar } from './ToyCar';
import { Decorations } from './Decorations';
import { Entrance } from './Entrance';
import { PublishKiosk } from './PublishKiosk';
import { ServiceCounter } from './ServiceCounter';

import { Avatar3D } from './Avatar3D';

import { SHIRT_COLORS, type AvatarProfile } from '@/hooks/useAvatar';



export const ROOM = { minX: -8, maxX: 8, minZ: -12, maxZ: 12 };

const SHELVES: {
  position: [number, number, number];
  rotationY: number;
  color: string;
  category: ToyCategory;
}[] = [
  { position: [-4.3, 0, -4], rotationY: Math.PI / 2, color: '#f7b267', category: 'vehicles' },
  { position: [-4.3, 0, 3.2], rotationY: Math.PI / 2, color: '#8ecae6', category: 'dolls' },
  { position: [4.3, 0, -4], rotationY: -Math.PI / 2, color: '#c8e6a0', category: 'board-games' },
  { position: [4.3, 0, 3.2], rotationY: -Math.PI / 2, color: '#ffadad', category: 'educational' },
];


const COUNTER = { x: 0, z: -10.5, w: 3.4, d: 1.2 };
const CLERK_AVATAR: AvatarProfile = {
  gender: 'girl',
  name: '',
  shirt: '#4f8f72',
};

const VISITOR_PATHS = [
  { from: [0, -7] as [number, number], to: [0, 6] as [number, number], speed: 0.22 },
  { from: [-2.8, -1] as [number, number], to: [2.8, -1] as [number, number], speed: 0.28 },
  { from: [-6.3, -7] as [number, number], to: [-6.3, 6] as [number, number], speed: 0.18 },
  { from: [6.3, -7] as [number, number], to: [6.3, 6] as [number, number], speed: 0.2 },
];

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
  // publish kiosk moved to the left side of the entrance
  { minX: -7.3, maxX: -5.7, minZ: 8.4, maxZ: 9.6 },
];


interface StoreSceneProps {
  toys: Toy[];
  joystick: React.MutableRefObject<JoystickVector>;
  onSelectToy: (toy: Toy) => void;
  onCheckout: () => void;
  onPublish: () => void;
  isInCart: (id: string) => boolean;
  paused: boolean;
  activeCategory: ToyCategory | null;
  onSelectCategory: (category: ToyCategory) => void;
  avatar: AvatarProfile | null;
}


export const StoreScene = ({
  toys,
  joystick,
  onSelectToy,
  onCheckout,
  onPublish,
  isInCart,
  paused,
  activeCategory,
  onSelectCategory,
  avatar,
}: StoreSceneProps) => {


  const width = ROOM.maxX - ROOM.minX;
  const depth = ROOM.maxZ - ROOM.minZ;
  const visitors = useMemo(
    () =>
      VISITOR_PATHS.map((path, index) => ({
        id: `visitor-${index}`,
        avatar: {
          gender: Math.random() > 0.5 ? ('girl' as const) : ('boy' as const),
          name: '',
          shirt: SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)],
        },
        path: { ...path, offset: Math.random() * Math.PI * 2 },
      })),
    []
  );

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
    <Canvas
      shadows
      camera={{ fov: 70, near: 0.1, far: 100 }}
      dpr={[1, 1.4]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#fdf6ec']} />
      <fog attach="fog" args={['#fdf6ec', 18, 40]} />

      <ambientLight intensity={0.62} />
      <hemisphereLight args={['#ffffff', '#ffd6a5', 0.45]} />
      <directionalLight
        position={[6, 10, 12]}
        intensity={0.95}
        color="#fff7e8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, 8, 6]} intensity={0.5} />
      <pointLight position={[0, 3.2, -6]} intensity={26} color="#fff1dd" distance={20} />
      <pointLight position={[0, 3.2, 4]} intensity={26} color="#fff1dd" distance={20} />
      {/* Playful colored accent lights */}
      <pointLight position={[-6, 2.6, 8]} intensity={14} color="#ffb3c1" distance={12} />
      <pointLight position={[6, 2.6, 8]} intensity={14} color="#8ecae6" distance={12} />
      <pointLight position={[0, 2.8, -10]} intensity={16} color="#ffe066" distance={12} />
      {/* Entrance glow so the shop front reads clearly */}
      <pointLight position={[0, 2.8, 10.2]} intensity={22} color="#fff3e0" distance={14} />
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

      {/* Warm ceiling fixtures: emissive geometry adds detail without extra shadow lights. */}
      {[-7, 0, 7].flatMap((z) =>
        [-4.2, 4.2].map((x) => (
          <group key={'ceiling-' + x + '-' + z} position={[x, 3.3, z]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.34, 0.46, 0.14, 20]} />
              <meshStandardMaterial color="#5f5147" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.3, 20]} />
              <meshStandardMaterial color="#fff7cf" emissive="#ffe7a0" emissiveIntensity={1.8} />
            </mesh>
          </group>
        )),
      )}

      {/* Faint daylight pools below the display windows. */}
      {[-5, 5].map((x) => (
        <mesh
          key={'sun-pool-' + x}
          position={[x * 0.72, 0.025, 8.9]}
          rotation={[-Math.PI / 2, 0, x > 0 ? 0.18 : -0.18]}
          scale={[1.9, 1, 0.7]}
        >
          <circleGeometry args={[1.35, 32]} />
          <meshBasicMaterial color="#fff2ba" transparent opacity={0.13} depthWrite={false} />
        </mesh>
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#ffeccf" />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.4, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#fffdf8" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.7, ROOM.minZ]}>
        <planeGeometry args={[width, 3.4]} />
        <meshStandardMaterial color="#ffd9a8" />
      </mesh>
      <mesh position={[0, 1.7, ROOM.maxZ]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, 3.4]} />
        <meshStandardMaterial color="#ffd9a8" />
      </mesh>
      <mesh position={[ROOM.minX, 1.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 3.4]} />
        <meshStandardMaterial color="#cdeef7" />
      </mesh>
      <mesh position={[ROOM.maxX, 1.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, 3.4]} />
        <meshStandardMaterial color="#cdeef7" />
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
        <TextPlate
          lines={['צעצועים עם סיפור', 'להורים חכמים']}
          width={6.8}
          height={0.95}
          position={[0, 0, 0.15]}
          bg="#f7b267"
          color="#4a2c14"
        />

      </group>

      <Decorations room={ROOM} />
      <Entrance room={ROOM} />

      {/* Publish-your-toy kiosk on the left side of the entrance */}
      <PublishKiosk position={[-6.5, 0, 9]} rotationY={Math.PI / 2} onPublish={onPublish} />



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


      {/* Interest-list sign mounted permanently on the back wall. */}
      <group
        position={[0, 1.5, ROOM.minZ + 0.14]}
        onClick={(e) => {
          e.stopPropagation();
          if (dragState.dragging) return;
          onCheckout();
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[3.7, 0.92, 0.12]} />
          <meshStandardMaterial color="#245c2a" roughness={0.7} />
        </mesh>
        <TextPlate
          lines={['הצעצועים', 'שמעניינים אותי']}
          width={3.4}
          height={0.7}
          position={[0, 0, 0.09]}
          bg="#2e7d32"
          color="#ffffff"
        />
      </group>

      <TextPlate
        lines={['התשלום והאיסוף', 'נקבעים ישירות מול המוכר']}
        width={5.2}
        height={0.68}
        position={[4.8, 1.15, ROOM.minZ + 0.14]}
        bg="#fff8e8"
        color="#59371f"
      />

      <ServiceCounter
        position={[COUNTER.x, 0, COUNTER.z]}
        onOpenInterests={onCheckout}
      />
      <Avatar3D
        avatar={CLERK_AVATAR}
        fixedPosition={[0, -11.25]}
        facingY={0}
      />

      {visitors.map((visitor) => (
        <Avatar3D key={visitor.id} avatar={visitor.avatar} path={visitor.path} />
      ))}
      {avatar && <Avatar3D avatar={avatar} />}

      <PlayerControls
        joystick={joystick}
        colliders={COLLIDERS}
        bounds={ROOM}
        enabled={!paused}
        cameraDistance={avatar ? 2.7 : 0}
      />
    </Canvas>
  );
};
