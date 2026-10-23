import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Gift, Sparkles } from 'lucide-react';
import { img } from '../services/api';

const FALLBACK = [
  { id: 1, title: 'Make Every Moment Meaningful', subtitle: 'Thoughtful gifts, handcrafted with love and delivered across India.', image: '/images/banners/banner-1.svg', button_text: 'SHOP NOW', button_link: '/collection/best-sellers' },
  { id: 2, title: 'Thoughtful Gifts. Beautiful Memories.', subtitle: 'Personalised hampers, frames and keepsakes for every relationship.', image: '/images/banners/banner-2.svg', button_text: 'EXPLORE COLLECTION', button_link: '/collection/photo-gifts' },
  { id: 3, title: 'Celebrate Love, Every Single Day', subtitle: 'Romantic picks from our Love Lab — made for two hearts.', image: '/images/banners/banner-3.svg', button_text: 'ENTER LOVE LAB', button_link: '/collection/love-lab' },
];

/** Hero carousel — auto-advances every 3 seconds with a smooth fade, pauses on hover, arrows + dots. */
export default function HeroSlider({ slides = FALLBACK }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const count = slides.length;

  const go = useCallback((next) => setI((v) => (v + next + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return undefined;
    timer.current = setInterval(() => go(1), 2000);
    return () => clearInterval(timer.current);
  }, [paused, go, count]);

  if (!count) return null;
  const s = slides[i];

  return (
    <section
      className="hero"
      style={{ height: 'clamp(420px, 62vh, 640px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={s.id ?? i}
          className="hero-slide"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={img(s.image)} alt={s.title} fetchpriority="high" decoding="async" />
          <div className="hero-overlay" />
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="hero-kicker">
              <Sparkles size={14} /> Ooha Gifts · Festive Edit
            </span>
            <h1 className="hero-title">
              {s.title.split(' ').slice(0, -2).join(' ')}{' '}
              <em>{s.title.split(' ').slice(-2).join(' ')}</em>
            </h1>
            <p className="hero-sub">{s.subtitle}</p>
            <div className="hero-actions">
              <Link to={s.button_link && s.button_link !== '/' ? s.button_link : '/products'} className="btn btn-primary btn-lg">
                <Gift size={18} /> {s.button_text || 'SHOP NOW'}
              </Link>
              <Link to="/products" className="btn btn-white btn-lg">EXPLORE COLLECTION</Link>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <button className="hero-arrow prev" onClick={() => go(-1)} aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>
      <button className="hero-arrow next" onClick={() => go(1)} aria-label="Next slide">
        <ChevronRight size={24} />
      </button>

      <div className="hero-dots">
        {slides.map((sl, idx) => (
          <button
            key={sl.id ?? idx}
            className={`hero-dot ${idx === i ? 'active' : ''}`}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
