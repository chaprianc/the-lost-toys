import { Html } from '@react-three/drei';
import type { Toy } from '@/hooks/useToys';
import { ToyBox } from './ToyBox';

export interface ShelfUnitProps {
  position: [number, number, number];
  rotationY: number;
  toys: Toy[];
  onSelect: (toy: Toy) => void;
  isInCart: (id: string) => boolean;
  color?: string;
  label?: string;
  icon?: string;
}

const LEVELS = [0.95, 1.75];
const COLUMNS = [-1.6, 1.6];

export const ShelfUnit = ({
  position,
  rotationY,
  toys,
  onSelect,
  isInCart,
  color = '#f7b267',
  label,
  icon,
}: ShelfUnitProps) => {
  const slots: { x: number; y: number }[] = [];
  LEVELS.forEach((y) => COLUMNS.forEach((x) => slots.push({ x, y })));

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Back panel */}
      <mesh position={[0, 1.25, -0.45]} receiveShadow>
        <boxGeometry args={[6, 2.5, 0.12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Side panels */}
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, 1.25, 0]} receiveShadow>
          <boxGeometry args={[0.14, 2.5, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {/* Bright inner backing so toys pop against the shelf */}
      <mesh position={[0, 1.25, -0.38]}>
        <boxGeometry args={[5.7, 2.2, 0.04]} />
        <meshStandardMaterial color="#fffdf8" />
      </mesh>
      {/* Shelf boards */}
      {[0.5, 1.3, 2.1].map((y) => (
        <mesh key={y} position={[0, y, 0]} receiveShadow castShadow>
          <boxGeometry args={[6, 0.12, 1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Under-shelf strip lights */}
      {[1.3, 2.1].map((y) => (
        <group key={`strip-${y}`}>
          <mesh position={[0, y - 0.09, 0.42]}>
            <boxGeometry args={[5.6, 0.05, 0.05]} />
            <meshStandardMaterial color="#fffbe8" emissive="#fff3cf" emissiveIntensity={1.4} />
          </mesh>
          <pointLight position={[0, y - 0.2, 0.55]} intensity={6} color="#fff6e0" distance={3.2} />
        </group>
      ))}

      {/* Category sign above the shelf */}
      {label && (
        <Html position={[0, 2.75, 0.3]} center distanceFactor={9} occlude={false}>
          <div
            style={{
              direction: 'rtl',
              whiteSpace: 'nowrap',
              background: color,
              color: '#4a2c14',
              border: '3px solid #fff7ec',
              padding: '8px 22px',
              borderRadius: 14,
              fontSize: 20,
              fontWeight: 800,
              boxShadow: '0 6px 16px rgba(0,0,0,0.22)',
            }}
          >
            {icon} {label}
          </div>
        </Html>
      )}



      {toys.slice(0, slots.length).map((toy, i) => (
        <ToyBox
          key={toy.id}
          toy={toy}
          position={[slots[i].x, slots[i].y, 0.2]}
          onSelect={onSelect}
          inCart={isInCart(toy.id)}
        />
      ))}
    </group>
  );
};
