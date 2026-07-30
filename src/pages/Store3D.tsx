import { Suspense, lazy, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToys, type Toy } from '@/hooks/useToys';
import { CATEGORY_LABELS, CATEGORY_ICONS, type ToyCategory } from '@/types/toy';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { Joystick } from '@/components/store3d/Joystick';
import { CartButton } from '@/components/store3d/CartButton';
import { ToyPreviewDialog } from '@/components/store3d/ToyPreviewDialog';
import { CheckoutDialog } from '@/components/store3d/CheckoutDialog';
import type { JoystickVector } from '@/components/store3d/PlayerControls';
import { toast } from 'sonner';

const StoreScene = lazy(() =>
  import('@/components/store3d/StoreScene').then((m) => ({ default: m.StoreScene }))
);

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const Store3D = () => {
  const navigate = useNavigate();
  const { data: toys = [], isLoading } = useToys();
  const { items, addItem, removeItem, clearCart, inCart, total } = useCart();

  const joystick = useRef<JoystickVector>({ x: 0, y: 0 });
  const [entered, setEntered] = useState(false);
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ToyCategory | null>(null);

  const webgl = useMemo(supportsWebGL, []);
  const displayToys = useMemo(() => toys.slice(0, 16), [toys]);

  const handleAddToCart = (toy: Toy) => {
    addItem({
      id: toy.id,
      toy_name: toy.toy_name,
      price: toy.price,
      seller_phone: toy.seller_phone,
      city: toy.city,
      image: toy.images?.[0] ?? null,
    });
    toast.success(`${toy.toy_name} נוסף לסל 🛒`);
    setSelectedToy(null);
  };

  if (!webgl) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-sm">
          <span className="text-6xl block">🧸</span>
          <h1 className="text-2xl font-bold text-foreground">
            המכשיר לא תומך בחנות התלת-ממדית
          </h1>
          <p className="text-muted-foreground">
            אפשר לעבור לתצוגה הרגילה וליהנות מכל הצעצועים.
          </p>
          <Button variant="default" onClick={() => navigate('/browse')}>
            לתצוגה הרגילה
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#fdf6ec] overflow-hidden" dir="rtl">
      {/* Scene */}
      <div className="absolute inset-0 touch-none">
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">בונים את החנות...</p>
            </div>
          }
        >
          {!isLoading && (
            <StoreScene
              toys={displayToys}
              joystick={joystick}
              onSelectToy={setSelectedToy}
              onCheckout={() => setCheckoutOpen(true)}
              isInCart={inCart}
              paused={!!selectedToy || checkoutOpen || !entered}
              activeCategory={activeCategory}
              onSelectCategory={(category) =>
                setActiveCategory((prev) => (prev === category ? null : category))
              }
            />
          )}
        </Suspense>
      </div>

      {/* Top bar */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-3 pointer-events-none">
        <Button
          variant="secondary"
          size="sm"
          className="pointer-events-auto shadow-card"
          onClick={() => navigate('/browse')}
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          יציאה לתצוגה הרגילה
        </Button>
        <div className="pointer-events-auto">
          <CartButton count={items.length} onClick={() => setCheckoutOpen(true)} />
        </div>
      </div>

      {/* Active category filter chip */}
      {activeCategory && entered && (
        <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none">
          <Button
            variant="default"
            size="sm"
            className="pointer-events-auto shadow-card rounded-full"
            onClick={() => setActiveCategory(null)}
          >
            {CATEGORY_ICONS[activeCategory]} מציג: {CATEGORY_LABELS[activeCategory]} · הצג הכל ✕
          </Button>
        </div>
      )}

      {/* Joystick */}
      <div className="absolute bottom-6 right-6">
        <Joystick
          onChange={(x, y) => {
            joystick.current.x = x;
            joystick.current.y = y;
          }}
        />
      </div>

      {/* Intro overlay */}
      {!entered && (
        <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm flex items-center justify-center p-6 z-20">
          <div className="bg-card rounded-3xl shadow-elevated p-6 max-w-sm w-full text-center space-y-4 animate-scale-in">
            <span className="text-5xl block">🏪</span>
            <h1 className="text-2xl font-bold text-foreground">חנות הצעצועים התלת-ממדית</h1>
            <div className="text-muted-foreground text-sm space-y-1">
              <p>📱 בנייד: הזיזו את הג'ויסטיק כדי ללכת, גררו על המסך כדי להסתכל מסביב.</p>
              <p>💻 במחשב: מקשי WASD או החצים להליכה, גרירת עכבר להסתכלות.</p>
              <p>🧸 לחצו על צעצוע כדי לראות פרטים ולהוסיף לסל.</p>
              <p>💳 בסוף המעבר נמצאת הקופה.</p>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" /> טוען צעצועים...
              </div>
            ) : (
              <Button variant="default" size="lg" className="w-full" onClick={() => setEntered(true)}>
                כניסה לחנות
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/browse')}>
              לתצוגה הרגילה
            </Button>
          </div>
        </div>
      )}

      <ToyPreviewDialog
        toy={selectedToy}
        open={!!selectedToy}
        onOpenChange={(open) => !open && setSelectedToy(null)}
        onAddToCart={handleAddToCart}
        inCart={selectedToy ? inCart(selectedToy.id) : false}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={items}
        total={total}
        onRemove={removeItem}
        onClear={clearCart}
      />
    </div>
  );
};

export default Store3D;
