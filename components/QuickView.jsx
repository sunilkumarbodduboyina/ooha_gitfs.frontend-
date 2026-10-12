import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, ShoppingBag, X, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { api, img, inr } from '../services/api';
import { useShop } from '../context/ShopContext';
import { Stars } from './ui';

/** Quick view modal — loads full product data on open. */
export default function QuickView({ product, onClose }) {
  const [detail, setDetail] = useState(null);
  const { addToCart, toggleWishlist, wishlistIds, requireAuth } = useShop();
  const navigate = useNavigate();
  const wished = detail && wishlistIds.includes(detail.product.id);

  useEffect(() => {
    if (!product) { setDetail(null); return undefined; }
    let alive = true;
    api.product(product.id || product.slug)
      .then((d) => alive && setDetail(d))
      .catch(() => {});
    return () => { alive = false; };
  }, [product]);

  /* Escape handling is always live (harmless while closed), but the scroll
     lock must only engage while the modal is actually open — QuickView is
     mounted eagerly on every product-listing page. */
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!product) return undefined;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  const p = detail?.product || product;

  return (
    <AnimatePresence>
      {product && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 46, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="qv-grid">
              <div style={{ background: 'var(--blush)', position: 'relative', minHeight: 320 }}>
                <img
                  src={img(detail?.images?.[0] || p.image)}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                />
              </div>
              <div style={{ padding: '34px 32px', position: 'relative' }}>
                <button
                  onClick={onClose}
                  aria-label="Close quick view"
                  style={{ position: 'absolute', top: 16, right: 16 }}
                  className="icon-btn"
                >
                  <X size={20} />
                </button>
                <div className="pc-cat">{p.category_name || 'Personalized gift'}</div>
                <h2 style={{ fontSize: '1.6rem', margin: '8px 0 10px' }}>{p.name}</h2>
                <div className="pdp-rating">
                  <Stars value={p.rating} />
                  <span>{Number(p.rating || 5).toFixed(1)} · {p.review_count || 0} reviews</span>
                </div>
                <div className="pdp-price" style={{ margin: '16px 0 4px' }}>
                  <span className="now" style={{ fontSize: '1.8rem' }}>{inr(p.selling_price)}</span>
                  {Number(p.original_price) > Number(p.selling_price) && <span className="was">{inr(p.original_price)}</span>}
                  {Number(p.discount_percentage) > 0 && <span className="off">{Math.round(p.discount_percentage)}% OFF</span>}
                </div>
                <p className="pdp-desc" style={{ margin: '12px 0 18px', fontSize: '0.92rem' }}>
                  {p.description || detail?.product?.description || 'A handcrafted Ooha Gifts favourite — personalised, premium and made to be remembered.'}
                </p>
                <div className="pdp-actions" style={{ margin: '0 0 12px' }}>
                  <button className="btn btn-primary" onClick={() => addToCart(p.id, 1)} disabled={Number(p.stock) <= 0}>
                    <ShoppingBag size={17} /> Add to cart
                  </button>
                  <button
                    className="pdp-wish"
                    style={{ width: 50, height: 50 }}
                    onClick={() => toggleWishlist(p.id)}
                    aria-label="Toggle wishlist"
                  >
                    <Heart size={19} fill={wished ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <button
                  className="btn btn-dark full"
                  style={{ marginBottom: 16 }}
                  disabled={Number(p.stock) <= 0}
                  onClick={() => {
                    if (!requireAuth()) return;
                    onClose();
                    navigate('/checkout', { state: { buyNow: { product_id: p.id, quantity: 1 } } });
                  }}
                >
                  Buy Now
                </button>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--ink-2)' }}>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Truck size={14} /> Fast delivery</span>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><ShieldCheck size={14} /> Secure payment</span>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><RotateCcw size={14} /> Easy returns</span>
                </div>
                <Link to={`/product/${p.slug || p.id}`} className="btn btn-outline full" style={{ marginTop: 18 }} onClick={onClose}>
                  View full details →
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
