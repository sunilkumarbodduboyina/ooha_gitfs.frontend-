import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IndianRupee, ShoppingCart, Users, Star, TrendingUp, Package,
  ArrowRight, Clock,
} from 'lucide-react';
import { api, inr, formatDate, orderStatusKey } from '../../services/api';
import { SkeletonGrid, Spinner } from '../../components/ui';

const CARDS = [
  { key: 'revenue', label: 'Total Revenue', icon: IndianRupee, bg: 'linear-gradient(135deg,#7d2141,#b23a5e)', tint: '#fbeaf0', money: true },
  { key: 'orders', label: 'Total Orders', icon: ShoppingCart, bg: 'linear-gradient(135deg,#3a4fb8,#6a7fe0)', tint: '#eef3ff' },
  { key: 'customers', label: 'Customers', icon: Users, bg: 'linear-gradient(135deg,#1c7a52,#37b584)', tint: '#eaf7f0' },
  { key: 'products', label: 'Products', icon: Package, bg: 'linear-gradient(135deg,#8a5d0c,#d9a441)', tint: '#fdf3e0' },
];

const STATUS_COLORS = {
  Pending: '#f59e0b', Confirmed: '#3b82f6', Packed: '#6366f1',
  Shipped: '#8b5cf6', 'Out for Delivery': '#a855f7',
  Delivered: '#22c55e', Cancelled: '#ef4444',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.dashboard().then((d) => setStats(d.stats)).catch(() => setStats({}));
  }, []);

  if (!stats) return <Spinner label="Loading dashboard…" />;

  const revenue = Number(stats.revenue || 0);
  const monthly = stats.monthly_revenue || [];
  const maxMonth = Math.max(...monthly.map((m) => Number(m.total) || 0), 1);
  const statusDist = stats.status_distribution || [];
  const totalOrders = statusDist.reduce((s, x) => s + Number(x.count), 0) || 1;

  /* donut geometry */
  let acc = 0;
  const donutParts = statusDist.map((s) => {
    const frac = Number(s.count) / totalOrders;
    const part = { ...s, offset: acc, frac };
    acc += frac;
    return part;
  });

  const cardValues = {
    revenue,
    orders: stats.total_orders || 0,
    customers: stats.total_customers || 0,
    products: stats.total_products || 0,
  };

  return (
    <div>
      <div className="stat-grid">
        {CARDS.map(({ key, label, icon: Icon, bg, tint, money }, i) => (
          <motion.div
            key={key}
            className="stat-card"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.45 }}
            style={{ '--stat-bg': bg, '--stat-tint': tint }}
          >
            <div className="st-icon"><Icon size={22} /></div>
            <div className="st-value">{money ? inr(cardValues[key]) : cardValues[key]}</div>
            <div className="st-label">{label}</div>
            <div className="st-delta">
              <TrendingUp size={12} style={{ verticalAlign: -2 }} />{' '}
              {stats.pending_orders > 0 && key === 'orders' ? `${stats.pending_orders} awaiting fulfilment` : 'Live from MySQL'}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="panel-grid">
        {/* revenue chart */}
        <div className="panel">
          <h3>
            Revenue (last 7 months)
            <span className="small muted" style={{ fontWeight: 600 }}>{inr(monthly.reduce((s, m) => s + Number(m.total || 0), 0))} total</span>
          </h3>
          {monthly.length ? (
            <div className="chart-bars">
              {monthly.map((m, i) => (
                <div className="chart-col" key={m.month}>
                  <div
                    className="chart-bar"
                    style={{ height: `${Math.max(4, (Number(m.total) / maxMonth) * 100)}%`, animationDelay: `${i * 0.08}s` }}
                    title={`${m.month}: ${inr(m.total)}`}
                  >
                    <span>{Number(m.total) >= 1000 ? `${(Number(m.total) / 1000).toFixed(1)}k` : Number(m.total)}</span>
                  </div>
                  <span className="cl">{m.month}</span>
                </div>
              ))}
            </div>
          ) : <p className="muted small">No revenue data yet.</p>}
        </div>

        {/* order status donut */}
        <div className="panel">
          <h3>Order status</h3>
          <div className="donut-wrap">
            <svg viewBox="0 0 42 42" style={{ maxWidth: 190, margin: '0 auto' }} role="img" aria-label="Order status distribution">
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f1e8e3" strokeWidth="7" />
              {donutParts.map((p) => (
                <circle
                  key={p.order_status}
                  cx="21" cy="21" r="15.915" fill="none"
                  stroke={STATUS_COLORS[p.order_status] || '#b23a5e'}
                  strokeWidth="7"
                  strokeDasharray={`${p.frac * 100} ${100 - p.frac * 100}`}
                  strokeDashoffset={25 - p.offset * 100}
                />
              ))}
              <text x="21" y="20" textAnchor="middle" fontSize="6" fontWeight="800" fill="#2c2126">{totalOrders}</text>
              <text x="21" y="25" textAnchor="middle" fontSize="2.6" fill="#8d7f85">ORDERS</text>
            </svg>
            <ul className="donut-legend">
              {donutParts.map((p) => (
                <li key={p.order_status}>
                  <span className="sw" style={{ background: STATUS_COLORS[p.order_status] || '#b23a5e' }} />
                  {p.order_status}
                  <span className="val">{p.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="panel-grid">
        {/* recent orders */}
        <div className="panel">
          <h3>
            Recent orders
            <Link to="/admin/orders" className="btn btn-outline btn-sm">View all <ArrowRight size={14} /></Link>
          </h3>
          <div className="table-scroll">
            <table className="data" style={{ minWidth: 560 }}>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Status</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {(stats.recent_orders || []).map((o) => (
                  <tr key={o.id}>
                    <td><Link to={`/admin/orders/${o.id}`} className="td-name" style={{ color: 'var(--primary)' }}>#{o.order_number}</Link></td>
                    <td>{o.customer_name}</td>
                    <td><span className={`status-chip st-${orderStatusKey(o.order_status)}`}>{o.order_status}</span></td>
                    <td className="td-name">{inr(o.final_amount)}</td>
                  </tr>
                ))}
                {!stats.recent_orders?.length && (
                  <tr><td colSpan={4} className="muted">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* top products + quick glance */}
        <div className="panel">
          <h3><span><Star size={16} color="var(--gold)" style={{ verticalAlign: -2 }} /> Top sellers</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(stats.top_products || []).map((p, i) => (
              <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--gold)', width: 20 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div className="small muted">{p.sold} sold · {inr(p.selling_price)}</div>
                </div>
              </div>
            ))}
            {!stats.top_products?.length && <p className="muted small">Sales will appear here after the first orders.</p>}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="sum-row" style={{ padding: '4px 0' }}>
              <span><Clock size={14} style={{ verticalAlign: -2 }} /> Pending reviews</span>
              <strong>{stats.pending_reviews || 0}</strong>
            </div>
            <div className="sum-row" style={{ padding: '4px 0' }}>
              <span><ShoppingCart size={14} style={{ verticalAlign: -2 }} /> Orders to fulfil</span>
              <strong>{stats.pending_orders || 0}</strong>
            </div>
            <div className="sum-row" style={{ padding: '4px 0' }}>
              <span><Star size={14} style={{ verticalAlign: -2 }} /> Avg. rating</span>
              <strong>{Number(stats.avg_rating || 0).toFixed(1)} ★</strong>
            </div>
          </div>
        </div>
      </div>

      <p className="small muted center" style={{ marginTop: 10 }}>
        Stats refresh live — product price edits appear on the storefront immediately. {formatDate(new Date())}
      </p>
    </div>
  );
}
