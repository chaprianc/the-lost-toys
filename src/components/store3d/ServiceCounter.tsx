import { TextPlate } from './TextPlate';
import { dragState } from './PlayerControls';

interface ServiceCounterProps {
  position: [number, number, number];
  onOpenInterests: () => void;
}

/** A warm, lived-in service desk. It is decorative; payments stay seller-to-buyer. */
export const ServiceCounter = ({ position, onOpenInterests }: ServiceCounterProps) => (
  <group
    position={position}
    onClick={(event) => {
      event.stopPropagation();
      if (!dragState.dragging) onOpenInterests();
    }}
    onPointerOver={() => {
      document.body.style.cursor = 'pointer';
    }}
    onPointerOut={() => {
      document.body.style.cursor = 'auto';
    }}
  >
    {/* Wooden cabinet and recessed front panels. */}
    <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.4, 1.1, 1.2]} />
      <meshStandardMaterial color="#8b532d" roughness={0.76} />
    </mesh>
    {[-1.05, 0, 1.05].map((x) => (
      <mesh key={x} position={[x, 0.52, 0.611]}>
        <boxGeometry args={[0.82, 0.72, 0.025]} />
        <meshStandardMaterial color="#6f3f23" roughness={0.84} />
      </mesh>
    ))}
    <mesh position={[0, 1.14, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.65, 0.12, 1.42]} />
      <meshStandardMaterial color="#f2dfc2" roughness={0.38} />
    </mesh>

    {/* Small screen and keyboard. */}
    <group position={[-0.75, 1.48, -0.16]} rotation={[-0.08, 0.08, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.72, 0.52, 0.08]} />
        <meshStandardMaterial color="#3d3a37" roughness={0.48} />
      </mesh>
      <mesh position={[0, 0, 0.046]}>
        <planeGeometry args={[0.61, 0.4]} />
        <meshStandardMaterial color="#bfe7dc" emissive="#7dd3c7" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, -0.39, -0.02]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.74, 0.36, 0.04]} />
        <meshStandardMaterial color="#4b4946" roughness={0.65} />
      </mesh>
    </group>

    {/* Paper shopping bag. */}
    <group position={[0.72, 1.48, -0.12]} rotation={[0, -0.16, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.62, 0.3]} />
        <meshStandardMaterial color="#d9b98c" roughness={0.9} />
      </mesh>
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 0.39, 0]}>
          <torusGeometry args={[0.09, 0.012, 6, 16, Math.PI]} />
          <meshStandardMaterial color="#80664c" roughness={0.8} />
        </mesh>
      ))}
    </group>

    {/* Coffee mug and a little plant make the counter feel occupied. */}
    <group position={[1.32, 1.3, -0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.09, 0.22, 14]} />
        <meshStandardMaterial color="#eff6ff" roughness={0.38} />
      </mesh>
      <mesh position={[0.11, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.065, 0.018, 8, 16]} />
        <meshStandardMaterial color="#eff6ff" />
      </mesh>
    </group>
    <group position={[1.45, 1.34, 0.28]} scale={0.65}>
      <mesh castShadow>
        <cylinderGeometry args={[0.16, 0.13, 0.28, 12]} />
        <meshStandardMaterial color="#c76d4c" roughness={0.8} />
      </mesh>
      {[-0.13, 0, 0.13].map((x, index) => (
        <mesh key={x} position={[x, 0.35 + index * 0.03, 0]} scale={[0.65, 1.2, 0.45]}>
          <sphereGeometry args={[0.17, 10, 8]} />
          <meshStandardMaterial color={index % 2 ? '#4f9d69' : '#6baa75'} roughness={0.82} />
        </mesh>
      ))}
    </group>

    <TextPlate
      lines={['עמדת שירות', 'לחצו לפתיחת הרשימה']}
      width={2.75}
      height={0.58}
      position={[0, 0.58, 0.63]}
      bg="#fff8e8"
      color="#4a2c14"
    />
  </group>
);
