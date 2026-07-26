import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface Collider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface JoystickVector {
  x: number;
  y: number;
}

/** Shared drag state so toy clicks are ignored while the user is looking around. */
export const dragState = { dragging: false };

interface PlayerControlsProps {
  joystick: React.MutableRefObject<JoystickVector>;
  colliders: Collider[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  enabled?: boolean;
}

const SPEED = 3.2;
const RADIUS = 0.45;
const EYE_HEIGHT = 1.6;

export const PlayerControls = ({ joystick, colliders, bounds, enabled = true }: PlayerControlsProps) => {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const position = useRef(new THREE.Vector3(0, EYE_HEIGHT, 10));

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    let activeId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let moved = 0;

    const onDown = (e: PointerEvent) => {
      if (activeId !== null) return;
      activeId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      moved = 0;
      dragState.dragging = false;
    };
    const onMove = (e: PointerEvent) => {
      if (activeId !== e.pointerId) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 8) dragState.dragging = true;
      yaw.current -= dx * 0.0045;
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.0035, -0.9, 0.9);
    };
    const onUp = (e: PointerEvent) => {
      if (activeId !== e.pointerId) return;
      activeId = null;
      window.setTimeout(() => { dragState.dragging = false; }, 0);
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [gl]);

  const blocked = (x: number, z: number) => {
    if (x < bounds.minX + RADIUS || x > bounds.maxX - RADIUS) return true;
    if (z < bounds.minZ + RADIUS || z > bounds.maxZ - RADIUS) return true;
    return colliders.some(
      (c) =>
        x > c.minX - RADIUS && x < c.maxX + RADIUS && z > c.minZ - RADIUS && z < c.maxZ + RADIUS
    );
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    let forward = 0;
    let strafe = 0;

    const k = keys.current;
    if (k['KeyW'] || k['ArrowUp']) forward += 1;
    if (k['KeyS'] || k['ArrowDown']) forward -= 1;
    if (k['KeyD'] || k['ArrowRight']) strafe += 1;
    if (k['KeyA'] || k['ArrowLeft']) strafe -= 1;

    forward += -joystick.current.y;
    strafe += joystick.current.x;

    if (enabled && (forward !== 0 || strafe !== 0)) {
      const len = Math.hypot(forward, strafe) || 1;
      const nf = (forward / len) * SPEED * dt;
      const ns = (strafe / len) * SPEED * dt;
      const sin = Math.sin(yaw.current);
      const cos = Math.cos(yaw.current);

      const dx = -nf * sin + ns * cos;
      const dz = -nf * cos - ns * sin;

      const p = position.current;
      if (!blocked(p.x + dx, p.z)) p.x += dx;
      if (!blocked(p.x, p.z + dz)) p.z += dz;
    }

    camera.position.copy(position.current);
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
  });

  return null;
};
