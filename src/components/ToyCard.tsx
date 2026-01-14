import { Toy } from '@/hooks/useToys';
import { CATEGORY_LABELS, CONDITION_LABELS, CATEGORY_ICONS } from '@/types/toy';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ToyCardProps {
  toy: Toy;
}

export const ToyCard = ({ toy }: ToyCardProps) => {
  const navigate = useNavigate();

  return (
    <article 
      className="overflow-hidden cursor-pointer group transition-all duration-500 ease-out hover:shadow-[0_25px_60px_-15px_hsl(25_55%_35%/0.35)] hover:-translate-y-2 hover:scale-[1.02] bg-card border-0 shadow-card rounded-2xl"
      onClick={() => navigate(`/toy/${toy.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/toy/${toy.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`${toy.toy_name}, מחיר: ${toy.price} שקלים, מצב: ${CONDITION_LABELS[toy.condition]}, מיקום: ${toy.city}. לחץ לצפייה בפרטים`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
        <img
          src={toy.images[0]}
          alt={`תמונה של ${toy.toy_name}`}
          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
        <div className="absolute top-3 right-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Badge variant="secondary" className="text-lg px-3 py-1 shadow-soft backdrop-blur-sm" aria-hidden="true">
            {CATEGORY_ICONS[toy.category]}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent p-4 transition-all duration-300 group-hover:from-foreground/80" aria-hidden="true">
          <span className="text-2xl font-bold text-primary-foreground drop-shadow-lg transition-transform duration-300 inline-block group-hover:scale-105">
            ₪{toy.price}
          </span>
        </div>
      </div>
      <CardContent className="p-4 space-y-3 transition-all duration-300 group-hover:bg-muted/30">
        <h3 className="font-semibold text-lg text-foreground line-clamp-1 transition-colors duration-300 group-hover:text-primary">
          {toy.toy_name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap" role="list" aria-label="פרטי הצעצוע">
          <Badge variant="outline" className="text-sm" role="listitem">
            <span className="sr-only">קטגוריה: </span>{CATEGORY_LABELS[toy.category]}
          </Badge>
          <Badge 
            role="listitem"
            className={`text-sm ${
              toy.condition === 'new' 
                ? 'bg-success text-success-foreground' 
                : toy.condition === 'like-new'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className="sr-only">מצב: </span>{CONDITION_LABELS[toy.condition]}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span><span className="sr-only">מיקום: </span>{toy.city}</span>
        </div>
      </CardContent>
    </article>
  );
};
