import { Heart } from 'lucide-react';

interface CartButtonProps {
  count: number;
  onClick: () => void;
}

export const CartButton = ({ count, onClick }: CartButtonProps) => (
  <button
    onClick={onClick}
    className="relative flex items-center gap-2 rounded-full bg-card/90 backdrop-blur-sm shadow-card border border-border px-4 py-2 font-semibold text-foreground hover:scale-105 transition-transform"
    aria-label={`הצעצועים שמעניינים אותי, ${count} פריטים`}
  >
    <Heart className="w-5 h-5" aria-hidden="true" />
    <span>מעניינים אותי</span>
    {count > 0 && (
      <span className="absolute -top-2 -left-2 min-w-6 h-6 px-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
        {count}
      </span>
    )}
  </button>
);
