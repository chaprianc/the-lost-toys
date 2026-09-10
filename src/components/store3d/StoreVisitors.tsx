import { useCallback, useEffect, useState } from 'react';
import { Avatar3D, type VisitorWaypoint } from './Avatar3D';
import { SHIRT_COLORS, type AvatarGender, type AvatarProfile } from '@/hooks/useAvatar';

const VISITOR_NAMES: Record<AvatarGender, string[]> = {
  girl: ['נועה', 'מאיה', 'תמר', 'יעל', 'רוני', 'שירה', 'אלה', 'ליה'],
  boy: ['דניאל', 'איתי', 'נועם', 'עומר', 'יואב', 'אורי', 'רועי', 'גיא'],
};

const SHELF_STOPS: [number, number][] = [
  [-6.35, -9.65],
  [-6.35, -1.5],
  [6.35, -9.65],
  [6.35, -1.5],
];

interface StoreVisitor {
  id: string;
  avatar: AvatarProfile;
  route: VisitorWaypoint[];
  speed: number;
}

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const createVisitor = (): StoreVisitor => {
  const gender: AvatarGender = Math.random() > 0.5 ? 'girl' : 'boy';
  const firstStopIndex = Math.floor(Math.random() * SHELF_STOPS.length);
  let secondStopIndex = Math.floor(Math.random() * SHELF_STOPS.length);
  if (secondStopIndex === firstStopIndex) secondStopIndex = (secondStopIndex + 1) % SHELF_STOPS.length;
  const firstStop = SHELF_STOPS[firstStopIndex];
  const secondStop = SHELF_STOPS[secondStopIndex];

  return {
    id: crypto.randomUUID(),
    avatar: {
      gender,
      name: randomItem(VISITOR_NAMES[gender]),
      shirt: randomItem(SHIRT_COLORS),
    },
    speed: 0.78 + Math.random() * 0.22,
    route: [
      { position: [0, 11.55] },
      { position: [0, 7.2] },
      { position: firstStop, pause: 3.5 + Math.random() * 3 },
      { position: secondStop, pause: 3.5 + Math.random() * 3 },
      { position: [0, 7.2] },
      { position: [0, 11.7] },
    ],
  };
};

export const StoreVisitors = () => {
  const [visitors, setVisitors] = useState<StoreVisitor[]>([]);

  useEffect(() => {
    let timer: number;
    let active = true;

    const scheduleNextVisitor = (delay: number) => {
      timer = window.setTimeout(() => {
        if (!active) return;
        setVisitors((current) => (current.length >= 5 ? current : [...current, createVisitor()]));
        scheduleNextVisitor(20000 + Math.random() * 15000);
      }, delay);
    };

    scheduleNextVisitor(2500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const removeVisitor = useCallback((id: string) => {
    setVisitors((current) => current.filter((visitor) => visitor.id !== id));
  }, []);

  return visitors.map((visitor) => (
    <Avatar3D
      key={visitor.id}
      avatar={visitor.avatar}
      route={visitor.route}
      routeSpeed={visitor.speed}
      revealNameWhenNear
      onRouteComplete={() => removeVisitor(visitor.id)}
    />
  ));
};
