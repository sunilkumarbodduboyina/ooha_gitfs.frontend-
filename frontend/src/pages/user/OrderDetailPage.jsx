import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  PackageCheck, Truck, Home, CheckCircle2, Clock, XCircle, CreditCard,
  Phone, MapPin, Copy,
} from 'lucide-react';
import { api, img, inr, formatDate, orderStatusKey } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb, Spinner } from '../../components/ui';

const FLOW = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.order(id).then((d) => setOrder(d.order)).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="container">
        <Emptyish title="Order not found" text={error} />
      </div>
    );
  }
  if (!order) return <Spinner label="Loading order…" />;

  let address = {};
  try { address = JSON.parse(order.shipping_address || '{}'); } catch { address = {}; }

  const currentIndex = FLOW.indexOf(order.order_status);
  const cancelled = order.order_status === 'Cancelled';
  const steps = [
    { key: 'Pending', label: 'Order Placed', icon: Clock, date: order.created_at },
    { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2, date: order.created_at },
    { key: 'Packed', label: 'Packed with love', icon: PackageCheck, date: order.created_at },
    { key: 'Shipped', label: 'Shipped', icon: Truck, date: order.created_at },
    { key: 'Out for Delivery', label: 'Out for delivery', icon: Truck, date: order.created_at },
    { key: 'Delivered', label: 'Delivered', icon: Home, date: order.order_status === 'Delivered' ? order.updated_at : null },
  ];

  const copyId = async () => {
    try { await navigator.clipboard.writeText(order.order_number); toast.success('Order ID copied'); } catch { toast.error('Could not copy'); }
  };

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'My Orders', to: '/orders' }, { label: `#${order.order_number}` }]} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>#{order.order_number}</h1>
          <button className="pill" onClick={copyId}><Copy size={14} /> Copy ID</button>
          <span className={`status-chip st-${orderStatusKey(order.order_status)}`}>{order.order_status}</span>
          <span className={`status-chip ${order.payment_status === 'paid' ? 'pay-paid' : 'pay-pending'}`}>
            Payment {order.payment_status}
          </span>
        </div>
        <p className="page-sub">Placed on {formatDate(order.created_at)} · {order.payment_method || 'UPI'}</p>
      </div>

      <div className="checkout-layout" style={{ paddingBottom: 70 }}>
        <div>
          {/* items */}
          <div className="checkout-card">
            <h3><span className="step-num">📦</span> Items in this order</h3>
            <div className="order-items-mini" style={{ maxHeight: 'none' }}>
              {(order.items || []).map((it) => (
                <div className="omi" key={it.id} style={{ paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                  <img src={img(it.product_image)} alt="" />
                  <div>
                    <div className="omi-name">{it.product_name}</div>
                    <div className="omi-qty">Qty {it.quantity} × {inr(it.price)}</div>
                  </div>
                  <div className="omi-price">{inr(it.subtotal)}</div>
                </div>
              ))}
            </div>
            <div className="sum-row" style={{ marginTop: 8 }}><span>Subtotal</span><span>{inr(order.total_amount)}</span></div>
            {Number(order.discount_amount) > 0 && <div className="sum-row discount"><span>Discount</span><span>−{inr(order.discount_amount)}</span></div>}
            <div className="sum-row"><span>Delivery</span><span>{Number(order.shipping_amount) === 0 ? 'FREE' : inr(order.shipping_amount)}</span></div>
            <div className="sum-total"><span>Total paid</span><span>{inr(order.final_amount)}</span></div>
          </div>

          {/* address */}
          <div className="checkout-card">
            <h3><span className="step-num">📍</span> Delivery address</h3>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.95rem', lineHeight: 1.7 }}>
              <MapPin size={20} color="var(--primary)" style={{ flex: '0 0 auto', marginTop: 4 }} />
              <div>
                <strong>{address.full_name}</strong><br />
                {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
                {address.city}, {address.state} — {address.pincode}<br />
                📞 {address.phone}
              </div>
            </div>
          </div>
        </div>

        {/* tracking */}
        <div className="summary-card" id="track" style={{ scrollMarginTop: 100 }}>
          <h3>{cancelled ? 'Order cancelled' : 'Track your order'}</h3>

          {cancelled ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <XCircle size={46} color="#dc2626" style={{ margin: '0 auto 12px' }} />
              <p className="muted small">This order was cancelled. If you already paid, the refund will reflect in 3–5 working days.</p>
            </div>
          ) : (
            <div className="timeline">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const done = currentIndex >= i;
                return (
                  <div key={s.key} className={`tl-item ${done ? 'done' : ''}`}>
                    <span className="tl-dot"><Icon size={16} /></span>
                    <div>
                      <div className="tl-label">{s.label}</div>
                      <div className="tl-date">
                        {done ? (i === 0 ? formatDate(s.date) : i <= currentIndex ? 'Completed' : 'Pending') : 'Awaiting'}
                        {s.key === 'Delivered' && done && s.date ? ` · ${formatDate(s.date)}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ borderTop: '1px dashed var(--line-strong)', marginTop: 18, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.88rem' }}>
              <CreditCard size={16} color="var(--ink-3)" /> Payment: <strong>{order.payment_method || 'UPI'}</strong> · {order.payment_status}
            </div>
            <a
              className="btn btn-outline full"
              style={{ borderColor: '#25d366', color: '#128c4a' }}
              href={`https://wa.me/919885927554?text=${encodeURIComponent(`Hello Ooha Gifts, please help me with my order ${order.order_number}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={15} /> Need help? WhatsApp us
            </a>
          </div>
        </div>
      </div>

      {params.get('track') && (
        <style>{`#track { box-shadow: 0 0 0 4px rgba(178,58,94,0.25); }`}</style>
      )}
    </div>
  );
}

function Emptyish({ title, text }) {
  return (
    <div className="empty-state" style={{ padding: 80 }}>
      <div className="es-icon">📦</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>Back to my orders</Link>
    </div>
  );
}
