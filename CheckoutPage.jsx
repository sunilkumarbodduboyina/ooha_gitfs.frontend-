import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard, Smartphone, Building2, Wallet, CheckCircle2, Lock,
  Sparkles, ArrowRight, Tag, Landmark,
} from 'lucide-react';
import { api, img, inr } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb, Spinner } from '../../components/ui';

const UPI_APPS = [
  { id: 'googlepay', name: 'Google Pay', color: '#1f8f3a', short: 'G' },
  { id: 'phonepe', name: 'PhonePe', color: '#5f259f', short: 'Pe' },
  { id: 'paytm', name: 'Paytm', color: '#00baf2', short: 'P' },
  { id: 'other', name: 'Other UPI', color: '#b23a5e', short: 'UPI' },
];

const PAY_METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone, note: 'GPay · PhonePe · Paytm' },
  { id: 'card', label: 'Cards', icon: CreditCard, note: 'Visa · Mastercard · RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, note: 'All major banks' },
  { id: 'wallet', label: 'Wallets', icon: Wallet, note: 'Paytm · Amazon Pay' },
];

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Could not load Razorpay. Check your connection.'));
    document.body.appendChild(s);
    return undefined;
  });
}

export default function CheckoutPage() {
  const { cart, totals, cartCount, refreshCart, requireAuth } = useShop();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNow = location.state?.buyNow;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('upi');
  const [upiApp, setUpiApp] = useState('googlepay');
  const [nbBank, setNbBank] = useState('hdfc');
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(null);
  const [simOpen, setSimOpen] = useState(false);

  const [addr, setAddr] = useState({
    full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  });

  useEffect(() => {
    if (!requireAuth()) return undefined;
    setAddr((a) => ({ ...a, full_name: user?.name || '', phone: user?.phone || '' }));
    if (buyNow) {
      api.product(buyNow.product_id)
        .then((d) => {
          const p = d.product;
          setItems([{
            id: 0, product_id: p.id, name: p.name, slug: p.slug, image: d.images?.[0] || p.image,
            selling_price: p.selling_price, original_price: p.original_price,
            quantity: buyNow.quantity || 1,
          }]);
          setLoading(false);
        })
        .catch(() => { setLoading(false); });
    } else {
      refreshCart().finally(() => setLoading(false));
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = buyNow ? items : cart;
  const subtotal = list.reduce((s, i) => s + Number(i.selling_price) * i.quantity, 0);
  const mrp = list.reduce((s, i) => s + Number(i.original_price) * i.quantity, 0);
  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 49;
  const discount = applied?.discount || 0;
  const total = Math.max(0, subtotal - discount + delivery);

  const validateAddr = () => {
    if (!addr.full_name.trim()) return 'Please enter the recipient’s name';
    if (!/^[0-9+\-\s]{8,15}$/.test(addr.phone)) return 'Please enter a valid mobile number';
    if (addr.line1.trim().length < 4) return 'Please enter the full address';
    if (!addr.city.trim()) return 'Please enter the city';
    if (!addr.state.trim()) return 'Please enter the state';
    if (!/^\d{6}$/.test(addr.pincode)) return 'Please enter a valid 6-digit pincode';
    return null;
  };

  const applyCoupon = async () => {
    if (!code.trim()) return;
    try {
      const d = await api.validateCoupon(code.trim(), subtotal);
      setApplied({ code: code.trim().toUpperCase(), discount: d.discount });
      toast.success(`Coupon applied — you save ${inr(d.discount)}!`);
    } catch (e) {
      setApplied(null);
      toast.error(e.message);
    }
  };

  const finish = async (orderId, method) => {
    try {
      const d = await api.verifyPayment({ order_id: orderId, method, razorpay_payment_id: `pay_${Date.now()}` });
      setSuccess(d.order || { id: orderId });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      refreshCart();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPaying(false);
      setSimOpen(false);
    }
  };

  const pay = async () => {
    const err = validateAddr();
    if (err) { toast.error(err); return; }
    if (!list.length) { toast.error('Your cart is empty'); return; }

    setPaying(true);
    try {
      const methodLabel = { upi: upiApp === 'other' ? 'UPI' : UPI_APPS.find((u) => u.id === upiApp)?.name, card: 'Credit Card', netbanking: 'Net Banking', wallet: 'Wallets' }[tab];
      const orderRes = await api.createOrder({
        shipping_address: addr,
        coupon_code: applied?.code,
        payment_method: methodLabel,
        items: buyNow ? list.map((i) => ({ product_id: i.product_id, quantity: i.quantity })) : undefined,
      });
      const orderId = orderRes.order.id;

      const payRes = await api.createPayment(orderId);

      if (payRes.mode === 'live') {
        await loadRazorpay();
        const rz = new window.Razorpay({
          key: payRes.key_id,
          amount: payRes.amount,
          currency: 'INR',
          name: 'Ooha Gifts',
          description: `Order ${payRes.order_number}`,
          order_id: payRes.razorpay_order_id,
          theme: { color: '#b23a5e' },
          prefill: { name: addr.full_name, contact: addr.phone, email: user?.email },
          handler: async (resp) => {
            try {
              const d = await api.verifyPayment({
                order_id: orderId,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                method: methodLabel,
              });
              setSuccess(d.order);
              refreshCart();
            } catch (e) { toast.error(e.message); }
            setPaying(false);
          },
          modal: { ondismiss: () => setPaying(false) },
        });
        rz.open();
      } else {
        setSimOpen(true);
        setPaying(false);
        // stash for the simulated sheet
        window.__ooha_order = { orderId, methodLabel };
      }
    } catch (e) {
      toast.error(e.message);
      setPaying(false);
    }
  };

  const fields = [
    ['full_name', 'Full name', 'Aarav Sharma'],
    ['phone', 'Mobile number', '9812345678'],
    ['line1', 'Address line 1', 'Flat / House no., Street'],
    ['line2', 'Address line 2 (optional)', 'Landmark', true],
    ['city', 'City', 'Pune'],
    ['state', 'State', 'Maharashtra'],
    ['pincode', 'Pincode', '411001'],
  ];

  if (success) return <SuccessView order={success} onContinue={() => navigate('/orders')} />;

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
        <h1 className="page-title">Secure Checkout</h1>
      </div>

      {loading ? <Spinner /> : !list.length ? (
        <div className="empty-state">
          <div className="es-icon">🛒</div>
          <h3>Nothing to checkout</h3>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 14 }}>Browse gifts</Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div>
            {/* address */}
            <div className="checkout-card">
              <h3><span className="step-num">1</span> Delivery address</h3>
              <div className="form-grid">
                {fields.map(([key, label, ph, optional]) => (
                  <div className={`field ${key === 'line1' || key === 'line2' || key === 'full_name' || key === 'phone' ? 'span-2' : ''}`} key={key}>
                    <label>{label}{optional ? '' : ' *'}</label>
                    <input
                      className="input"
                      placeholder={ph}
                      value={addr[key]}
                      onChange={(e) => setAddr({ ...addr, [key]: e.target.value })}
                      required={!optional}
                      type={key === 'phone' || key === 'pincode' ? 'tel' : 'text'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* payment */}
            <div className="checkout-card">
              <h3><span className="step-num">2</span> Payment method</h3>
              <div className="pay-tabs">
                {PAY_METHODS.map(({ id, label, icon: Icon, note }) => (
                  <button
                    key={id}
                    className={`pay-tab ${tab === id ? 'active' : ''}`}
                    onClick={() => setTab(id)}
                    type="button"
                  >
                    <span className="pt-icon"><Icon size={22} /></span>
                    {label}
                    <span className="small muted" style={{ fontWeight: 500, fontSize: '0.7rem' }}>{note}</span>
                  </button>
                ))}
              </div>

              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {tab === 'upi' && (
                  <>
                    <div className="upi-apps">
                      {UPI_APPS.map((u) => (
                        <button key={u.id} className={`upi-app ${upiApp === u.id ? 'active' : ''}`} onClick={() => setUpiApp(u.id)} type="button">
                          <span className="ua-logo" style={{ background: u.color }}>{u.short}</span>
                          {u.name}
                        </button>
                      ))}
                    </div>
                    <p className="small muted" style={{ marginTop: 14 }}>
                      You will approve the payment inside your UPI app. Fast, safe and RBI regulated.
                    </p>
                    <div className="pay-chips" style={{ marginTop: 10 }}>
                      <span className="pay-chip">Google Pay</span><span className="pay-chip">PhonePe</span>
                      <span className="pay-chip">Paytm</span><span className="pay-chip">BHIM &amp; all UPI apps</span>
                    </div>
                  </>
                )}

                {tab === 'card' && (
                  <>
                    <div className="form-grid">
                      <div className="field span-2">
                        <label>Card number</label>
                        <input className="input" placeholder="1234 5678 9012 3456" inputMode="numeric" autoComplete="cc-number" />
                      </div>
                      <div className="field">
                        <label>Expiry</label>
                        <input className="input" placeholder="MM / YY" inputMode="numeric" autoComplete="cc-exp" />
                      </div>
                      <div className="field">
                        <label>CVV</label>
                        <input className="input" type="password" placeholder="•••" inputMode="numeric" autoComplete="cc-csc" maxLength={4} />
                      </div>
                    </div>
                    <div className="card-brands">
                      <span className="brand-chip">VISA</span>
                      <span className="brand-chip">Mastercard</span>
                      <span className="brand-chip">RuPay</span>
                      <span className="brand-chip">American Express</span>
                    </div>
                    <p className="small muted" style={{ marginTop: 12, display: 'flex', gap: 7, alignItems: 'center' }}>
                      <Lock size={14} color="#16a34a" /> Card details are processed securely by Razorpay and never stored by Ooha Gifts.
                    </p>
                  </>
                )}

                {tab === 'netbanking' && (
                  <>
                    <div className="upi-apps">
                      {[['hdfc', 'HDFC'], ['icici', 'ICICI'], ['sbi', 'SBI'], ['axis', 'Axis'], ['kotak', 'Kotak'], ['idfc', 'IDFC'], ['yes', 'Yes Bank'], ['other', 'More banks']].map(([id, name]) => (
                        <button key={id} className={`upi-app ${nbBank === id ? 'active' : ''}`} onClick={() => setNbBank(id)} type="button">
                          <span className="ua-logo" style={{ background: 'var(--ink)' }}><Landmark size={19} /></span>
                          {name}
                        </button>
                      ))}
                    </div>
                    <p className="small muted" style={{ marginTop: 14 }}>You will be redirected to your bank’s secure page to approve the payment.</p>
                  </>
                )}

                {tab === 'wallet' && (
                  <div className="upi-apps">
                    {[['paytm', 'Paytm'], ['amazon', 'Amazon Pay'], ['phonepe', 'PhonePe Wallet'], ['mobikwik', 'MobiKwik']].map(([id, name]) => (
                      <button key={id} className={`upi-app ${upiApp === id ? 'active' : ''}`} onClick={() => setUpiApp(id)} type="button">
                        <span className="ua-logo" style={{ background: 'var(--primary)' }}><Wallet size={18} /></span>
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* summary */}
          <div className="summary-card">
            <h3>Your Order</h3>
            <div className="order-items-mini">
              {list.map((i) => (
                <div className="omi" key={i.id || i.product_id}>
                  <img src={img(i.image)} alt="" />
                  <div>
                    <div className="omi-name">{i.name}</div>
                    <div className="omi-qty">Qty {i.quantity}</div>
                  </div>
                  <div className="omi-price">{inr(Number(i.selling_price) * i.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="coupon-row">
              <input className="input" placeholder="WELCOME10 / OOHA20" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="btn btn-dark btn-sm" type="button" onClick={applyCoupon}><Tag size={14} /></button>
            </div>

            <div className="sum-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            {mrp > subtotal && <div className="sum-row discount"><span>MRP discount</span><span>−{inr(mrp - subtotal)}</span></div>}
            {applied && <div className="sum-row discount"><span>Coupon {applied.code}</span><span>−{inr(discount)}</span></div>}
            <div className="sum-row"><span>Delivery</span><span>{delivery === 0 ? <strong style={{ color: '#16a34a' }}>FREE</strong> : inr(delivery)}</span></div>
            <div className="sum-total"><span>Total payable</span><span>{inr(total)}</span></div>

            <button className="btn btn-primary full btn-lg" style={{ marginTop: 16 }} onClick={pay} disabled={paying}>
              {paying ? 'Processing…' : <><Lock size={17} /> Pay {inr(total)}</>}
            </button>
            <p className="small muted" style={{ textAlign: 'center', marginTop: 12 }}>
              <Sparkles size={13} color="var(--gold)" /> 100% secure · Powered by Razorpay
            </p>
          </div>
        </div>
      )}

      {/* simulated payment sheet (test mode, no gateway keys) */}
      {simOpen && (
        <div className="modal-backdrop" onClick={() => !paying && setSimOpen(false)}>
          <motion.div className="modal" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ padding: 34, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div className="pt-icon" style={{ width: 64, height: 64, margin: '0 auto 14px', background: 'var(--primary-soft)' }}>
                <CreditCard size={26} color="var(--primary)" />
              </div>
              <h3>Complete your payment</h3>
              <p className="muted small" style={{ margin: '8px 0 4px' }}>
                Test mode — the Razorpay keys are not configured, so this simulates a successful {window.__ooha_order?.methodLabel || 'UPI'} payment of{' '}
                <strong>{inr(total)}</strong>.
              </p>
              <button
                className="btn btn-primary full btn-lg"
                style={{ marginTop: 20 }}
                disabled={paying}
                onClick={() => { setPaying(true); finish(window.__ooha_order.orderId, window.__ooha_order.methodLabel); }}
              >
                {paying ? 'Verifying…' : <>Pay {inr(total)} securely</>}
              </button>
              <button className="btn btn-outline full" style={{ marginTop: 10 }} onClick={() => setSimOpen(false)} disabled={paying}>
                Cancel payment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SuccessView({ order, onContinue }) {
  return (
    <div className="success-wrap">
      <motion.div className="success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
        <CheckCircle2 size={56} />
      </motion.div>
      <h1 style={{ fontSize: '2.3rem' }}>Payment Successful 🎉</h1>
      <p className="muted" style={{ marginTop: 10 }}>
        Thank you! Your gift is being packed with love and will be dispatched within 24 hours.
      </p>
      <div className="order-no">Order ID: {order.order_number || `OOHA-${order.id}`}</div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 30, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onContinue}>
          Track my order <ArrowRight size={17} />
        </button>
        <Link to="/products" className="btn btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
