import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { img, inr } from '../services/api';
import { useShop } from '../context/ShopContext';

/**
 * Product card used across the storefront.
 * @param {object} p product row
 * @param {function} onQuickView optional quick-view opener
 */
export default function ProductCard({ p, onQuickView }) {
  const { addToCart, toggleWishlist, wishlistIds } = useShop();
  const wished = wishlistIds.includes(p.id);
  const out = Number(p.stock) <= 0;
  const low = !out && Number(p.stock) <= 10;
  const to = `/product/${p.slug || p.id}`;

  const onWish = (e) => {
    e.preventDefault();
    toggleWishlist(p.id);
  };
  const onCart = (e) => {
    e.preventDefault();
    addToCart(p.id, 1);
  };

  return (
    <div className="product-card">
      <Link to={to} className="pc-media" aria-label={p.name}>
        <img src={img(p.image)} alt={p.name} loading="lazy" decoding="async" />
        <div className="pc-badges">
          {Number(p.discount_percentage) > 0 && <span className="badge badge-off">{Math.round(p.discount_percentage)}% OFF</span>}
          {Number(p.bestseller) === 1 && <span className="badge badge-gold">Bestseller</span>}
          {Number(p.new_arrival) === 1 && <span className="badge badge-mint">New</span>}
          {out && <span className="badge" style={{ background: 'var(--ink)', color: '#fff' }}>Sold out</span>}
        </div>
        <button
          type="button"
          className={`pc-wish ${wished ? 'on' : ''}`}
          onClick={onWish}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
        </button>
        <div className="pc-quick">
          <button type="button" onClick={onCart} disabled={out}>
            <ShoppingBag size={15} /> {out ? 'Sold out' : 'Add'}
          </button>
          {onQuickView && (
            <button type="button" className="accent" onClick={(e) => { e.preventDefault(); onQuickView(p); }}>
              <Eye size={15} /> Quick view
            </button>
          )}
        </div>
      </Link>

      <div className="pc-body">
        <span className="pc-cat">{p.category_name || 'Personalized'}</span>
        <Link to={to} className="pc-name">{p.name}</Link>
        {p.description ? <p className="pc-desc">{p.description}</p> : null}
        <div className="pc-rating">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--gold)' }}>
            <Star size={13} fill="currentColor" /> {Number(p.rating || 5).toFixed(1)}
          </span>
          <span>({p.review_count || 0})</span>
          {low && <span className="pc-stock low" style={{ marginLeft: 'auto' }}>Only {p.stock} left</span>}
          {out && <span className="pc-stock out" style={{ marginLeft: 'auto' }}>Out of stock</span>}
        </div>
        <div className="pc-price">
          <span className="price-now">{inr(p.selling_price)}</span>
          {Number(p.original_price) > Number(p.selling_price) && (
            <span className="price-was">{inr(p.original_price)}</span>
          )}
          {Number(p.discount_percentage) > 0 && (
            <span className="price-off">{Math.round(p.discount_percentage)}% OFF</span>
          )}
        </div>
        <div className="pc-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCart} disabled={out}>
            <ShoppingBag size={14} /> {out ? 'Sold out' : 'Add to Cart'}
          </button>
          <Link to={to} className="btn btn-primary btn-sm">
            <Eye size={14} /> View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
