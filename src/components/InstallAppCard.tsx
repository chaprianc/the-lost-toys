import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'install-card-dismissed';

export const InstallAppCard = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent;
    setIsIos(/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setIsStandalone(true));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const handleInstall = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') setPromptEvent(null);
      return;
    }
    setShowIosHelp(true);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  if (isStandalone || dismissed) return null;

  return (
    <>
      <section className="container mx-auto px-4 pt-2" aria-label="התקנת האפליקציה">
        <div className="relative bg-card rounded-2xl shadow-card p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
          <button
            onClick={handleDismiss}
            aria-label="סגור הצעת התקנה"
            className="absolute top-2 left-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-primary" aria-hidden="true" />
          </div>

          <div className="flex-1 space-y-1">
            <h2 className="font-semibold text-lg text-foreground">התקינו את האפליקציה על הנייד</h2>
            <p className="text-sm text-muted-foreground">
              פתיחה מהירה ממסך הבית, במסך מלא וללא סרגל דפדפן — בלי חנות אפליקציות.
            </p>
          </div>

          <Button variant="hero" size="lg" onClick={handleInstall} className="shrink-0">
            <Download className="w-5 h-5" aria-hidden="true" />
            התקנה
          </Button>
        </div>
      </section>

      <Dialog open={showIosHelp} onOpenChange={setShowIosHelp}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>הוספה למסך הבית</DialogTitle>
          </DialogHeader>
          <ol className="space-y-4 text-sm text-foreground">
            {isIos ? (
              <>
                <li className="flex items-center gap-3">
                  <Share className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                  <span>לחצו על כפתור השיתוף בתחתית הדפדפן</span>
                </li>
                <li className="flex items-center gap-3">
                  <PlusSquare className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                  <span>בחרו "הוספה למסך הבית"</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-3">
                  <PlusSquare className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                  <span>פתחו את תפריט הדפדפן (שלוש נקודות)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                  <span>בחרו "התקן אפליקציה" או "הוסף למסך הבית"</span>
                </li>
              </>
            )}
            <li className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
              <span>האייקון יופיע במסך הבית ויפתח את החנות במסך מלא</span>
            </li>
          </ol>
          <Button variant="outline" onClick={() => setShowIosHelp(false)} className="w-full">
            הבנתי
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
