import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, ShoppingCart } from 'lucide-react';
import { api, inr, formatDate, orderStatusKey } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const STATUSES = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState('All');
  const [term, setTerm] = useState('');

  const load = (st = status) => {
    setOrders(null);
    api.adminOrders({ status: st === 'All' ? undefined : st })
      .then((d) => setOrders(d.orders || []))
      .catch((e) => { toast.error(e.message); setOrders([]); });
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const shown = (orders || []).filter((o) =>
    `${o.order_number} ${o.customer_name} ${o.customer_email || ''}`.toLowerCase().includes(term.toLowerCase())
  );

  if (!orders) return <Spinner label="Loading orders…" />;

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
          <input className="input" style={{ paddingLeft: 40 }} placeholder="Search order / customer…" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button key={s} className={`pill ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)} style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
              {s}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <span className="small muted">{shown.length} orders</span>
      </div>

      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th>Amount</th><th></th></tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id}>
                <td className="td-name">#{o.order_number}</td>
                <td className="td-sub">{formatDate(o.created_at)}</td>
                <td>
                  <div className="td-name">{o.customer_name}</div>
                  <div className="td-sub">{o.customer_email || o.customer_phone || ''}</div>
                </td>
                <td>{o.item_count ?? '—'}</td>
                <td>
                  <span className={`status-chip ${o.payment_status === 'paid' ? 'pay-paid' : o.payment_status === 'failed' ? 'pay-failed' : 'pay-pending'}`}>
                    {o.payment_status}
                  </span>
                  <div className="td-sub">{o.payment_method || ''}</div>
                </td>
                <td><span className={`status-chip st-${orderStatusKey(o.order_status)}`}>{o.order_status}</span></td>
                <td className="td-name">{inr(o.final_amount)}</td>
                <td>
                  <Link to={`/admin/orders/${o.id}`} className="row-actions"><span className="go" style={{ padding: '7px 13px', borderRadius: 9, border: '1px solid var(--line)', display: 'inline-flex', gap: 5, alignItems: 'center', fontSize: '0.76rem', fontWeight: 800 }}><Eye size={13} /> Open</span></Link>
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr><td colSpan={8} className="muted center" style={{ padding: 40 }}>
                <ShoppingCart size={28} style={{ margin: '0 auto 8px' }} />
                <div>No orders match this filter.</div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
