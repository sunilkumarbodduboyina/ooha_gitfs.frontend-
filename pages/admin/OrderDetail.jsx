import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { api, img, inr, formatDate, orderStatusKey } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAY_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [payStatus, setPayStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.order(id)
      .then((d) => {
        setOrder(d.order);
        setOrderStatus(d.order.order_status);
        setPayStatus(d.order.payment_status);
      })
      .catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    setBusy(true);
    try {
      await api.adminUpdateOrder(id, { order_status: orderStatus, payment_status: payStatus });
      setOrder({ ...order, order_status: orderStatus, payment_status: payStatus });
      toast.success('Order updated — customer sees the change instantly');
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  if (!order) return <Spinner label="Loading order…" />;

  let address = {};
  try { address = JSON.parse(order.shipping_address || '{}'); } catch { address = {}; }
  const changed = order.order_status !== orderStatus || order.payment_status !== payStatus;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <Link to="/admin/orders" className="btn btn-outline btn-sm"><ArrowLeft size={15} /> Orders</Link>
        <h2 style={{ fontSize: '1.3rem' }}>#{order.order_number}</h2>
        <span className={`status-chip st-${orderStatusKey(order.order_status)}`}>{order.order_status}</span>
        <span className={`status-chip ${order.payment_status === 'paid' ? 'pay-paid' : 'pay-pending'}`}>{order.payment_status}</span>
        <span className="small muted">{formatDate(order.created_at)}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="panel">
            <h3>Items ({order.items?.length || 0})</h3>
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
            <div className="sum-row" style={{ marginTop: 6 }}><span>Subtotal</span><span>{inr(order.total_amount)}</span></div>
            {Number(order.discount_amount) > 0 && <div className="sum-row discount"><span>Coupon discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span><span>−{inr(order.discount_amount)}</span></div>}\n            <div className="sum-row"><span>Shipping</span><span>{Number(order.shipping_amount) === 0 ? 'FREE' : inr(order.shipping_amount)}</span></div>
            <div className="sum-total"><span>Final amount</span><span>{inr(order.final_amount)}</span></div>
          </div>

          <div className="panel">
            <h3><span><MapPin size={16} color="var(--primary)" style={{ verticalAlign: -2 }} /> Delivery address</span></h3>
            <div style={{ fontSize: '0.95rem', lineHeight: 1.75 }}>
              <strong>{address.full_name}</strong><br />
              {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
              {address.city}, {address.state} — {address.pincode}<br />
              📞 {address.phone}
            </div>
          </div>

          <div className="panel">
            <h3><span><CreditCard size={16} color="var(--primary)" style={{ verticalAlign: -2 }} /> Payment</span></h3>
            <div className="small muted" style={{ lineHeight: 1.9 }}>
              Method: <strong>{order.payment_method || '—'}</strong><br />
              Status: <strong>{order.payment_status}</strong><br />
              Transaction ID: <strong>{order.payment_id || '—'}</strong><br />
              Gateway: <strong>{order.gateway || 'Razorpay'}</strong>
            </div>
          </div>
        </div>

        <div className="panel" style={{ position: 'sticky', top: 90 }}>
          <h3>Update status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>Order status</label>
              <select className="input select" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Payment status</label>
              <select className="input select" value={payStatus} onChange={(e) => setPayStatus(e.target.value)}>
                {PAY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn btn-primary full" onClick={save} disabled={busy || !changed}>
              {busy ? 'Saving…' : <><Save size={16} /> Save changes</>}
            </button>
            {!changed && <p className="small muted center">Change a status to enable saving.</p>}
          </div>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: 16, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="small muted" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Truck size={15} /> Customer sees the status live on “Track Order”.
            </div>
            <div className="small muted" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CheckCircle2 size={15} color="#16a34a" /> Set “Delivered” to complete the order.
            </div>
            <a
              className="btn btn-outline btn-sm full"
              href={`https://wa.me/?text=${encodeURIComponent(`Hello ${address.full_name || ''}, an update about your Ooha Gifts order ${order.order_number}: ${orderStatus}`)}`}
              target="_blank" rel="noreferrer"
            >
              WhatsApp the customer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
