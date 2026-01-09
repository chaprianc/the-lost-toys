import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAddToy, uploadToyImage } from '@/hooks/useToys';
import { CATEGORY_LABELS, CONDITION_LABELS, CATEGORY_ICONS, ToyCategory, ToyCondition } from '@/types/toy';
import { toast } from 'sonner';
import { Camera, Upload, CheckCircle, Info, X, HelpCircle } from 'lucide-react';

const Publish = () => {
  const navigate = useNavigate();
  const addToy = useAddToy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    toy_name: '',
    category: '' as ToyCategory,
    condition: '' as ToyCondition,
    price: '',
    city: '',
    seller_phone: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [feeConfirmed, setFeeConfirmed] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.toy_name || !formData.category || !formData.condition || !formData.price || !formData.city || !formData.seller_phone) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    if (!imageFile) {
      toast.error('נא להעלות תמונה');
      return;
    }

    if (!feeConfirmed) {
      toast.error('נא לאשר את תנאי דמי השירות');
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadToyImage(imageFile);
      
      await addToy.mutateAsync({
        toy_name: formData.toy_name,
        category: formData.category,
        condition: formData.condition,
        price: Number(formData.price),
        city: formData.city,
        seller_phone: formData.seller_phone,
        images: [imageUrl],
      });

      toast.success('הצעצוע נשלח לאישור! יפורסם לאחר אישור התשלום 🎉');
      navigate('/browse');
    } catch (error) {
      console.error('Error publishing toy:', error);
      toast.error('שגיאה בשליחת הצעצוע. נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-secondary-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-foreground font-medium">
                      דמי שירות: ₪5 לפרסום
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowFeeDialog(true)}
                    >
                      <HelpCircle className="w-4 h-4 mr-1" />
                      פרטים
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    התשלום מתבצע בביט/פייבוקס לאחר אישור הפרסום
                  </p>
                </div>
              </div>
              
              {/* Confirmation checkbox */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                <Checkbox 
                  id="fee-confirm" 
                  checked={feeConfirmed}
                  onCheckedChange={(checked) => setFeeConfirmed(checked === true)}
                />
                <Label 
                  htmlFor="fee-confirm" 
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  אני מאשר/ת שאעביר את דמי השירות (₪5) בביט/פייבוקס לפני הפרסום
                </Label>
              </div>
            </div>

            {/* Service Fee Dialog */}
            <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">איך עובד תהליך הפרסום?</DialogTitle>
                  <DialogDescription className="text-right">
                    מידע על דמי השירות ואופן התשלום
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">מלאו את פרטי הצעצוע</p>
                      <p className="text-xs text-muted-foreground">שם, קטגוריה, מצב, מחיר ותמונה</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">העבירו ₪5 בביט או בפייבוקס</p>
                      <p className="text-xs text-muted-foreground">לטלפון: 050-1234567</p>
                      <p className="text-xs text-muted-foreground">ציינו בהערה את שם הצעצוע</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">אשרו והגישו את הטופס</p>
                      <p className="text-xs text-muted-foreground">לאחר האישור, הצעצוע יפורסם באתר</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 mt-4">
                    <p className="text-xs text-muted-foreground">
                      <strong>שימו לב:</strong> הפרסום יופיע באתר רק לאחר אישור קבלת התשלום. 
                      אם לא נקבל את התשלום תוך 24 שעות, הפרסום יוסר.
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={() => setShowFeeDialog(false)} className="w-full">
                    הבנתי, תודה!
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                  min="1"
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="תצוגה מקדימה"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      לחצו להעלאת תמונה
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG עד 5MB
                    </p>
                  </div>
                )}
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
