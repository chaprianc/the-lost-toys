export type ToyCategory = 'vehicles' | 'dolls' | 'board-games' | 'outdoor' | 'educational' | 'other';
export type ToyCondition = 'new' | 'like-new' | 'used';
export type ToyStatus = 'available' | 'sold' | 'hidden';

export interface Toy {
  id: string;
  toy_name: string;
  category: ToyCategory;
  condition: ToyCondition;
  price: number;
  city: string;
  seller_phone: string;
  images: string[];
  status: ToyStatus;
  created_at: string;
}

export const CATEGORY_LABELS: Record<ToyCategory, string> = {
  'vehicles': 'רכבים',
  'dolls': 'בובות',
  'board-games': 'משחקי קופסה',
  'outdoor': 'משחקי חוץ',
  'educational': 'משחקים לימודיים',
  'other': 'אחר',
};

export const CONDITION_LABELS: Record<ToyCondition, string> = {
  'new': 'חדש',
  'like-new': 'כמו חדש',
  'used': 'משומש',
};

export const CATEGORY_ICONS: Record<ToyCategory, string> = {
  'vehicles': '🚗',
  'dolls': '🧸',
  'board-games': '🎲',
  'outdoor': '⚽',
  'educational': '📚',
  'other': '🎁',
};

export const STATUS_LABELS: Record<ToyStatus, string> = {
  'available': 'זמין',
  'sold': 'נמכר',
  'hidden': 'מוסתר',
};
