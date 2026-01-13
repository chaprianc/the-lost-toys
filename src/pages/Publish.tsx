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
import { validateToySubmission, validateImageFile } from '@/lib/toyValidation';

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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [feeConfirmed, setFeeConfirmed] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  const addImages = (files: File[]) => {
    const remainingSlots = 3 - imageFiles.length;
    if (remainingSlots <= 0) {
      toast.error('ניתן להעלות עד 3 תמונות');
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of filesToAdd) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...validPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic presence validation
    if (!formData.toy_name || !formData.category || !formData.condition || !formData.price || !formData.city || !formData.seller_phone) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('נא להעלות לפחות תמונה אחת');
      return;
    }

    if (!feeConfirmed) {
      toast.error('נא לאשר את תנאי דמי השירות');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all images
      const imageUrls = await Promise.all(
        imageFiles.map(file => uploadToyImage(file))
      );
      
      // Prepare submission data
      const submissionData = {
        toy_name: formData.toy_name.trim(),
        category: formData.category,
        condition: formData.condition,
        price: Number(formData.price),
        city: formData.city.trim(),
        seller_phone: formData.seller_phone.replace(/[-\s]/g, ''),
        images: imageUrls,
      };

      // Validate with Zod schema before submission
      const validation = validateToySubmission(submissionData);
      
      if (!validation.success) {
        const firstError = validation.errors?.[0];
        toast.error(firstError?.message || 'נתונים לא תקינים');
        setIsSubmitting(false);
        return;
      }

      await addToy.mutateAsync({
        toy_name: validation.data!.toy_name,
        category: validation.data!.category,
        condition: validation.data!.condition,
        price: validation.data!.price,
        city: validation.data!.city,
        seller_phone: validation.data!.seller_phone,
        images: validation.data!.images,
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
                    העבירו ₪5 לטלפון <span className="font-bold" dir="ltr">052-6901137</span>
                  </p>
                  
                  {/* Payment buttons */}
                  <div className="flex gap-2 mt-3">
                    <a
                      href="https://www.payboxapp.com/?d=4MWR2F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#00D4AA] hover:bg-[#00C49A] text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
                    >
                      💳 פייבוקס
                    </a>
                    <a
                      href="https://bitpay.co.il/app/me/chaprianc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#3ECFB2] hover:bg-[#35B89D] text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
                    >
                      💰 ביט
                    </a>
                  </div>
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
                  אני מאשר/ת שהעברתי את דמי השירות (₪5) בביט/פייבוקס
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
                      <p className="text-xs text-muted-foreground" dir="ltr">לטלפון: 052-6901137</p>
                      <p className="text-xs text-muted-foreground">ציינו בהערה את שם הצעצוע</p>
                      <div className="flex gap-2 mt-2">
                        <a
                          href="https://www.payboxapp.com/?d=4MWR2F"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#00D4AA] hover:bg-[#00C49A] text-white rounded-md py-1 px-2 text-xs font-medium transition-colors"
                        >
                          פייבוקס
                        </a>
                        <a
                          href="https://bitpay.co.il/app/me/chaprianc"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#3ECFB2] hover:bg-[#35B89D] text-white rounded-md py-1 px-2 text-xs font-medium transition-colors"
                        >
                          ביט
                        </a>
                      </div>
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
                <Label>תמונות (עד 3)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {/* Image previews grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden aspect-square">
                        <img
                          src={preview}
                          alt={`תצוגה מקדימה ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload/Camera buttons */}
                {imagePreviews.length < 3 && (
                  <div className="flex gap-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-2 border-dashed border-border rounded-xl p-4 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        העלאה מהגלריה
                      </p>
                    </div>
                    <div
                      onClick={handleCameraCapture}
                      className="flex-1 border-2 border-dashed border-border rounded-xl p-4 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        צילום
                      </p>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground text-center">
                  PNG, JPG עד 5MB • {imagePreviews.length}/3 תמונות
                </p>
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
