import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'toy-cart';
const EVENT = 'toy-cart-changed';

export interface CartItem {
  id: string;
  toy_name: string;
  price: number;
  seller_phone: string;
  city: string;
  image: string | null;
}

const readCart = (): CartItem[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const writeCart = (items: CartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
};

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    const handler = () => setItems(readCart());
    window.addEventListener(EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const addItem = useCallback((item: CartItem) => {
    const next = readCart();
    if (!next.some((i) => i.id === item.id)) {
      next.push(item);
      writeCart(next);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    writeCart(readCart().filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => writeCart([]), []);

  const inCart = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return { items, addItem, removeItem, clearCart, inCart, total };
};
