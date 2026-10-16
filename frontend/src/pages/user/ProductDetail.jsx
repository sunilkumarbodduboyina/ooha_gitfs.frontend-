import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, MessageCircle,
  CheckCircle2, Package, Star, CreditCard, Gift,
} from 'lucide-react';
import { api, img, inr, formatDate } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/ProductCard';
import { Breadcrumb, Reveal, SectionHead, SkeletonGrid, Stars, Spinner } from '../../components/ui';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlistIds, requireAuth } = useShop();

  const [data, setData] = useState(null);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');

  /* review form */
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setData(null);
    setActive(0);
    setQty(1);
    api.product(id).then(setData).catch(() => setData({ error: true }));
  }, [id]);

  if (!data) return <div className="container"><Spinner label="Unwrapping your gift…" /></div>;
  if (data.error) {
    return (
      <div className="container">
        <div className="empty-state" style={{ padding: 90 }}>
          <div className="es-icon">🎁</div>
          <h3>Gift not found</h3>
          <p>It may have been removed by the store admin.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse gifts</Link>
        </div>
      </div>
    );
  }

  const p = data.product;
  const images = data.images?.length ? data.images : [p.image || '/images/placeholder.svg'];
  const wished = wishlistIds.includes(p.id);
  const out = Number(p.stock) <= 0;
  const related = data.related || [];

  const buyNow = () => {
    if (!requireAuth()) return;
    if (out) return;
    navigate('/checkout', { state: { buyNow: { product_id: p.id, quantity: qty } } });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    try {
      await api.postReview({
        product_id: p.id,
        customer_name: user?.name,
        rating,
        title,
        comment,
        product_purchased: p.name,
      });
      toast.success('Thank you! Your review is pending approval.');
      setTitle(''); setComment(''); setRating(5);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[
          { label: 'Home', to: '/' },
          { label: p.category_name || 'Gifts', to: p.category_slug ? `/category/${p.category_slug}` : '/products' },
          { label: p.name },
        ]} />
      </div>

      <div className="pdp">
        {/* gallery */}
        <div className="pdp-gallery">
          <motion.div className="pdp-main" key={active} initial={{ opacity: 0.4, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
            <img src={img(images[active])} alt={p.name} />
            {Number(p.discount_percentage) > 0 && (
              <span className="badge badge-off" style={{ position: 'absolute', top: 18, left: 18 }}>
                {Math.round(p.discount_percentage)}% OFF
              </span>
            )}
          </motion.div>
          {images.length > 1 && (
            <div className="pdp-thumbs">
              {images.map((im, i) => (
                <button key={i} className={`pdp-thumb ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}>
                  <img src={img(im)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div className="pdp-info">
          <div className="pdp-cat">{p.collection_name || p.category_name || 'Ooha Gifts'}</div>
          <h1 className="pdp-title">{p.name}</h1>

          <div className="pdp-rating">
            <Stars value={p.rating} size={16} />
            <strong>{Number(p.rating || 5).toFixed(1)}</strong>
            <span>· {p.review_count || data.reviews?.length || 0} reviews</span>
            <span className={`status-chip ${out ? 'st-cancelled' : 'st-delivered'}`} style={{ marginLeft: 8 }}>
              {out ? 'Out of stock' : 'In stock'}
            </span>
          </div>

          <div className="pdp-price">
            <span className="now">{inr(p.selling_price)}</span>
            {Number(p.original_price) > Number(p.selling_price) && <span className="was">{inr(p.original_price)}</span>}
            {Number(p.discount_percentage) > 0 && <span className="off">SAVE {inr(p.original_price - p.selling_price)}</span>}
          </div>
          <div className="pdp-tax">Inclusive of all taxes · Free delivery above ₹999</div>

          <p className="pdp-desc">{p.description}</p>

          <div className="pdp-meta">
            <div className={out ? 'no' : 'ok'}><Package size={16} /> {out ? 'Currently unavailable' : `${p.stock} in stock`}</div>
            <div><Truck size={16} /> Dispatched within 24 hrs</div>
            <div><Gift size={16} /> Free gift wrapping</div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="qty" role="group" aria-label="Quantity">
              <button onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((v) => Math.min(Math.max(p.stock, 1), v + 1))} aria-label="Increase">+</button>
            </div>
            <span className="small muted">{Number(p.stock)} available</span>
          </div>

          <div className="pdp-actions">
            <button className="btn btn-primary btn-lg" onClick={() => addToCart(p.id, qty)} disabled={out}>
              <ShoppingBag size={18} /> {out ? 'Sold out' : 'Add to Cart'}
            </button>
            <button className="btn btn-dark btn-lg" onClick={buyNow} disabled={out}>
              Buy Now
            </button>
            <button className={`pdp-wish ${wished ? 'on' : ''}`} onClick={() => toggleWishlist(p.id)} aria-label="Add to wishlist">
              <Heart size={20} fill={wished ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="pay-chips">
            <span className="pay-chip">UPI · GPay · PhonePe · Paytm</span>
            <span className="pay-chip">Visa · Mastercard · RuPay</span>
            <span className="pay-chip">Net Banking</span>
            <span className="pay-chip">Wallets</span>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a
              className="btn btn-outline"
              style={{ borderColor: '#25d366', color: '#128c4a' }}
              href={`https://wa.me/919885927554?text=${encodeURIComponent(`Hello Ooha Gifts, I am interested in this product:\n\n${p.name}\n₹${Number(p.selling_price).toLocaleString('en-IN')}\n${window.location.origin}/product/${p.slug}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={17} /> Ask on WhatsApp
            </a>
          </div>

          <div className="info-acc" style={{ marginTop: 26 }}>
            <details open>
              <summary>Delivery information</summary>
              <div className="acc-body">
                Dispatched within 24 hours from our Pune studio. Metro cities get delivery in 2–3 days,
                other locations in 4–6 days. Free shipping on orders above ₹999, otherwise ₹49.
                You will receive tracking details on WhatsApp and email.
              </div>
            </details>
            <details>
              <summary>Return &amp; replacement policy</summary>
              <div className="acc-body">
                Easy 7-day returns on non-personalized items. Personalized/custom-made gifts can be
                replaced if they arrive damaged or defective — just share a photo within 48 hours of delivery.
              </div>
            </details>
            <details>
              <summary>Payment options</summary>
              <div className="acc-body">
                Pay securely with UPI (Google Pay, PhonePe, Paytm &amp; all UPI apps), credit/debit cards
                (Visa, Mastercard, RuPay), net banking and wallets. Payments are processed by Razorpay —
                your card details are never stored on our servers.
              </div>
            </details>
            <details>
              <summary>About this gift</summary>
              <div className="acc-body">
                {p.sku ? `SKU: ${p.sku} · ` : ''}Brand: {p.brand || 'Ooha Gifts'}
                {p.tags ? ` · Tags: ${p.tags}` : ''}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* reviews */}
      <section className="section tight" id="reviews">
        <SectionHead
          eyebrow="Verified buyers"
          title="Ratings & Reviews"
          sub={`Loved by ${p.review_count || 0} happy customers`}
        />
        <div className="grid-3" style={{ alignItems: 'start' }}>
          <div style={{ gridColumn: 'span 2' }}>
            {(data.reviews || []).length ? (
              <div className="grid-2">
                {data.reviews.map((r) => (
                  <article key={r.id} className="review-card">
                    <Stars value={r.rating} />
                    {r.title && <h4 style={{ fontSize: '1rem' }}>{r.title}</h4>}
                    <p className="review-text">“{r.comment}”</p>
                    <div className="review-who">
                      <span className="review-avatar">{String(r.customer_name || 'O').charAt(0)}</span>
                      <div>
                        <div className="review-name">{r.customer_name}</div>
                        <div className="review-prod">{formatDate(r.review_date || r.created_at)}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ padding: '10px 0' }}>
                No reviews yet — be the first to share how this gift was received. 💝
              </p>
            )}
          </div>

          <form className="review-form" onSubmit={submitReview}>
            <h3 style={{ fontSize: '1.15rem' }}>Write a review</h3>
            <div className="field">
              <label>Your rating</label>
              <div className="star-pick">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={i <= rating ? 'on' : ''}
                    onClick={() => setRating(i)}
                    aria-label={`${i} stars`}
                  >
                    <Star size={24} fill={i <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Review title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Beautiful gift!" />
            </div>
            <div className="field">
              <label>Your review</label>
              <textarea className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell others about your experience…" required minLength={5} />
            </div>
            <button className="btn btn-primary full" type="submit">
              <CheckCircle2 size={17} /> Submit review
            </button>
            {user && <span className="small muted">Posting as {user.name}</span>}
          </form>
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="section tight">
          <SectionHead eyebrow="You may also like" title="Similar Gifts" />
          <div className="product-grid">
            {related.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.05}>
                <ProductCard p={r} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <div style={{ height: 50 }} />
    </div>
  );
}
