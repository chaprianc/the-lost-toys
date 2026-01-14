import { ToyCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/toy';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  selectedCategory?: ToyCategory;
  onSelectCategory: (category?: ToyCategory) => void;
}

const categories: ToyCategory[] = ['vehicles', 'dolls', 'board-games', 'outdoor', 'educational', 'other'];

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="navigation" aria-label="סינון לפי קטגוריה">
      <Button
        variant={!selectedCategory ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelectCategory(undefined)}
        className="whitespace-nowrap"
        aria-pressed={!selectedCategory}
        aria-label="הצג את כל הקטגוריות"
      >
        <span aria-hidden="true">🎯</span> הכל
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(category)}
          className="whitespace-nowrap"
          aria-pressed={selectedCategory === category}
          aria-label={`סנן לפי קטגוריה: ${CATEGORY_LABELS[category]}`}
        >
          <span aria-hidden="true">{CATEGORY_ICONS[category]}</span> {CATEGORY_LABELS[category]}
        </Button>
      ))}
    </nav>
  );
};
