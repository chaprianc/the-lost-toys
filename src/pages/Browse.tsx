import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { ToyCard } from '@/components/ToyCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { useToys } from '@/hooks/useToys';
import { ToyCategory } from '@/types/toy';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, Loader2, MapPin } from 'lucide-react';

const Browse = () => {
  const { data: toys = [], isLoading } = useToys();
  const [selectedCategory, setSelectedCategory] = useState<ToyCategory | undefined>();
  const [cityFilter, setCityFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  // Get unique cities from toys
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(toys.map(toy => toy.city))];
    return uniqueCities.sort((a, b) => a.localeCompare(b, 'he'));
  }, [toys]);

  const filteredToys = useMemo(() => {
    let result = [...toys];

    if (selectedCategory) {
      result = result.filter((toy) => toy.category === selectedCategory);
    }

    if (cityFilter) {
      result = result.filter((toy) => toy.city === cityFilter);
    }

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        result = [...result].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [toys, selectedCategory, cityFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">חיפוש צעצועים</h1>
          <p className="text-muted-foreground">
            {filteredToys.length} צעצועים זמינים
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={cityFilter || "all"} onValueChange={(v) => setCityFilter(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border">
                <MapPin className="w-4 h-4 ml-2" />
                <SelectValue placeholder="כל הערים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הערים</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border">
                <SlidersHorizontal className="w-4 h-4 ml-2" />
                <SelectValue placeholder="מיון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">החדשים ביותר</SelectItem>
                <SelectItem value="price-low">מחיר: נמוך לגבוה</SelectItem>
                <SelectItem value="price-high">מחיר: גבוה לנמוך</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">טוען צעצועים...</p>
          </div>
        ) : filteredToys.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredToys.map((toy, index) => (
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
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              לא נמצאו צעצועים
            </h3>
            <p className="text-muted-foreground">
              נסו לשנות את הפילטרים או לחפש מונח אחר
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
