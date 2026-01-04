import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ShieldCheck } from 'lucide-react';
export const Header = () => {
  const location = useLocation();
  return <header className="sticky top-0 z-50 bg-secondary backdrop-blur-lg border-b border-secondary/80 shadow-soft">
      <div className="container mx-auto px-4 py-3 bg-primary-foreground">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🧸</span>
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              אוצרות אבודים
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Button variant={location.pathname === '/' ? 'default' : 'ghost'} size="sm" asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                <span>בית</span>
              </Link>
            </Button>
            <Button variant={location.pathname === '/admin' ? 'default' : 'ghost'} size="sm" asChild className="gap-2">
              <Link to="/admin">
                <ShieldCheck className="w-4 h-4" />
                <span>מנהל</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>;
};