import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Menu, X, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useApp } from '@/context/AppContext';

const Header = () => {
  const location = useLocation();
  const { cartItems } = useCart();
  const { user } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'New Arrivals', path: '/new-arrivals' },
    { label: 'Offers', path: '/offers' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
            : 'bg-[#FAF8F5]'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl font-black tracking-tight text-stone-900">
                🪑 KURCHI
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200',
                    isActive(path)
                      ? 'text-stone-900 bg-warm-50'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-warm-50/60'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-0.5">
              <Link
                to="/categories"
                className="hidden md:flex w-9 h-9 items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-warm-50 transition-colors"
              >
                <Search className="w-[17px] h-[17px]" />
              </Link>

              <Link
                to="/wishlist"
                className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-warm-50 transition-colors"
              >
                <Heart className="w-[17px] h-[17px]" />
              </Link>

              {/* Cart — live count badge */}
              <Link
                to="/cart"
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-warm-50 transition-colors"
              >
                <ShoppingCart className="w-[17px] h-[17px]" />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-[3px] rounded-full bg-warm-600 text-white text-[9px] font-bold flex items-center justify-center leading-none"
                    style={{ animation: 'badgePop 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Profile pill */}
              <Link
                to={user ? '/profile' : '/login'}
                className="hidden md:flex items-center gap-2 ml-2 pl-2.5 pr-3.5 h-9 rounded-full border border-stone-200 hover:border-warm-300 bg-white hover:bg-warm-50 transition-colors text-sm font-medium text-stone-700"
              >
                {user?.avatar ? (
                  <img src={user.avatar} className="w-5 h-5 rounded-full object-cover ring-1 ring-stone-200" alt="" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center">
                    <User className="w-3 h-3 text-stone-500" />
                  </div>
                )}
                <span className="max-w-[72px] truncate">
                  {user ? user.name?.split(' ')[0] : 'Sign in'}
                </span>
              </Link>

              {/* Mobile hamburger */}
              <button
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:bg-warm-50 transition-colors ml-1"
                onClick={() => setMenuOpen(v => !v)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            menuOpen ? 'max-h-[400px]' : 'max-h-0'
          )}
          style={{ borderTop: menuOpen ? '1px solid #f5f5f4' : 'none' }}
        >
          <nav className="px-4 py-3 bg-[#FAF8F5] flex flex-col gap-0.5">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-colors',
                  isActive(path)
                    ? 'bg-warm-50 text-stone-900'
                    : 'text-stone-600 hover:bg-warm-50/60 hover:text-stone-900'
                )}
              >
                {label}
              </Link>
            ))}
            <div className="mt-1 pt-2 border-t border-stone-100">
              <Link
                to={user ? '/profile' : '/login'}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <User className="w-4 h-4" />
                {user ? `${user.name?.split(' ')[0]} — My Account` : 'Sign in'}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Fixed header spacer */}
      <div className="h-16" />

      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Header;