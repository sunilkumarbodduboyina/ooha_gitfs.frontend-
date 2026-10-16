import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import QuickView from './QuickView';
import { Reveal, SkeletonGrid, EmptyState } from './ui';
import { api } from '../services/api';

/* Price bands — the "under" bands line up with the homepage budget links. */
const PRICE_BANDS = [
  { v: '', label: 'Price: Any' },
  { v: '-299', label: 'Under ₹299' },
  { v: '-499', label: 'Under ₹499' },
  { v: '-799', label: 'Under ₹799' },
  { v: '-999', label: 'Under ₹999' },
  { v: '-1499', label: 'Under ₹1,499' },
  { v: '1500-', label: '₹1,500 & above' },
];

/* Client-side sorting for merged fetchSets pages (multi-request unions). */
const CLIENT_SORT = {
  newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  price_asc: (a, b) => a.selling_price - b.selling_price,
  price_desc: (a, b) => b.selling_price - a.selling_price,
  discount: (a, b) => b.discount_percentage - a.discount_percentage,
  popular: (a, b) => b.review_count - a.review_count,
  rating: (a, b) => b.rating - a.rating,
  name: (a, b) => String(a.name).localeCompare(String(b.name)),
};

/**
 * Reusable product listing with search + category + price + sort filters.
 * @param {object} baseParams query for /api/products (category/collection/occasion/…)
 * @param {array} fetchSets multiple param sets merged client-side (curated pages)
 * @param {boolean} showControls show sort/search toolbar
 */
export default function Listing({ baseParams = {}, fetchSets = null, showControls = true }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
  const [term, setTerm] = useState('');
  const [cat, setCat] = useState('');
  const [quick, setQuick] = useState(null);

  const max = searchParams.get('max');
  const min = searchParams.get('min');

  useEffect(() => {
    let alive = true;
    setItems(null);
    const price = {
      ...(max ? { max_price: max } : {}),
      ...(min ? { min_price: min } : {}),
    };
    if (fetchSets) {
      /* Curated pages: fetch every set, union the results by product id. */
      Promise.all(fetchSets.map((s) => api.products({ ...s, ...price, sort, limit: 100 })))
        .then((rs) => {
          if (!alive) return;
          const seen = new Set();
          const merged = [];
          rs.forEach((r) => (r.products || []).forEach((p) => {
            if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); }
          }));
          if (CLIENT_SORT[sort]) merged.sort(CLIENT_SORT[sort]);
          setItems(merged);
        })
        .catch(() => alive && setItems([]));
    } else {
      api.products({
        ...baseParams,
        sort,
        ...price,
        limit: 60,
      })
        .then((d) => alive && setItems(d.products))
        .catch(() => alive && setItems([]));
    }
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(baseParams), JSON.stringify(fetchSets), sort, max, min]);

  /* Category options come from whatever the page actually loaded, so the
     filter can never point at a category that isn't in the grid. */
  const cats = useMemo(() => {
    if (!items) return [];
    const seen = new Map();
    items.forEach((p) => {
      if (p.category_slug && !seen.has(p.category_slug)) seen.set(p.category_slug, p.category_name);
    });
    return [...seen.entries()]
      .map(([slug, name]) => ({ slug, name: name || 'Gifts' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const onPrice = (v) => {
    const next = new URLSearchParams(searchParams);
    if (v) {
      const [pmin, pmax] = v.split('-');
      if (pmin) next.set('min', pmin); else next.delete('min');
      if (pmax) next.set('max', pmax); else next.delete('max');
    } else {
      next.delete('min');
      next.delete('max');
    }
    setSearchParams(next, { replace: true });
  };

  const rawBand = (min || max) ? `${min || ''}-${max || ''}` : '';
  const priceValue = PRICE_BANDS.some((b) => b.v === rawBand) ? rawBand : '';

  let shown = items;
  if (shown) {
    if (cat) shown = shown.filter((p) => p.category_slug === cat);
    if (term.trim()) {
      const t = term.trim().toLowerCase();
      shown = shown.filter((p) => `${p.name} ${p.tags || ''} ${p.category_name || ''}`.toLowerCase().includes(t));
    }
  }

  return (
    <>
      {showControls && (
        <div className="filter-bar">
          <input
            className="input"
            placeholder="Filter these gifts…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Filter products"
          />
          {cats.length > 1 && (
            <select
              className="input select"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              aria-label="Filter by category"
              style={{ maxWidth: 210 }}
            >
              <option value="">Category: All</option>
              {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          )}
          <select
            className="input select"
            value={priceValue}
            onChange={(e) => onPrice(e.target.value)}
            aria-label="Filter by price"
            style={{ maxWidth: 190 }}
          >
            {PRICE_BANDS.map((b) => <option key={b.v} value={b.v}>{b.label}</option>)}
          </select>
          <select className="input select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" style={{ maxWidth: 210 }}>
            <option value="popular">Sort: Popularity</option>
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Biggest discount</option>
            <option value="rating">Top rated</option>
          </select>
          {(max || min) && (
            <span className="badge badge-soft">
              Budget: {max ? `Under ₹${Number(max).toLocaleString('en-IN')}` : `Above ₹${Number(min).toLocaleString('en-IN')}`}
            </span>
          )}
          <span className="result-count">{shown ? `${shown.length} gift${shown.length === 1 ? '' : 's'}` : '…'}</span>
        </div>
      )}

      {!items ? (
        <SkeletonGrid count={8} className="product-grid" />
      ) : shown.length ? (
        <div className="product-grid">
          {shown.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.05}>
              <ProductCard p={p} onQuickView={setQuick} />
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No gifts found"
          text="Try a different search, or explore all of our gifts."
          action={<a href="/products" className="btn btn-primary">Browse all gifts</a>}
        />
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}
