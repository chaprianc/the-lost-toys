import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, ExternalLink, Check } from 'lucide-react';
import type { Toy } from '@/hooks/useToys';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/types/toy';
import SellerRating from '@/components/SellerRating';

interface ToyPreviewDialogProps {
  toy: Toy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (toy: Toy) => void;
  inCart: boolean;
}

export const ToyPreviewDialog = ({
  toy,
  open,
  onOpenChange,
  onAddToCart,
  inCart,
}: ToyPreviewDialogProps) => {
  const navigate = useNavigate();
  if (!toy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{toy.toy_name}</DialogTitle>
        </DialogHeader>

        {toy.images?.[0] && (
          <img
            src={toy.images[0]}
            alt={`תמונה של ${toy.toy_name}`}
            className="w-full aspect-square object-cover rounded-xl"
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl font-bold text-foreground">₪{toy.price}</span>
          <Badge variant="outline">{CATEGORY_LABELS[toy.category]}</Badge>
          <Badge variant="secondary">{CONDITION_LABELS[toy.condition]}</Badge>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span>{toy.city}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">דירוג המוכר:</span>
          <SellerRating sellerPhone={toy.seller_phone} size="md" />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="default"
            size="lg"
            disabled={inCart}
            onClick={() => onAddToCart(toy)}
          >
            {inCart ? (
              <>
                <Check className="w-5 h-5" /> כבר ברשימת ההתעניינות
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" /> הוסף לרשימת ההתעניינות
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => navigate(`/toy/${toy.id}`)}>
            <ExternalLink className="w-4 h-4" /> לעמוד המלא
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
