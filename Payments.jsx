import { useEffect, useState } from 'react';
import { CreditCard, Search, IndianRupee, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { api, inr, formatDate } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const STATUS_ICON = {
  paid: <CheckCircle2 size={14} color="#16a34a" />,
  pending: <Clock size={14} color="#d97706" />,
  failed: <XCircle size={14} color="#dc2626" />,
  refunded: <CreditCard size={14} color="#075985" />,
};

export default function AdminPayments() {
  const toast = useToast();
  const [payments, setPayments] = useState(null);
  const [term, setTerm] = useState('');

  useEffect(() => {
    api.payments().then((d) => setPayments(d.payments || [])).catch((e) => { toast.error(e.message); setPayments([]); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!payments) return <Spinner label="Loading payments…" />;

  const shown = payments.filter((p) =>
    `${p.order_number || ''} ${p.gateway || ''} ${p.method || ''} ${p.status || ''}`.toLowerCase().includes(term.toLowerCase())
  );
  const total = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0);
  const pending = payments.filter((p) => p.status === 'pending').length;
  const failed = payments.filter((p) => p.status === 'failed').length;

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--stat-bg': 'linear-gradient(135deg,#1c7a52,#37b584)', '--stat-tint': '#eaf7f0' }}>
          <div className="st-icon"><IndianRupee size={22} /></div>
          <div className="st-value">{inr(total)}</div>
          <div className="st-label">Captured</div>
        </div>
        <div className="stat-card" style={{ '--stat-bg': 'linear-gradient(135deg,#8a5d0c,#d9a441)', '--stat-tint': '#fdf3e0' }}>
          <div className="st-icon"><Clock size={22} /></div>
          <div className="st-value">{pending}</div>
          <div className="st-label">Pending</div>
        </div>
        <div className="stat-card" style={{ '--stat-bg': 'linear-gradient(135deg,#b91c1c,#ef4444)', '--stat-tint': '#fee2e2' }}>
          <div className="st-icon"><XCircle size={22} /></div>
          <div className="st-value">{failed}</div>
          <div className="st-label">Failed</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
            <input className="input" style={{ paddingLeft: 40 }} placeholder="Search payment…" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <span className="spacer" />
          <span className="small muted">{shown.length} transactions</span>
        </div>

        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr><th>Payment ID</th><th>Order</th><th>Date</th><th>Gateway</th><th>Method</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td className="td-name">{p.payment_id || `PAY-${p.id}`}</td>
                  <td>#{p.order_number || p.order_id}</td>
                  <td className="td-sub">{formatDate(p.created_at)}</td>
                  <td>{p.gateway || 'razorpay'}</td>
                  <td>{p.method || '—'}</td>
                  <td className="td-name">{inr(p.amount)}</td>
                  <td>
                    <span className={`status-chip ${p.status === 'paid' ? 'pay-paid' : p.status === 'failed' ? 'pay-failed' : p.status === 'refunded' ? 'pay-refunded' : 'pay-pending'}`} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      {STATUS_ICON[p.status] || null} {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!shown.length && (
                <tr><td colSpan={7} className="muted center" style={{ padding: 40 }}>
                  <CreditCard size={28} style={{ margin: '0 auto 8px' }} />
                  <div>No transactions found. Payments appear here the moment a customer checks out.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>
        Card numbers and CVV are never stored — Razorpay returns only tokens and transaction IDs.
      </p>
    </div>
  );
}
