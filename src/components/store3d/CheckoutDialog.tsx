import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, MessageCircle, Phone } from 'lucide-react';
import type { CartItem } from '@/hooks/useCart';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  total: number;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const whatsappLink = (phone: string, names: string[]) => {
  const formatted = phone.replace(/^0/, '972');
  const text = `היי, ראיתי בחנות את ${names.map((n) => `"${n}"`).join(', ')} ואשמח לפרטים נוספים`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
};

export const CheckoutDialog = ({
  open,
  onOpenChange,
  items,
  total,
  onRemove,
  onClear,
}: CheckoutDialogProps) => {
  const bySeller = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    (acc[item.seller_phone] ||= []).push(item);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-right max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">💳 הקופה</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center">
            הסל ריק — הסתובבו בחנות והוסיפו צעצועים 🧸
          </p>
        ) : (
          <div className="space-y-5">
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-muted/40 rounded-xl p-2"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.toy_name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₪{item.price} · {item.city}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                    aria-label={`הסר את ${item.toy_name} מהסל`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-y border-border py-3">
              <span className="font-semibold">סה"כ</span>
              <span className="text-xl font-bold">₪{total}</span>
            </div>

            <div className="space-y-4">
              {Object.entries(bySeller).map(([phone, sellerItems]) => (
                <div key={phone} className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    מוכר · {sellerItems.map((i) => i.toy_name).join(', ')}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={whatsappLink(phone, sellerItems.map((i) => i.toy_name))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="whatsapp" className="w-full">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </Button>
                    </a>
                    <a href={`tel:${phone}`} className="flex-1">
                      <Button variant="phone" className="w-full">
                        <Phone className="w-4 h-4" /> חיוג
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm text-muted-foreground">
              <p>ℹ️ התשלום מתבצע ישירות מול המוכר — אין תשלום דרך האתר.</p>
              <p>💡 טיפ: תמיד פגשו במקום ציבורי ובדקו את הצעצוע לפני הרכישה</p>
            </div>

            <Button variant="ghost" className="w-full" onClick={onClear}>
              רוקן את הסל
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
