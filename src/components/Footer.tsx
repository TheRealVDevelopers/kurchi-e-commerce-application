import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  const links = {
    Shop: [
      { label: 'All Categories', path: '/categories' },
      { label: 'New Arrivals', path: '/new-arrivals' },
      { label: 'Flash Deals', path: '/offers' },
      { label: 'Best Sellers', path: '/categories?filter=best' },
    ],
    Help: [
      { label: 'Track Order', path: '/orders' },
      { label: 'Returns & Exchanges', path: '/returns' },
      { label: 'Shipping Info', path: '/shipping' },
      { label: 'FAQs', path: '/faq' },
    ],
    Company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
    ],
  };

  const socials = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Twitter,   label: 'Twitter',   href: '#' },
    { icon: Facebook,  label: 'Facebook',  href: '#' },
    { icon: Youtube,   label: 'YouTube',   href: '#' },
  ];

  return (
    <footer className="hidden md:block bg-[#FAF8F5] border-t border-stone-200/60 mt-24">

      {/* Newsletter strip */}
      <div className="border-b border-stone-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-stone-900">Get the best deals first</h3>
            <p className="text-stone-400 text-sm mt-0.5">New arrivals, flash sales & exclusive offers — delivered weekly.</p>
          </div>
          <form
            onSubmit={e => e.preventDefault()}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <div className="relative flex-1 md:w-72">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-stone-900 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-warm-700 transition-colors whitespace-nowrap"
            >
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand col */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl font-black tracking-tight text-stone-900">🪑 KURCHI</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              Premium furniture for every room. Quality craftsmanship at prices that make sense.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2.5">
              <a href="tel:+911234567890" className="flex items-center gap-2.5 text-sm text-stone-500 hover:text-stone-900 transition-colors group">
                <span className="w-7 h-7 rounded-full bg-warm-50 group-hover:bg-warm-100 flex items-center justify-center transition-colors shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                +91 12345 67890
              </a>
              <a href="mailto:hello@kurchi.in" className="flex items-center gap-2.5 text-sm text-stone-500 hover:text-stone-900 transition-colors group">
                <span className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-colors shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                hello@kurchi.in
              </a>
              <div className="flex items-center gap-2.5 text-sm text-stone-500">
                <span className="w-7 h-7 rounded-full bg-warm-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                Mumbai, India
              </div>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <span>© {year} Kurchi. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-stone-600 transition-colors">Privacy</Link>
            <Link to="/terms"   className="hover:text-stone-600 transition-colors">Terms</Link>
            <Link to="/sitemap" className="hover:text-stone-600 transition-colors">Sitemap</Link>
          </div>
          {/* Payment badges */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'UPI', 'GPay'].map(b => (
              <span key={b} className="px-2 py-1 rounded border border-stone-200 text-[10px] font-bold text-stone-400">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;