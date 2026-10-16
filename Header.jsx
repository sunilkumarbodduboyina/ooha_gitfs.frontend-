import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ShoppingBag, User, X, Clock, TrendingUp } from 'lucide-react';
import { api, img, inr } from '../services/api';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

const RECENT_KEY = 'ooha_recent_searches';

/* Top navigation — replaces the old hamburger/sidebar menu. */
const NAV = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'All Products' },
  { to: '/gifts/love', label: 'Love Gifts' },
  { to: '/occasion/birthday', label: 'Birthday Gifts' },
  { to: '/occasion/anniversary', label: 'Anniversary Gifts' },
  { to: '/occasions', label: 'Occasions' },
  { to: '/relationships', label: 'Relationships' },
  { to: '/collection/corporate', label: 'Corporate Gifts' },
  { to: '/orders', label: 'My Orders' },
];

export default function Header() {
  const { cartCount } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [results, setResults] = useState(null);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });
  const [scrolled, setScrolled] = useState(false);
  const boxRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setMobileSearch(false); }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const suggest = (value) => {
    setTerm(value);
    clearTimeout(timer.current);
    if (value.trim().length < 2) { setResults(null); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const d = await api.search(value.trim());
        setResults(d);
        setOpen(true);
      } catch { setResults(null); }
    }, 260);
  };

  const commit = (value) => {
    const v = (value ?? term).trim();
    if (!v) return;
    const next = [v, ...recent.filter((r) => r !== v)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setOpen(false);
    setMobileSearch(false);
    navigate(`/search?q=${encodeURIComponent(v)}`);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Ooha Gifts home">
          <span>OOHA <em>GIFTS</em></span>
          <span className="brand-sub">gift · love · memory</span>
        </Link>

        <div className="header-search" ref={boxRef}>
          <span className="search-icon"><Search size={17} /></span>
          <input
            className="input"
            value={term}
            onChange={(e) => suggest(e.target.value)}
            onFocus={() => term.trim().length >= 2 && setOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            placeholder="Search gifts, occasions, relationships…"
            aria-label="Search products"
          />
          <AnimatePresence>
            {open && (
              <motion.div
                className="search-pop"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {results && (results.products.length || results.categories.length || results.collections.length) ? (
                  <>
                    {results.products.length > 0 && <div className="sp-head">Products</div>}
                    {results.products.map((p) => (
                      <div key={p.id} className="search-item" onClick={() => { setTerm(''); commit(p.name); navigate(`/product/${p.slug}`); }}>
                        <img src={img(p.image)} alt="" />
                        <div>
                          <div className="si-name">{p.name}</div>
                          <div className="si-meta">Gift · {p.discount_percentage > 0 ? `${Math.round(p.discount_percentage)}% off` : 'available'}</div>
                        </div>
                        <span className="si-price">{inr(p.selling_price)}</span>
                      </div>
                    ))}
                    {results.collections.length > 0 && <div className="sp-head">Collections &amp; Occasions</div>}
                    {results.collections.map((c) => (
                      <div key={`c-${c.slug}`} className="search-item" onClick={() => commit()}>
                        <div className="si-name" style={{ paddingLeft: 6 }}>{c.name}</div>
                        <span className="si-meta" style={{ marginLeft: 'auto' }}>{c.type}</span>
                      </div>
                    ))}
                    <div className="sp-head">Press Enter to see all results</div>
                  </>
                ) : (
                  <div className="search-empty">
                    🎁 No matches for “{term}” — try “birthday”, “frame” or “for her”
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="header-actions">
          <button
            className="icon-btn mobile-search-toggle"
            onClick={() => setMobileSearch((v) => !v)}
            aria-label="Toggle search"
          >
            {mobileSearch ? <X size={20} /> : <Search size={20} />}
          </button>

          <Link to={user && user.role !== 'admin' ? '/orders' : '/login'} className="icon-btn" aria-label={user ? 'My account' : 'Login'}>
            <User size={21} />
          </Link>

          <Link
            to={user && user.role !== 'admin' ? '/cart' : '/login'}
            className="icon-btn"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingBag size={21} />
            {cartCount > 0 && <motion.span
              className="cart-count"
              key={cartCount}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            >
              {cartCount}
            </motion.span>}
          </Link>
        </div>
      </div>

      <nav className="site-nav" aria-label="Main navigation">
        <div className="container site-nav-inner">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={location.pathname === n.to ? 'on' : ''}>
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            className="header-search mobile-open"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            ref={boxRef}
          >
            <span className="search-icon"><Search size={17} /></span>
            <input
              className="input"
              autoFocus
              value={term}
              onChange={(e) => suggest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commit()}
              placeholder="Search gifts, occasions…"
            />
            {recent.length > 0 && !term && (
              <div className="search-pop">
                <div className="sp-head">Recent searches</div>
                {recent.map((r) => (
                  <div key={r} className="search-item" onClick={() => commit(r)}>
                    <Clock size={15} style={{ color: 'var(--ink-3)' }} />
                    <div className="si-name">{r}</div>
                  </div>
                ))}
                <div className="sp-head" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <TrendingUp size={13} /> Popular: birthday gift for girlfriend · couple mug
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
