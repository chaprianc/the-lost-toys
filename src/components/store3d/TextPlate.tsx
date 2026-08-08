import { useMemo } from 'react';
import * as THREE from 'three';

interface TextPlateProps {
  /** Lines of text, first line is the largest */
  lines: string[];
  /** Plate size in world units */
  width: number;
  height: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  bg?: string;
  color?: string;
  opacity?: number;
  bold?: boolean;
}

/**
 * Renders text as a canvas texture on a flat plane so it is always visible
 * inside the WebGL scene (no DOM overlay involved).
 */
export const TextPlate = ({
  lines,
  width,
  height,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  bg = '#fffdf8',
  color = '#3b2410',
  opacity = 1,
  bold = true,
}: TextPlateProps) => {
  const texture = useMemo(() => {
    const px = 256;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round((width / height) * px);
    canvas.height = px;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.fillStyle = color;

    const count = lines.length;
    lines.forEach((line, i) => {
      const isFirst = i === 0;
      const size = isFirst ? px * (count > 1 ? 0.42 : 0.52) : px * 0.3;
      ctx.font = `${bold ? '900' : '600'} ${size}px system-ui, "Segoe UI", Arial, sans-serif`;
      // shrink to fit width
      let fontSize = size;
      while (ctx.measureText(line).width > canvas.width * 0.92 && fontSize > 10) {
        fontSize -= 2;
        ctx.font = `${bold ? '900' : '600'} ${fontSize}px system-ui, "Segoe UI", Arial, sans-serif`;
      }
      const y = count === 1 ? canvas.height / 2 : canvas.height * (i === 0 ? 0.38 : 0.75);
      ctx.fillText(line, canvas.width / 2, y);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.anisotropy = 4;
    return tex;
  }, [lines.join('|'), width, height, bg, color, bold]);

  if (!texture) return null;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
};
