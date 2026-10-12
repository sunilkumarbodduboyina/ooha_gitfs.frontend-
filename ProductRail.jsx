import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import QuickView from './QuickView';
import { Reveal, SectionHead } from './ui';

/**
 * Reusable horizontal product rail with scroll arrows + a "View all" link.
 * Renders nothing when the section has no products, so empty sections never
 * show up on the homepage.
 */
export default function ProductRail({ id, eyebrow, title, sub, items = [], to = '/products', viewAllLabel = 'View all' }) {
  const [quick, setQuick] = useState(null);
  const railRef = useRef(null);

  if (!items.length) return null;
  const nudge = (dir) => railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <section className="section tight" id={id}>
      <div className="container">
        <SectionHead
          eyebrow={eyebrow}
          title={title}
          sub={sub}
          action={
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="rail-btn" style={{ position: 'static', transform: 'none' }} onClick={() => nudge(-1)} aria-label="Scroll left">
                <ChevronLeft size={20} />
              </button>
              <button className="rail-btn" style={{ position: 'static', transform: 'none' }} onClick={() => nudge(1)} aria-label="Scroll right">
                <ChevronRight size={20} />
              </button>
              <Link to={to} className="btn btn-outline btn-sm">{viewAllLabel} <ArrowRight size={15} /></Link>
            </div>
          }
        />
        <div className="rail-wrap">
          <div className="rail" ref={railRef}>
            {items.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.05, 0.25)}>
                <ProductCard p={p} onQuickView={setQuick} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
