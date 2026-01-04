import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Plus, Search, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🧸</span>
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              אוצרות אבודים
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">בית</span>
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/browse' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/browse">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">חיפוש</span>
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/publish' ? 'hero' : 'outline'}
              size="sm"
              asChild
            >
              <Link to="/publish">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">פרסום</span>
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/admin' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/admin">
                <ShieldCheck className="w-4 h-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
