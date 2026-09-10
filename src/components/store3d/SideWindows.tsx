const WINDOW_Z = [-6, 3];

interface SideWindowsProps {
  room: { minX: number; maxX: number };
}

const Window = ({
  position,
  rotationY,
  side,
}: {
  position: [number, number, number];
  rotationY: number;
  side: 'left' | 'right';
}) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    {/* Outdoor sky and simple buildings create real depth behind the glass. */}
    <mesh position={[0, 0, -0.055]}>
      <planeGeometry args={[3.15, 1.75]} />
      <meshBasicMaterial color="#a9d9ec" />
    </mesh>
    {[-1.15, -0.45, 0.3, 1.05].map((x, index) => (
      <mesh key={x} position={[x, -0.34 + (index % 2) * 0.12, -0.035]}>
        <boxGeometry args={[0.55, 0.78 + (index % 2) * 0.26, 0.025]} />
        <meshStandardMaterial color={index % 2 ? '#d5c2a7' : '#c6ae91'} roughness={0.92} />
      </mesh>
    ))}

    {/* Glass pane. */}
    <mesh>
      <planeGeometry args={[3.18, 1.78]} />
      <meshStandardMaterial
        color="#d7f2fb"
        transparent
        opacity={0.23}
        roughness={0.06}
        metalness={0.1}
      />
    </mesh>

    {/* Full wooden frame with a central divider. */}
    {[-1.67, 0, 1.67].map((x) => (
      <mesh key={x} position={[x, 0, 0.035]} castShadow>
        <boxGeometry args={[0.12, 1.98, 0.11]} />
        <meshStandardMaterial color="#6b4423" roughness={0.74} />
      </mesh>
    ))}
    {[-0.94, 0.94].map((y) => (
      <mesh key={y} position={[0, y, 0.035]} castShadow>
        <boxGeometry args={[3.46, 0.12, 0.11]} />
        <meshStandardMaterial color="#6b4423" roughness={0.74} />
      </mesh>
    ))}

    {/* Bright reflections make the glass readable from every camera angle. */}
    {[-0.9, 0.82].map((x) => (
      <mesh key={x} position={[x, 0.06, 0.05]} rotation={[0, 0, -0.35]}>
        <planeGeometry args={[0.13, 1.38]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.38} depthWrite={false} />
      </mesh>
    ))}

    {/* Deep sill and a small plant. */}
    <mesh position={[0, -1.01, 0.12]} castShadow receiveShadow>
      <boxGeometry args={[3.55, 0.16, 0.42]} />
      <meshStandardMaterial color="#efe0c8" roughness={0.58} />
    </mesh>
    <group position={[side === 'left' ? -1.15 : 1.15, -0.75, 0.13]} scale={0.7}>
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.28, 12]} />
        <meshStandardMaterial color="#b95f43" roughness={0.82} />
      </mesh>
      {[-0.12, 0, 0.12].map((leafX, index) => (
        <mesh key={leafX} position={[leafX, 0.3 + index * 0.04, 0]} scale={[0.6, 1.15, 0.42]}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial color={index % 2 ? '#4f9d69' : '#73ad78'} roughness={0.86} />
        </mesh>
      ))}
    </group>
  </group>
);

export const SideWindows = ({ room }: SideWindowsProps) => (
  <group>
    {(['left', 'right'] as const).flatMap((side) => {
      const isLeft = side === 'left';
      const x = isLeft ? room.minX + 0.09 : room.maxX - 0.09;
      const rotationY = isLeft ? Math.PI / 2 : -Math.PI / 2;
      return WINDOW_Z.map((z) => (
        <Window
          key={side + '-' + z}
          side={side}
          position={[x, 1.92, z]}
          rotationY={rotationY}
        />
      ));
    })}

    {/* Daylight pools make the window locations obvious while walking. */}
    {(['left', 'right'] as const).flatMap((side) => {
      const x = side === 'left' ? room.minX + 1.4 : room.maxX - 1.4;
      return WINDOW_Z.map((z) => (
        <mesh
          key={'light-' + side + '-' + z}
          position={[x, 0.026, z]}
          rotation={[-Math.PI / 2, 0, side === 'left' ? -0.16 : 0.16]}
          scale={[1.5, 1, 0.58]}
        >
          <circleGeometry args={[1.18, 28]} />
          <meshBasicMaterial color="#fff0ad" transparent opacity={0.16} depthWrite={false} />
        </mesh>
      ));
    })}
  </group>
);
