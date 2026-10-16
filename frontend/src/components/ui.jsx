import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

/** Fade/slide-in reveal used across sections. */
export function Reveal({ children, delay = 0, y = 26, className = '', once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Section heading with eyebrow + title + subtitle. */
export function SectionHead({ eyebrow, title, sub, action, center = false }) {
  return (
    <div className={`section-head ${center ? 'center' : 'row'}`}>
      <Reveal>
        <div>
          {eyebrow && <div className="eyebrow" style={center ? { justifyContent: 'center' } : undefined}>{eyebrow}</div>}
          <h2 className="section-title">{title}</h2>
          {sub && <p className="section-sub">{sub}</p>}
        </div>
      </Reveal>
      {action && <Reveal delay={0.1}>{action}</Reveal>}
    </div>
  );
}

/** Star rating display (supports halves visually via filled count). */
export function Stars({ value = 5, size = 14 }) {
  const v = Number(value) || 0;
  return (
    <span className="pc-stars" aria-label={`${v} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(v) ? 'currentColor' : 'none'}
          strokeWidth={2}
          style={{ opacity: i <= Math.round(v) ? 1 : 0.35 }}
        />
      ))}
    </span>
  );
}

/** Loading skeleton grid. */
export function SkeletonGrid({ count = 8, className = 'grid-4' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card" style={{ pointerEvents: 'none' }}>
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 0 }} />
          <div className="pc-body">
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
            <div className="skeleton" style={{ height: 18, width: '85%' }} />
            <div className="skeleton" style={{ height: 22, width: '55%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = '🎁', title, text, action }) {
  return (
    <div className="empty-state">
      <div className="es-icon" style={{ fontSize: '2.4rem' }}>{icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 60, gap: 12 }}>
      <div
        style={{
          width: 46, height: 46, borderRadius: '50%',
          border: '4px solid var(--primary-soft)', borderTopColor: 'var(--primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span className="muted small">{label}</span>
    </div>
  );
}

/** Breadcrumb bar. */
export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', gap: 8 }}>
          {i > 0 && <span className="sep">/</span>}
          {it.to ? <a href={it.to}>{it.label}</a> : <span style={{ color: 'var(--ink)' }}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}
