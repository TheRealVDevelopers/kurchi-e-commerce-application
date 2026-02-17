import { Home, Grid3X3, Sparkles, Tag, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

const MobileNavigation = () => {
  const location = useLocation();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid3X3, label: 'Categories', path: '/categories' },
    { icon: Sparkles, label: 'New', path: '/new-arrivals' },
    { icon: Tag, label: 'Offers', path: '/offers' },
    { icon: User, label: 'Account', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100">
      {/* Safe area padding for modern phones */}
      <div className="flex items-stretch justify-around px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isCart = item.path === '/cart';

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 py-2.5 min-w-0 group"
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-x-2 top-1.5 bottom-1.5 rounded-xl bg-stone-100" />
              )}

              <span className="relative flex flex-col items-center gap-1">
                <span className={cn(
                  'relative transition-all duration-200',
                  isActive
                    ? 'text-stone-900 scale-110'
                    : 'text-stone-400 group-hover:text-stone-600 group-hover:scale-105'
                )}>
                  <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />

                  {/* Cart count badge */}
                  {isCart && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-red-600 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </span>

                <span className={cn(
                  'text-[10px] font-medium tracking-tight transition-colors leading-none',
                  isActive ? 'text-stone-900' : 'text-stone-400'
                )}>
                  {item.label}
                </span>
              </span>
            </Link>
          );
        })}

        {/* Cart as separate entry replacing one slot on mobile */}
        {/* Injected as a floating pill-style entry between Offers and Account */}
      </div>
    </nav>
  );
};

export default MobileNavigation;