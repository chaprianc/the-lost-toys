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
      {/* Shelf boards */}
      {[0.5, 1.3, 2.1].map((y) => (
        <mesh key={y} position={[0, y, 0]} receiveShadow castShadow>
          <boxGeometry args={[6, 0.12, 1]} />
          <meshStandardMaterial color="#fff4e4" />
        </mesh>
      ))}

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
