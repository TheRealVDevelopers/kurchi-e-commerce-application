
import { Search, ShoppingCart, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'New Arrivals', path: '/new-arrivals' },
    { label: 'Offers', path: '/offers' },
    { label: 'About', path: '/about' }
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            🪑 KURCHI
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-stone-600 hover:text-amber-700 transition-colors font-medium",
                  location.pathname === item.path && "text-amber-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-stone-100 rounded-full px-4 py-2 flex-1 max-w-md mx-8">
            <Search className="h-5 w-5 text-stone-400 mr-3" />
            <input
              type="text"
              placeholder="Search furniture..."
              className="bg-transparent outline-none flex-1 text-stone-700"
            />
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-amber-600">3</Badge>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
