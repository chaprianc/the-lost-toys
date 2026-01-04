import { create } from 'zustand';
import { Toy, ToyCategory } from '@/types/toy';
import { mockToys } from '@/data/mockToys';

interface ToyStore {
  toys: Toy[];
  addToy: (toy: Omit<Toy, 'id' | 'created_at' | 'status'>) => void;
  getToyById: (id: string) => Toy | undefined;
  filterToys: (category?: ToyCategory, city?: string) => Toy[];
}

export const useToyStore = create<ToyStore>((set, get) => ({
  toys: mockToys,
  
  addToy: (toyData) => {
    const newToy: Toy = {
      ...toyData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'available',
    };
    set((state) => ({ toys: [newToy, ...state.toys] }));
  },
  
  getToyById: (id) => {
    return get().toys.find((toy) => toy.id === id);
  },
  
  filterToys: (category, city) => {
    let filtered = get().toys.filter((toy) => toy.status === 'available');
    
    if (category) {
      filtered = filtered.filter((toy) => toy.category === category);
    }
    
    if (city) {
      filtered = filtered.filter((toy) => 
        toy.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    return filtered;
  },
}));
