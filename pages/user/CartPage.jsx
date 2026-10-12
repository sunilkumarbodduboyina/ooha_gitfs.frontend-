import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Minus, Plus, ShoppingBag, Tag, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { api, img, inr } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb, EmptyState, Reveal, SectionHead } from '../../components/ui';

export default function CartPage() {
  const { cart, totals, updateQty, removeFromCart, toggleWishlist, cartCount } = useShop();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);

  const delivery = totals.subtotal >= 999 || totals.subtotal === 0 ? 0 : 49;
  const discount = applied?.discount || 0;
  const final = Math.max(0, totals.subtotal - discount + delivery);

  const applyCoupon = async () => {
    if (!code.trim()) return;
    try {
      const d = await api.validateCoupon(code.trim(), totals.subtotal);
      setApplied({ code: code.trim().toUpperCase(), discount: d.discount });
      toast.success(`Coupon applied — you save ${inr(d.discount)}!`);
    } catch (e) {
      setApplied(null);
      toast.error(e.message);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <EmptyState
          icon="🔐"
          title="Please login to view your cart"
          text="Your bag is waiting — sign in to see the gifts you picked."
          action={<Link to="/login" className="btn btn-primary">Login to continue</Link>}
        />
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="container">
        <div className="page-head"><Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} /></div>
        <EmptyState
          icon="🛍️"
          title="Your cart is empty"
          text="Add something lovely and it will show up right here."
          action={<Link to="/products" className="btn btn-primary">Start shopping</Link>}
        />
        <div style={{ height: 60 }} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-sub">{cartCount} item{cartCount === 1 ? '' : 's'} ready to be gifted 🎁</p>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          <AnimatePresence>
            {cart.map((it) => (
              <motion.div
                key={it.id}
                className="cart-item"
                layout
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/product/${it.slug}`}>
                  <img src={img(it.image)} alt={it.name} />
                </Link>
                <div>
                  <div className="ci-cat">{it.category_name || 'Personalized'}</div>
                  <Link to={`/product/${it.slug}`}><h3>{it.name}</h3></Link>
                  <div className="pc-price" style={{ marginTop: 8 }}>
                    <span className="price-now">{inr(it.selling_price)}</span>
                    {Number(it.original_price) > Number(it.selling_price) && (
                      <span className="price-was">{inr(it.original_price)}</span>
                    )}
                  </div>
                  <div className="qty" style={{ marginTop: 12 }}>
                    <button onClick={() => updateQty(it.id, it.quantity - 1)} aria-label="Decrease"><Minus size={15} /></button>
                    <span>{it.quantity}</span>
                    <button onClick={() => updateQty(it.id, Math.min(99, it.quantity + 1))} aria-label="Increase"><Plus size={15} /></button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <div className="ci-subtotal">{inr(Number(it.selling_price) * it.quantity)}</div>
                  <div className="ci-tools">
                    <button onClick={() => toggleWishlist(it.product_id)} title="Move to wishlist"><Heart size={16} /></button>
                    <button onClick={() => removeFromCart(it.id)} title="Remove"><Trash2 size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Reveal>
          <div className="summary-card">
            <h3>Order Summary</h3>

            <div className="coupon-row">
              <input
                className="input"
                placeholder="Coupon code (WELCOME10)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="btn btn-dark btn-sm" onClick={applyCoupon} type="button"><Tag size={14} /> Apply</button>
            </div>

            <div className="sum-row"><span>Subtotal ({cartCount} items)</span><span>{inr(totals.subtotal)}</span></div>
            {totals.savings > 0 && (
              <div className="sum-row discount"><span>You save on MRP</span><span>−{inr(totals.savings)}</span></div>
            )}
            {applied && (
              <div className="sum-row discount"><span>Coupon {applied.code}</span><span>−{inr(discount)}</span></div>
            )}
            <div className="sum-row">
              <span>Delivery charge</span>
              <span>{delivery === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : inr(delivery)}</span>
            </div>
            <div className="sum-total"><span>Final total</span><span>{inr(final)}</span></div>

            {totals.savings + discount > 0 && (
              <div className="sum-save">🎉 You save {inr(totals.savings + discount)} on this order</div>
            )}

            <button className="btn btn-primary full" style={{ marginTop: 18 }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight size={17} />
            </button>
            <Link to="/products" className="btn btn-outline full" style={{ marginTop: 10 }}>
              <ShoppingBag size={16} /> Continue Shopping
            </Link>

            <div style={{ display: 'flex', gap: 12, marginTop: 18, fontSize: '0.76rem', color: 'var(--ink-3)', alignItems: 'center' }}>
              <ShieldCheck size={15} color="#16a34a" /> Secure checkout · UPI, cards &amp; netbanking
            </div>
          </div>
        </Reveal>
      </div>

      <section className="section tight">
        <SectionHead eyebrow="Keep exploring" title="You might also love" />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/collection/best-sellers" className="pill">🔥 Best Sellers</Link>
          <Link to="/collection/love-lab" className="pill">❤️ Love Lab</Link>
          <Link to="/products?max=499" className="pill">Under ₹499</Link>
          <Link to="/occasions" className="pill">🎉 Occasions</Link>
        </div>
      </section>
    </div>
  );
}
