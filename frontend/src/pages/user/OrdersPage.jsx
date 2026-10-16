import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, MapPin, ChevronRight } from 'lucide-react';
import { api, img, inr, formatDate, orderStatusKey } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumb, EmptyState, Reveal, Spinner } from '../../components/ui';

/* Friendly delivery wording derived from the order status. Every value is
   intentionally distinct from the raw status so the delivery chip always
   renders (the terminal states would otherwise duplicate the status chip). */
const DELIVERY_LABEL = {
  Pending: 'Order received',
  Confirmed: 'Preparing',
  Packed: 'Packed & ready',
  Shipped: 'In transit',
  'Out for Delivery': 'Out for delivery',
  Delivered: 'Delivered to door',
  Cancelled: 'Order cancelled',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    api.orders().then((d) => setOrders(d.orders)).catch(() => setOrders([]));
  }, [user, authLoading, navigate]);

  if (authLoading || !orders) return <Spinner label="Fetching your orders…" />;

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'My Orders' }]} />
        <h1 className="page-title">My Orders</h1>
        <p className="page-sub">Track every gift from our studio to their doorstep.</p>
      </div>

      {!orders.length ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          text="When you place your first order, it will appear here."
          action={<Link to="/products" className="btn btn-primary">Start gifting</Link>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 70 }}>
          {orders.map((o, i) => {
            let address = {};
            try { address = JSON.parse(o.shipping_address || '{}'); } catch { address = {}; }
            const delivery = DELIVERY_LABEL[o.order_status] || 'Processing';
            return (
              <Reveal key={o.id} delay={i * 0.05}>
                <div className="order-card">
                  <div className="order-head">
                    <span className="ono">#{o.order_number}</span>
                    <span className="odate">{formatDate(o.created_at)}</span>
                    <span className={`status-chip st-${orderStatusKey(o.order_status)}`}>{o.order_status}</span>
                    <span className={`status-chip st-${orderStatusKey(o.order_status)}`} title="Delivery status">{delivery}</span>
                    <span className={`status-chip ${o.payment_status === 'paid' ? 'pay-paid' : 'pay-pending'}`}>
                      {o.payment_status === 'paid' ? 'Paid' : `Payment ${o.payment_status}`}
                    </span>
                    <span className="oamount">{inr(o.final_amount)}</span>
                  </div>
                  <div className="order-body">
                    {o.item_image && (
                      <div className="order-thumbs">
                        <img src={img(o.item_image)} alt="" loading="lazy" />
                      </div>
                    )}
                    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                      <div className="o-items">{o.item_names || `${o.item_count} gift item${o.item_count === 1 ? '' : 's'}`}</div>
                      <div className="small muted" style={{ margin: '4px 0 8px' }}>
                        {o.item_count} item{o.item_count === 1 ? '' : 's'} · {address.city ? `${address.city}, ${address.pincode}` : 'Delivered to your address'}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                        <PackageSearch size={16} color="var(--primary)" /> Order #{o.order_number}
                        {address.city && <><MapPin size={14} color="var(--ink-3)" /> {address.city}</>}
                      </div>
                    </div>
                    <div className="order-actions">
                      <Link to={`/order/${o.id}`} className="btn btn-outline btn-sm">View Order</Link>
                      <Link to={`/order/${o.id}?track=1`} className="btn btn-primary btn-sm">
                        Track Order <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
