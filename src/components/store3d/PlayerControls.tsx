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

/** Shared player transform so the third-person avatar can follow the camera. */
export const playerState = { x: 0, z: 10, yaw: 0, moving: false };

interface PlayerControlsProps {
  joystick: React.MutableRefObject<JoystickVector>;
  colliders: Collider[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  enabled?: boolean;
  /** Distance the camera sits behind the player (0 = first person). */
  cameraDistance?: number;
}

const SPEED = 3.4;
const SPRINT = 5.2;
const ACCEL = 12;
const DAMP = 10;
const RADIUS = 0.45;
const EYE_HEIGHT = 1.6;


export const PlayerControls = ({ joystick, colliders, bounds, enabled = true, cameraDistance = 0 }: PlayerControlsProps) => {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const position = useRef(new THREE.Vector3(0, EYE_HEIGHT, 10));
  const velocity = useRef(new THREE.Vector2(0, 0));
  const bob = useRef(0);
  const camPos = useRef(new THREE.Vector3(0, EYE_HEIGHT, 10 + 2.7));


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

    forward = THREE.MathUtils.clamp(forward - joystick.current.y, -1, 1);
    strafe = THREE.MathUtils.clamp(strafe + joystick.current.x, -1, 1);

    const inputLen = Math.hypot(forward, strafe);
    const hasInput = enabled && inputLen > 0.05;
    const sprinting = !!(k['ShiftLeft'] || k['ShiftRight']);
    const maxSpeed = (sprinting ? SPRINT : SPEED) * Math.min(inputLen, 1);

    // Smooth acceleration / deceleration for a less jerky walk
    const target = new THREE.Vector2(0, 0);
    if (hasInput) {
      target.set((strafe / inputLen) * maxSpeed, (forward / inputLen) * maxSpeed);
    }
    const rate = hasInput ? ACCEL : DAMP;
    velocity.current.lerp(target, 1 - Math.exp(-rate * dt));
    if (velocity.current.length() < 0.02) velocity.current.set(0, 0);

    const speed = velocity.current.length();
    if (speed > 0) {
      const sin = Math.sin(yaw.current);
      const cos = Math.cos(yaw.current);
      const vx = -velocity.current.y * sin + velocity.current.x * cos;
      const vz = -velocity.current.y * cos - velocity.current.x * sin;

      // sub-step so fast movement never tunnels through shelves
      const steps = Math.max(1, Math.ceil((speed * dt) / 0.12));
      const sdt = dt / steps;
      const p = position.current;
      for (let i = 0; i < steps; i++) {
        const dx = vx * sdt;
        const dz = vz * sdt;
        if (!blocked(p.x + dx, p.z)) p.x += dx;
        else velocity.current.x *= 0.5;
        if (!blocked(p.x, p.z + dz)) p.z += dz;
        else velocity.current.y *= 0.5;
      }
      bob.current += dt * speed * 2.2;
    } else {
      bob.current += dt * 0.6;
    }

    playerState.x = position.current.x;
    playerState.z = position.current.z;
    playerState.yaw = yaw.current;
    playerState.moving = speed > 0.3;

    const bobY = Math.sin(bob.current * 2) * (cameraDistance > 0 ? 0.015 : 0.035) * Math.min(speed, 1);

    if (cameraDistance > 0) {
      const sin = Math.sin(yaw.current);
      const cos = Math.cos(yaw.current);
      // shorten the boom if a wall/shelf sits behind the player
      let dist = cameraDistance;
      while (
        dist > 0.6 &&
        blocked(position.current.x + sin * dist, position.current.z + cos * dist)
      ) {
        dist -= 0.2;
      }
      const desired = new THREE.Vector3(
        position.current.x + sin * dist,
        EYE_HEIGHT + 0.35 + bobY,
        position.current.z + cos * dist
      );
      camPos.current.lerp(desired, 1 - Math.exp(-12 * dt));
      camera.position.copy(camPos.current);
    } else {
      camera.position.set(position.current.x, EYE_HEIGHT + bobY, position.current.z);
      camPos.current.copy(camera.position);
    }
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
  });



  return null;
};
