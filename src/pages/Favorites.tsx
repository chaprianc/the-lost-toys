import { Header } from '@/components/Header';
import { ToyCard } from '@/components/ToyCard';
import { useToys } from '@/hooks/useToys';
import { useFavorites } from '@/hooks/useFavorites';
import { Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const { data: toys = [], isLoading } = useToys();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const favoriteToys = toys.filter(toy => favorites.includes(toy.id));

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Heart className="w-7 h-7 text-destructive fill-destructive" />
            המועדפים שלי
          </h1>
          <p className="text-muted-foreground">
            {favoriteToys.length} צעצועים שמורים
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">טוען...</p>
          </div>
        ) : favoriteToys.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoriteToys.map((toy, index) => (
              <div
                key={toy.id}
                className="animate-card-entrance"
                style={{ animationDelay: `${0.1 * Math.min(index, 8)}s` }}
              >
                <ToyCard toy={toy} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">💔</span>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              אין עדיין מועדפים
            </h3>
            <p className="text-muted-foreground mb-6">
              לחצו על ❤️ בכרטיס צעצוע כדי לשמור אותו כאן
            </p>
            <Button onClick={() => navigate('/browse')}>
              חיפוש צעצועים
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
