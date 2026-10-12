import { useEffect, useState } from 'react';
import { Search, Users, Mail, Phone, ShoppingBag } from 'lucide-react';
import { api, inr, formatDate } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

export default function AdminCustomers() {
  const toast = useToast();
  const [customers, setCustomers] = useState(null);
  const [term, setTerm] = useState('');

  useEffect(() => {
    api.customers().then((d) => setCustomers(d.customers || [])).catch((e) => { toast.error(e.message); setCustomers([]); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!customers) return <Spinner label="Loading customers…" />;

  const shown = customers.filter((c) =>
    `${c.name} ${c.email || ''} ${c.phone || ''}`.toLowerCase().includes(term.toLowerCase())
  );
  const totalSpent = customers.reduce((s, c) => s + Number(c.total_spent || 0), 0);

  return (
    <div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card" style={{ '--stat-bg': 'linear-gradient(135deg,#7d2141,#b23a5e)', '--stat-tint': '#fbeaf0' }}>
          <div className="st-icon"><Users size={22} /></div>
          <div className="st-value">{customers.length}</div>
          <div className="st-label">Registered customers</div>
        </div>
        <div className="stat-card" style={{ '--stat-bg': 'linear-gradient(135deg,#1c7a52,#37b584)', '--stat-tint': '#eaf7f0' }}>
          <div className="st-icon"><ShoppingBag size={22} /></div>
          <div className="st-value">{customers.reduce((s, c) => s + Number(c.total_orders || 0), 0)}</div>
          <div className="st-label">Orders placed</div>
        </div>
        <div className="stat-card" style={{ '--stat-bg': 'linear-gradient(135deg,#8a5d0c,#d9a441)', '--stat-tint': '#fdf3e0' }}>
          <div className="st-icon"><Mail size={22} /></div>
          <div className="st-value">{inr(totalSpent)}</div>
          <div className="st-label">Lifetime revenue</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
            <input className="input" style={{ paddingLeft: 40 }} placeholder="Search name, email, phone…" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <span className="spacer" />
          <span className="small muted">{shown.length} customers</span>
        </div>

        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr><th>Customer</th><th>Contact</th><th>Joined</th><th>Orders</th><th>Total spent</th><th>Avg. order</th></tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className="review-avatar" style={{ width: 40, height: 40, fontSize: '0.85rem' }}>{String(c.name || 'U').charAt(0).toUpperCase()}</span>
                      <div>
                        <div className="td-name">{c.name}</div>
                        <div className="td-sub">ID {c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="td-sub" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Mail size={13} /> {c.email || '—'}</div>
                    <div className="td-sub" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Phone size={13} /> {c.phone || '—'}</div>
                  </td>
                  <td className="td-sub">{formatDate(c.created_at)}</td>
                  <td><span className="status-chip st-soft">{c.total_orders || 0}</span></td>
                  <td className="td-name">{inr(c.total_spent || 0)}</td>
                  <td>{c.total_orders ? inr(Number(c.total_spent) / Number(c.total_orders)) : '—'}</td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={6} className="muted center" style={{ padding: 40 }}>No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
