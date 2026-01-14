import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Accessibility, X, Type, Contrast, Zap } from 'lucide-react';

interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'accessibility-settings';

export const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      largeText: false,
      highContrast: false,
      reduceMotion: false,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Apply large text
    if (settings.largeText) {
      document.documentElement.classList.add('accessibility-large-text');
    } else {
      document.documentElement.classList.remove('accessibility-large-text');
    }
    
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('accessibility-high-contrast');
    } else {
      document.documentElement.classList.remove('accessibility-high-contrast');
    }
    
    // Apply reduce motion
    if (settings.reduceMotion) {
      document.documentElement.classList.add('accessibility-reduce-motion');
    } else {
      document.documentElement.classList.remove('accessibility-reduce-motion');
    }
  }, [settings]);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <>
      {/* Floating Accessibility Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 rounded-full w-14 h-14 shadow-elevated bg-primary hover:bg-primary/90"
        size="icon"
        aria-label="הגדרות נגישות"
        aria-expanded={isOpen}
      >
        <Accessibility className="w-6 h-6" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-foreground text-accent w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-20 left-4 z-50 bg-card border border-border rounded-xl shadow-elevated p-4 w-72"
          role="dialog"
          aria-label="תפריט נגישות"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-foreground">הגדרות נגישות</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="סגור תפריט נגישות"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Large Text */}
            <button
              onClick={() => toggleSetting('largeText')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                settings.largeText 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              aria-pressed={settings.largeText}
            >
              <Type className="w-5 h-5" />
              <div className="text-right flex-1">
                <div className="font-medium">הגדלת טקסט</div>
                <div className={`text-xs ${settings.largeText ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  הגדל את כל הטקסטים באתר
                </div>
              </div>
            </button>

            {/* High Contrast */}
            <button
              onClick={() => toggleSetting('highContrast')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                settings.highContrast 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              aria-pressed={settings.highContrast}
            >
              <Contrast className="w-5 h-5" />
              <div className="text-right flex-1">
                <div className="font-medium">ניגודיות גבוהה</div>
                <div className={`text-xs ${settings.highContrast ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  הגבר את הניגודיות לקריאה טובה יותר
                </div>
              </div>
            </button>

            {/* Reduce Motion */}
            <button
              onClick={() => toggleSetting('reduceMotion')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                settings.reduceMotion 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              aria-pressed={settings.reduceMotion}
            >
              <Zap className="w-5 h-5" />
              <div className="text-right flex-1">
                <div className="font-medium">הפחתת אנימציות</div>
                <div className={`text-xs ${settings.reduceMotion ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  הפחת תנועה והסחות דעת
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
