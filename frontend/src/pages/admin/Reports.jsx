import { useEffect, useState } from 'react';
import { BarChart3, Download, IndianRupee, ShoppingCart, Receipt, TrendingUp } from 'lucide-react';
import { api, inr } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const STATUS_COLORS = {
  Pending: '#f59e0b', Confirmed: '#3b82f6', Packed: '#6366f1',
  Shipped: '#8b5cf6', 'Out for Delivery': '#a855f7',
  Delivered: '#22c55e', Cancelled: '#ef4444',
};

export default function AdminReports() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([api.dashboard(), api.payments().catch(() => ({ payments: [] }))])
      .then(([d, p]) => setData({ stats: d.stats, payments: p.payments || [] }))
      .catch((e) => { toast.error(e.message); setData({ stats: {}, payments: [] }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return <Spinner label="Compiling reports…" />;

  const s = data.stats || {};
  const monthly = s.monthly_revenue || [];
  const statuses = s.status_distribution || [];
  const top = s.top_products || [];
  const totalOrders = Number(s.total_orders) || 0;
  const revenue = Number(s.revenue) || 0;
  const aov = totalOrders ? revenue / totalOrders : 0;

  const paidCount = data.payments.filter((p) => p.status === 'paid').length;
  const paidSum = data.payments.filter((p) => p.status === 'paid').reduce((x, p) => x + Number(p.amount || 0), 0);
  const failedCount = data.payments.filter((p) => p.status === 'failed').length;
  const successRate = data.payments.length ? Math.round((paidCount / data.payments.length) * 100) : 0;

  const maxMonth = Math.max(...monthly.map((m) => Number(m.total) || 0), 1);
  const statusTotal = statuses.reduce((x, st) => x + Number(st.count), 0) || 1;

  const KPIS = [
    { icon: IndianRupee, label: 'Gross revenue', value: inr(revenue), sub: `${monthly.length} months tracked` },
    { icon: ShoppingCart, label: 'Avg. order value', value: inr(Math.round(aov)), sub: `${totalOrders} orders lifetime` },
    { icon: Receipt, label: 'Payment success', value: `${successRate}%`, sub: `${paidCount} of ${data.payments.length} transactions` },
    { icon: TrendingUp, label: 'Captured amount', value: inr(Math.round(paidSum)), sub: `${failedCount} failed attempts` },
  ];

  const exportCsv = () => {
    try {
      const rows = [['Month', 'Revenue']];
      monthly.forEach((m) => rows.push([m.month, m.total]));
      const csv = rows.map((r) => r.join(',')).join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ooha-revenue-report.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Revenue report downloaded');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <p className="muted small"><BarChart3 size={15} style={{ verticalAlign: -3 }} /> Live sales intelligence — computed from orders &amp; payments in MySQL</p>
        <button className="btn btn-outline btn-sm" onClick={exportCsv}><Download size={15} /> Export revenue CSV</button>
      </div>

      <div className="stat-grid">
        {KPIS.map(({ icon: Icon, label, value, sub }, i) => (
          <div key={label} className="stat-card" style={{ '--stat-bg': 'linear-gradient(135deg,#7d2141,#b23a5e)', '--stat-tint': '#fbeaf0', animationDelay: `${i * 0.06}s` }}>
            <div className="st-icon"><Icon size={22} /></div>
            <div className="st-value">{value}</div>
            <div className="st-label">{label}</div>
            <div className="st-delta">{sub}</div>
          </div>
        ))}
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Monthly revenue</h3>
          {monthly.length ? (
            <div className="table-scroll">
              <table className="data" style={{ minWidth: 420 }}>
                <thead><tr><th>Month</th><th style={{ width: '55%' }}>Revenue</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.month}>
                      <td style={{ fontWeight: 700 }}>{m.month}</td>
                      <td>
                        <div style={{ background: 'var(--blush)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(3, (Number(m.total) / maxMonth) * 100)}%`, height: '100%', background: 'var(--grad-rose)' }} />
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>{inr(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{ fontWeight: 800 }}>Total</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>{inr(monthly.reduce((x, m) => x + Number(m.total || 0), 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : <p className="muted small">No revenue recorded yet.</p>}
        </div>

        <div className="panel">
          <h3>Fulfilment funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {statuses.map((st) => (
              <div key={st.order_status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: 5 }}>
                  <span>{st.order_status}</span>
                  <span>{st.count} ({Math.round((Number(st.count) / statusTotal) * 100)}%)</span>
                </div>
                <div style={{ background: '#f4eeeb', borderRadius: 8, height: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${(Number(st.count) / statusTotal) * 100}%`, height: '100%', background: STATUS_COLORS[st.order_status] || 'var(--primary)' }} />
                </div>
              </div>
            ))}
            {!statuses.length && <p className="muted small">No orders yet.</p>}
          </div>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Best sellers</h3>
          <div className="table-scroll">
            <table className="data" style={{ minWidth: 420 }}>
              <thead><tr><th>#</th><th>Product</th><th>Units sold</th><th style={{ textAlign: 'right' }}>Price</th></tr></thead>
              <tbody>
                {top.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800, color: 'var(--gold)' }}>{i + 1}</td>
                    <td className="td-name">{p.name}</td>
                    <td><span className="status-chip st-soft">{p.sold}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{inr(p.selling_price)}</td>
                  </tr>
                ))}
                {!top.length && <tr><td colSpan={4} className="muted center" style={{ padding: 30 }}>Sales data appears after the first delivered orders.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h3>Payment gateway health</h3>
          <div className="table-scroll">
            <table className="data" style={{ minWidth: 380 }}>
              <thead><tr><th>Status</th><th>Transactions</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {['paid', 'pending', 'failed', 'refunded'].map((st) => {
                  const rows = data.payments.filter((p) => p.status === st);
                  return (
                    <tr key={st}>
                      <td><span className={`status-chip ${st === 'paid' ? 'pay-paid' : st === 'failed' ? 'pay-failed' : st === 'refunded' ? 'pay-refunded' : 'pay-pending'}`}>{st}</span></td>
                      <td>{rows.length}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{inr(rows.reduce((x, p) => x + Number(p.amount || 0), 0))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Card data never touches your servers — Razorpay tokenises everything.
          </p>
        </div>
      </div>
    </div>
  );
}
