import { ToyCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/toy';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  selectedCategory?: ToyCategory;
  onSelectCategory: (category?: ToyCategory) => void;
}

const categories: ToyCategory[] = ['vehicles', 'dolls', 'board-games', 'outdoor', 'educational', 'other'];

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={!selectedCategory ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelectCategory(undefined)}
        className="whitespace-nowrap"
      >
        🎯 הכל
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(category)}
          className="whitespace-nowrap"
        >
          {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
        </Button>
      ))}
    </div>
  );
};
