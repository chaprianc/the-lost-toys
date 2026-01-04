import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ToyCard } from '@/components/ToyCard';
import { useToys } from '@/hooks/useToys';
import { Plus, Search, Sparkles, Heart, Shield, Loader2, ChevronDown } from 'lucide-react';
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
  const toggleFeature = (id: string) => {
    setExpandedFeature(expandedFeature === id ? null : id);
  };
  return <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10 bg-primary-foreground" />
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center space-y-6 animate-slide-up bg-[sidebar-accent-foreground] bg-accent">
            <div className="flex justify-center">
              <span className="text-7xl md:text-8xl animate-float">🧸</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              אוצרות אבודים
              <br />
              <span className="text-gradient">קונים חכם</span>
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
            {recentToys.map((toy, index) => <div key={toy.id} className="animate-slide-up" style={{
          animationDelay: `${0.1 * index}s`
        }}>
                <ToyCard toy={toy} />
              </div>)}
          </div> : <div className="text-center py-8 text-muted-foreground">
            <p>עדיין אין צעצועים. היו הראשונים לפרסם!</p>
          </div>}
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🧸</span>
            <span className="font-semibold text-foreground">אוצרות אבודים</span>
          </div>
          <p className="text-muted-foreground text-sm">
            הפלטפורמה הפשוטה למכירת צעצועים בין הורים
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;