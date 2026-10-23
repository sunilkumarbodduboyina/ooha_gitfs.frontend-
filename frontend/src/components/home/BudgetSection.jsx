import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, img } from '../../services/api';
import { Reveal } from '../ui';

const BUDGETS = [
  { label: 'Small surprises', max: 199, text: 'Under ₹199' },
  { label: 'Sweet gestures', max: 499, text: 'Under ₹499' },
  { label: 'Loved picks', max: 799, text: 'Under ₹799' },
  { label: 'Special gifts', max: 999, text: 'Under ₹999' },
];

/* Real product images shipped with the project — shown until the live
   catalogue responds (or if the request fails). */
const FALLBACK = [
  '/images/products/custom-caricature-doll.svg',
  '/images/products/custom-name-neon-lamp.svg',
  '/images/products/custom-map-poster-your-city.svg',
  '/images/products/couples-watch-combo.svg',
  '/images/products/anniversary-countdown-clock.svg',
  '/images/products/corporate-logo-engraved-pen-set.svg',
];

/** Choose a representative product image for each price band. */
function bandImages(products) {
  const sorted = (products || [])
    .filter((p) => Number(p.selling_price) > 0)
    .sort((a, b) => Number(a.selling_price) - Number(b.selling_price));
  if (!sorted.length) return FALLBACK;
  return BUDGETS.map((b, i) => {
    const inBand = sorted.filter((p) => Number(p.selling_price) <= b.max);
    const pick = inBand[inBand.length - 1] || sorted[sorted.length - 1];
    return pick?.image || FALLBACK[i];
  });
}

/** "Gifts Under" budget buckets → filtered collection pages. */
export default function BudgetSection({ items }) {
  const [products, setProducts] = useState(items ?? null);

  useEffect(() => {
    if (items !== undefined) { setProducts(items || []); return undefined; }
    let alive = true;
    api.products({ limit: 100, sort: 'price_asc' })
      .then((d) => { if (alive) setProducts(d.products || []); })
      .catch(() => { if (alive) setProducts([]); });
    return () => { alive = false; };
  }, [items]);

  const images = products ? bandImages(products) : null;

  return (
    <div className="budget-grid">
      {BUDGETS.map((b, i) => (
        <Reveal key={b.max} delay={i * 0.06}>
          <Link to={`/products?max=${b.max}`} className="budget-card">
            <div className="budget-media">
              {images ? (
                <img src={img(images[i])} alt={`${b.label} gifts`} loading="lazy" />
              ) : (
                <span className="budget-shimmer" aria-hidden="true" />
              )}
            </div>
            <div className="budget-body">
              <div className="budget-price">{b.text}</div>
              <div className="budget-label">{b.label}</div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
