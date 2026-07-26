import { useRef, useState } from 'react';

interface JoystickProps {
  onChange: (x: number, y: number) => void;
}

const SIZE = 120;
const KNOB = 48;

export const Joystick = ({ onChange }: JoystickProps) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pointerId = useRef<number | null>(null);

  const update = (clientX: number, clientY: number) => {
    const el = baseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const max = rect.width / 2 - KNOB / 4;
    const dist = Math.hypot(dx, dy);
    if (dist > max) {
      dx = (dx / dist) * max;
      dy = (dy / dist) * max;
    }
    setKnob({ x: dx, y: dy });
    onChange(dx / max, dy / max);
  };

  const reset = () => {
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  };

  return (
    <div
      ref={baseRef}
      className="relative rounded-full bg-card/70 backdrop-blur-sm shadow-card border border-border touch-none select-none"
      style={{ width: SIZE, height: SIZE }}
      onPointerDown={(e) => {
        pointerId.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pointerId.current !== e.pointerId) return;
        update(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (pointerId.current !== e.pointerId) return;
        pointerId.current = null;
        reset();
      }}
      onPointerCancel={reset}
      aria-label="ג'ויסטיק תנועה"
    >
      <div
        className="absolute top-0 left-0 rounded-full bg-primary shadow-soft"
        style={{
          width: KNOB,
          height: KNOB,
          transform: `translate(${SIZE / 2 - KNOB / 2 + knob.x}px, ${SIZE / 2 - KNOB / 2 + knob.y}px)`,
        }}
      />
    </div>
  );
};
