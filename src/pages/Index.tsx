import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ToyCard } from '@/components/ToyCard';
import { useToyStore } from '@/store/toyStore';
import { Plus, Search, Sparkles, Heart, Shield } from 'lucide-react';

const Index = () => {
  const { toys } = useToyStore();
  const recentToys = toys.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center space-y-6 animate-slide-up">
            <div className="flex justify-center">
              <span className="text-7xl md:text-8xl animate-float">🧸</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              אוצרות עוברים בקופסה
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
          <div className="bg-card rounded-2xl p-6 shadow-card text-center space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">פשוט ומהיר</h3>
            <p className="text-muted-foreground text-sm">
              פרסום צעצוע תוך דקה אחת בלבד
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card text-center space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7 text-success" />
            </div>
            <h3 className="font-semibold text-lg">לסביבה ולארנק</h3>
            <p className="text-muted-foreground text-sm">
              חוסכים כסף ותורמים לכדור הארץ
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card text-center space-y-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-lg">בין הורים</h3>
            <p className="text-muted-foreground text-sm">
              קהילה של הורים שמבינים הורים
            </p>
          </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentToys.map((toy, index) => (
            <div 
              key={toy.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <ToyCard toy={toy} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-center text-primary-foreground shadow-elevated">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            יש לך צעצועים שלא משחקים בהם?
          </h2>
          <p className="text-lg opacity-90 mb-6">
            תנו להם בית חדש ותרוויחו כסף!
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            asChild
            className="bg-card text-foreground hover:bg-card/90"
          >
            <Link to="/publish">
              <Plus className="w-5 h-5" />
              פרסם עכשיו
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🧸</span>
            <span className="font-semibold text-foreground">אוצרות עוברים בקופסה</span>
          </div>
          <p className="text-muted-foreground text-sm">
            הפלטפורמה הפשוטה למכירת צעצועים בין הורים
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
