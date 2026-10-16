import { useEffect, useState } from 'react';
import { Check, EyeOff, Trash2, Star, Search, MessageSquare } from 'lucide-react';
import { api, formatDate } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner, Stars } from '../../components/ui';

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'hidden', label: 'Hidden' },
];

export default function AdminReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [term, setTerm] = useState('');

  const load = () => api.reviews().then((d) => setReviews(d.reviews || [])).catch(() => setReviews([]));
  useEffect(() => { load(); }, []);

  const setStatus = async (r, status) => {
    try {
      await api.updateReview(r.id, { status });
      toast.success(`Review ${status}`);
      setReviews((x) => x.map((y) => (y.id === r.id ? { ...y, status } : y)));
    } catch (e) { toast.error(e.message); }
  };

  const remove = async (r) => {
    try {
      await api.deleteReview(r.id);
      toast.success('Review deleted');
      setReviews((x) => x.filter((y) => y.id !== r.id));
    } catch (e) { toast.error(e.message); }
  };

  if (!reviews) return <Spinner label="Loading reviews…" />;

  const shown = reviews
    .filter((r) => (filter ? r.status === filter : true))
    .filter((r) => `${r.customer_name} ${r.comment} ${r.product_purchased || ''}`.toLowerCase().includes(term.toLowerCase()));

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div>
      <div className="table-wrap">
        <div className="table-toolbar">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
            <input className="input" style={{ paddingLeft: 40 }} placeholder="Search reviews…" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTERS.map((f) => (
              <button key={f.id} className={`pill ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)} style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                {f.label}
                {f.id === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
              </button>
            ))}
          </div>
          <span className="spacer" />
          <span className="small muted">{shown.length} reviews</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {shown.map((r) => (
            <div key={r.id} style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 260 }}>
                <span className="review-avatar">{String(r.customer_name || 'O').charAt(0).toUpperCase()}</span>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>{r.customer_name}</strong>
                    <Stars value={r.rating} size={13} />
                    <span className={`status-chip ${r.status === 'approved' ? 'st-delivered' : r.status === 'pending' ? 'st-pending' : 'st-cancelled'}`}>{r.status}</span>
                  </div>
                  <div className="small muted" style={{ margin: '3px 0 6px' }}>
                    {r.product_purchased ? <>on <strong>{r.product_purchased}</strong> · </> : null}
                    {formatDate(r.review_date || r.created_at)}
                  </div>
                  {r.title && <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{r.title}</div>}
                  <p style={{ fontSize: '0.92rem', color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 4 }}>“{r.comment}”</p>
                </div>
              </div>
              <div className="row-actions" style={{ alignSelf: 'center' }}>
                {r.status !== 'approved' && (
                  <button className="go" onClick={() => setStatus(r, 'approved')}><Check size={13} /> Approve</button>
                )}
                {r.status !== 'hidden' && (
                  <button onClick={() => setStatus(r, 'hidden')}><EyeOff size={13} /> Hide</button>
                )}
                <button className="danger" onClick={() => remove(r)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
          {!shown.length && (
            <div className="empty-state" style={{ padding: 50 }}>
              <div className="es-icon"><MessageSquare size={30} /></div>
              <h3>No {filter || 'matching'} reviews</h3>
              <p className="small">Customer reviews will appear here after they submit them on product pages.</p>
            </div>
          )}
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Star size={14} color="var(--gold)" /> Only approved reviews show on the homepage and product pages.
      </p>
    </div>
  );
}
