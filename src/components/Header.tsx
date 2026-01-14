import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50 bg-secondary backdrop-blur-lg border-b border-secondary/80 shadow-soft" role="banner">
      <div className="container mx-auto px-4 py-3 bg-primary-foreground">
        <div className="flex items-center justify-end">
          <nav className="flex items-center gap-3" role="navigation" aria-label="ניווט ראשי">
            <Button variant="ghost" size="sm" asChild className={`gap-2 text-secondary-foreground hover:bg-secondary-foreground/10 ${location.pathname === '/' ? 'bg-secondary-foreground/20' : ''}`}>
              <Link to="/" aria-label="דף הבית" aria-current={location.pathname === '/' ? 'page' : undefined}>
                <span className="text-lg" aria-hidden="true">🧸</span>
                <span>בית</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className={`gap-2 text-secondary-foreground hover:bg-secondary-foreground/10 ${location.pathname === '/admin' ? 'bg-secondary-foreground/20' : ''}`}>
              <Link to="/admin" aria-label="ממשק ניהול" aria-current={location.pathname === '/admin' ? 'page' : undefined}>
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>מנהל</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};