import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react';
import { api } from '../../services/api';
import ProductCard from '../ProductCard';
import QuickView from '../QuickView';
import { Reveal, SectionHead, SkeletonGrid } from '../ui';

/** ❤️ Love Lab — auto-scrolling right→left product rail. */
export default function LoveLab({ items }) {
  const [local, setLocal] = useState(null);
  const [quick, setQuick] = useState(null);
  const railRef = useRef(null);
  const list = items !== undefined ? items : local;

  useEffect(() => {
    if (items !== undefined) { setLocal(items || []); return; }
    api.products({ collection: 'love-lab', limit: 12 })
      .then((d) => setLocal(d.products))
      .catch(() => setLocal([]));
  }, [items]);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    let raf;
    const tick = () => {
      if (!el.paused) {
        el.scrollLeft += 0.6;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const pause = () => { el.paused = true; };
    const resume = () => { el.paused = false; };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, [list]);

  const nudge = (dir) => railRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <section className="section" style={{ background: 'radial-gradient(circle at 15% 20%, var(--primary-soft) 0%, #fff 55%)' }}>
      <div className="container">
        <SectionHead
          eyebrow={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><FlaskConical size={14} /> Love Lab</span>}
          title="❤️ Love Lab"
          sub="Made for the moments that matter."
          action={
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="rail-btn" style={{ position: 'static', transform: 'none' }} onClick={() => nudge(-1)} aria-label="Scroll left">
                <ChevronLeft size={20} />
              </button>
              <button className="rail-btn" style={{ position: 'static', transform: 'none' }} onClick={() => nudge(1)} aria-label="Scroll right">
                <ChevronRight size={20} />
              </button>
            </div>
          }
        />

        {!list ? (
          <SkeletonGrid count={4} />
        ) : (
          <div className="rail-wrap">
            <div className="rail" ref={railRef} style={{ cursor: 'grab' }}>
              {list.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i * 0.05, 0.25)}>
                  <ProductCard p={p} onQuickView={setQuick} />
                </Reveal>
              ))}
              <Link
                to="/collection/love-lab"
                className="folder"
                style={{ flex: '0 0 240px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}
              >
                <div style={{ textAlign: 'center', padding: 26 }}>
                  <div style={{ fontSize: '2.4rem' }}>💌</div>
                  <h3 style={{ fontSize: '1.15rem', margin: '10px 0 6px' }}>See all romantic gifts</h3>
                  <span className="folder-link" style={{ justifyContent: 'center' }}>Enter the Lab →</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
