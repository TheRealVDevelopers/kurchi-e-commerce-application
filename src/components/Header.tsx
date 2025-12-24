
import { Search, ShoppingCart, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Offers', path: '/offers' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-bright-red-700 to-bright-red-800 bg-clip-text text-transparent">
            🪑 KURCHI
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-stone-600 hover:text-bright-red-700 transition-colors font-medium text-sm",
                  location.pathname === item.path && "text-bright-red-700 font-bold"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-2">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="text-stone-600 hover:text-bright-red-700">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative text-stone-600 hover:text-bright-red-700">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-bright-red-600 text-white text-[10px] border-none">
                  3
                </Badge>
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="text-stone-600 hover:text-bright-red-700">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
