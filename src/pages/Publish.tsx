import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToyStore } from '@/store/toyStore';
import { ToyCategory, ToyCondition, CATEGORY_LABELS, CONDITION_LABELS, CATEGORY_ICONS } from '@/types/toy';
import { toast } from 'sonner';
import { Camera, Upload, CheckCircle, Info } from 'lucide-react';

const Publish = () => {
  const navigate = useNavigate();
  const { addToy } = useToyStore();
  
  const [formData, setFormData] = useState({
    toy_name: '',
    category: '' as ToyCategory,
    condition: '' as ToyCondition,
    price: '',
    city: '',
    seller_phone: '',
    imageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.toy_name || !formData.category || !formData.condition || !formData.price || !formData.city || !formData.seller_phone) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      addToy({
        toy_name: formData.toy_name,
        category: formData.category,
        condition: formData.condition,
        price: Number(formData.price),
        city: formData.city,
        seller_phone: formData.seller_phone,
        images: [formData.imageUrl || 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=400'],
      });

      toast.success('הצעצוע פורסם בהצלחה! 🎉');
      navigate('/browse');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <Card className="shadow-elevated border-0 animate-slide-up">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🎁</span>
            </div>
            <CardTitle className="text-2xl">פרסום צעצוע</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              מלאו את הפרטים ותנו לצעצוע בית חדש
            </p>
          </CardHeader>

          <CardContent>
            {/* Service fee notice */}
            <div className="bg-secondary/50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-secondary-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-secondary-foreground font-medium">
                  דמי שירות: ₪5 לפרסום
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  התשלום מתבצע בביט/פייבוקס לאחר אישור הפרסום
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Toy Name */}
              <div className="space-y-2">
                <Label htmlFor="toy_name">שם הצעצוע</Label>
                <Input
                  id="toy_name"
                  placeholder="לדוגמה: מכונית לגו טכניק"
                  value={formData.toy_name}
                  onChange={(e) => setFormData({ ...formData, toy_name: e.target.value })}
                  className="bg-background"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>קטגוריה</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as ToyCategory })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="בחרו קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as ToyCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label>מצב הצעצוע</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(v) => setFormData({ ...formData, condition: v as ToyCondition })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="בחרו מצב" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CONDITION_LABELS) as ToyCondition[]).map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {CONDITION_LABELS[cond]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">מחיר (₪)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-background"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">עיר</Label>
                <Input
                  id="city"
                  placeholder="לדוגמה: תל אביב"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-background"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="seller_phone">טלפון ליצירת קשר</Label>
                <Input
                  id="seller_phone"
                  type="tel"
                  placeholder="050-1234567"
                  value={formData.seller_phone}
                  onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                  className="bg-background"
                  dir="ltr"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>תמונה</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    לחצו להעלאת תמונה
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG עד 5MB
                  </p>
                </div>
                <Input
                  placeholder="או הדביקו קישור לתמונה"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-background text-sm"
                  dir="ltr"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Upload className="w-5 h-5 animate-pulse" />
                    מפרסם...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    פרסם צעצוע
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Publish;
