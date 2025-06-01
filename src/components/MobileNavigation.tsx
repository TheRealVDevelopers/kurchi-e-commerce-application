
import { Home, Grid3X3, Sparkles, Tag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const MobileNavigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid3X3, label: 'Categories', path: '/categories' },
    { icon: Sparkles, label: 'New', path: '/new-arrivals' },
    { icon: Tag, label: 'Offers', path: '/offers' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-3 min-w-0 flex-1",
                isActive 
                  ? "text-amber-700" 
                  : "text-stone-500 hover:text-amber-700"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1",
                isActive && "fill-amber-100"
              )} />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
