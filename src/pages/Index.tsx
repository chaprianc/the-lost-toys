import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ToyCard } from '@/components/ToyCard';
import { useToys } from '@/hooks/useToys';
import { Plus, Search, Sparkles, Heart, Shield, Loader2, ChevronDown } from 'lucide-react';

// Confetti piece component
const ConfettiPiece = ({ delay, left, color, size, duration }: { 
  delay: number; 
  left: number; 
  color: string; 
  size: number;
  duration: number;
}) => (
  <div
    className="absolute top-0 animate-confetti-fall"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  >
    <div
      className="rounded-sm animate-confetti-spin"
      style={{
        width: `${size}px`,
        height: `${size * 0.6}px`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
      }}
    />
  </div>
);

const confettiColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  '#FFD93D', // yellow
  '#6BCB77', // green
  '#FF6B6B', // coral
  '#4D96FF', // blue
  '#C9B1FF', // lavender
];

const features = [{
  id: 'simple',
  icon: Sparkles,
  iconBg: 'bg-primary/10',
  iconColor: 'text-primary',
  title: 'פשוט ומהיר',
  short: 'פרסום צעצוע תוך דקה אחת בלבד',
  details: 'ללא הרשמה מסובכת, ללא עמלות נסתרות. פשוט מעלים תמונה, ממלאים כמה פרטים בסיסיים ומפרסמים. הצעצוע שלכם מוכן למכירה תוך דקה!'
}, {
  id: 'eco',
  icon: Heart,
  iconBg: 'bg-success/10',
  iconColor: 'text-success',
  title: 'לסביבה ולארנק',
  short: 'חוסכים כסף ותורמים לכדור הארץ',
  details: 'במקום לזרוק צעצועים לפח, תנו להם חיים חדשים! חוסכים עד 70% ממחיר צעצוע חדש, ובמקביל מפחיתים פסולת ושומרים על הסביבה לדורות הבאים.'
}, {
  id: 'parents',
  icon: Shield,
  iconBg: 'bg-secondary',
  iconColor: 'text-secondary-foreground',
  title: 'בין הורים',
  short: 'קהילה של הורים שמבינים הורים',
  details: 'קהילה בטוחה ואמינה של הורים כמוכם. אנחנו מבינים שצעצועים הם לא רק חפצים - הם זכרונות. כאן תמצאו אנשים שמעריכים את זה.'
}];
const Index = () => {
  const {
    data: toys = [],
    isLoading
  } = useToys();
  const recentToys = toys.slice(0, 4);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number;
    delay: number;
    left: number;
    color: string;
    size: number;
    duration: number;
  }>>([]);

  const toggleFeature = (id: string) => {
    setExpandedFeature(expandedFeature === id ? null : id);
  };

  // Generate confetti on mount
  useEffect(() => {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      left: Math.random() * 100,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: 8 + Math.random() * 8,
      duration: 4 + Math.random() * 4,
    }));
    setConfettiPieces(pieces);
  }, []);

  return <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Confetti Animation */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {confettiPieces.map((piece) => (
          <ConfettiPiece
            key={piece.id}
            delay={piece.delay}
            left={piece.left}
            color={piece.color}
            size={piece.size}
            duration={piece.duration}
          />
        ))}
      </div>
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10 bg-primary-foreground" />
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center space-y-6 animate-slide-up bg-[sidebar-accent-foreground] bg-primary-foreground">
            <div className="flex justify-center">
              <span className="text-7xl md:text-8xl animate-float">🧸</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="text-gradient">צעצועים עם סיפור</span><br />
              <span className="text-foreground">להורים חכמים</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
              המקום הכי פשוט למכור ולקנות צעצועים איכותיים במחירים משתלמים
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/publish">
                  <Plus className="w-6 h-6" />
                  פרסם צעצוע
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/browse">
                  <Search className="w-6 h-6" />
                  חפש צעצוע
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => <div key={feature.id} onClick={() => toggleFeature(feature.id)} className="bg-card rounded-2xl p-6 shadow-card text-center space-y-3 animate-slide-up cursor-pointer transition-all duration-300 hover:shadow-elevated" style={{
          animationDelay: `${0.1 * (index + 1)}s`
        }}>
              <div className={`w-14 h-14 ${feature.iconBg} rounded-full flex items-center justify-center mx-auto`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.short}
              </p>
              <div className={`overflow-hidden transition-all duration-300 ${expandedFeature === feature.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-foreground text-sm pt-3 border-t border-border mt-3">
                  {feature.details}
                </p>
              </div>
              <ChevronDown className={`w-5 h-5 mx-auto text-muted-foreground transition-transform duration-300 ${expandedFeature === feature.id ? 'rotate-180' : ''}`} />
            </div>)}
        </div>
      </section>

      {/* Recent Toys */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">צעצועים חדשים</h2>
          <Button variant="ghost" asChild>
            <Link to="/browse">
              צפה בהכל
              <Search className="w-4 h-4 mr-2" />
            </Link>
          </Button>
        </div>
        {isLoading ? <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div> : recentToys.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentToys.map((toy, index) => <div key={toy.id} className="animate-card-entrance" style={{
          animationDelay: `${0.15 * index}s`
        }}>
                <ToyCard toy={toy} />
              </div>)}
          </div> : <div className="text-center py-8 text-muted-foreground">
            <p>עדיין אין צעצועים. היו הראשונים לפרסם!</p>
          </div>}
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🧸</span>
            <span className="font-semibold text-foreground">אוצרות אבודים</span>
          </div>
          <p className="text-muted-foreground text-sm text-center mb-6">
            הפלטפורמה הפשוטה למכירת צעצועים בין הורים
          </p>
          
          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/faq" className="text-primary hover:text-primary/80 transition-colors">
              שאלות נפוצות
            </Link>
            <span className="text-border">|</span>
            <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
              תקנון האתר
            </Link>
            <span className="text-border">|</span>
            <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
              מדיניות פרטיות
            </Link>
            <span className="text-border">|</span>
            <Link to="/contact" className="text-primary hover:text-primary/80 transition-colors">
              צור קשר
            </Link>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
