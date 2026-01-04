import { Toy, CATEGORY_LABELS, CONDITION_LABELS, CATEGORY_ICONS } from '@/types/toy';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ToyCardProps {
  toy: Toy;
}

export const ToyCard = ({ toy }: ToyCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 bg-card border-0 shadow-card"
      onClick={() => navigate(`/toy/${toy.id}`)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={toy.images[0]}
          alt={toy.toy_name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-lg px-3 py-1 shadow-soft">
            {CATEGORY_ICONS[toy.category]}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-4">
          <span className="text-2xl font-bold text-primary-foreground">
            ₪{toy.price}
          </span>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg text-foreground line-clamp-1">
          {toy.toy_name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-sm">
            {CATEGORY_LABELS[toy.category]}
          </Badge>
          <Badge 
            className={`text-sm ${
              toy.condition === 'new' 
                ? 'bg-success text-success-foreground' 
                : toy.condition === 'like-new'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {CONDITION_LABELS[toy.condition]}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          <span>{toy.city}</span>
        </div>
      </CardContent>
    </Card>
  );
};
