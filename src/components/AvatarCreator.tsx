import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAvatar, SHIRT_COLORS, type AvatarGender } from '@/hooks/useAvatar';

interface AvatarCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AvatarCreator = ({ open, onOpenChange }: AvatarCreatorProps) => {
  const { avatar, saveAvatar } = useAvatar();
  const [gender, setGender] = useState<AvatarGender>(avatar?.gender ?? 'boy');
  const [shirt, setShirt] = useState(avatar?.shirt ?? SHIRT_COLORS[0]);
  const [name, setName] = useState(avatar?.name ?? '');

  const handleSave = () => {
    saveAvatar({ gender, shirt, name: name.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm text-right">
        <DialogHeader>
          <DialogTitle className="text-xl">בואו ניצור את הדמות שלכם 🎈</DialogTitle>
          <DialogDescription>
            הדמות תסתובב איתכם בחנות התלת-ממדית בין המדפים.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>מי נכנס לחנות?</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['boy', 'girl'] as AvatarGender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`rounded-2xl border-2 p-4 transition-all ${
                    gender === g
                      ? 'border-primary bg-primary/10 shadow-card scale-105'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <span className="text-4xl block">{g === 'boy' ? '👦' : '👧'}</span>
                  <span className="font-semibold text-sm">{g === 'boy' ? 'בן' : 'בת'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>צבע חולצה</Label>
            <div className="flex flex-wrap gap-2">
              {SHIRT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`צבע ${color}`}
                  onClick={() => setShirt(color)}
                  className={`w-9 h-9 rounded-full border-4 transition-transform ${
                    shirt === color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-name">שם הדמות (אופציונלי)</Label>
            <Input
              id="avatar-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: דני"
              maxLength={20}
            />
          </div>

          <Button variant="default" size="lg" className="w-full" onClick={handleSave}>
            יאללה, יוצרים דמות!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** Shows the avatar creator automatically the first time a visitor opens the app. */
export const AvatarOnboarding = () => {
  const { hasAvatar } = useAvatar();
  const [open, setOpen] = useState(!hasAvatar);

  if (hasAvatar && !open) return null;
  return <AvatarCreator open={open} onOpenChange={setOpen} />;
};
