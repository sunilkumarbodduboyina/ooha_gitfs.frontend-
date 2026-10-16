import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, BadgePercent, Copy } from 'lucide-react';
import { api, inr, formatDate } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const BLANK = {
  code: '', description: '', discount_type: 'percent', discount_value: '',
  min_order: 500, max_discount: '', expires_at: '', active: 1,
};

export default function AdminOffers() {
  const toast = useToast();
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => api.adminCoupons().then((d) => setCoupons(d.coupons || [])).catch(() => setCoupons([]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (!form.discount_value || Number(form.discount_value) <= 0) return toast.error('Enter a discount value');
    setBusy(true);
    try {
      await api.saveCoupon({ ...form, code: form.code.toUpperCase().trim() });
      toast.success(`Coupon ${form.id ? 'updated' : 'created'} 🏷️`);
      setForm(null);
      load();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async (c) => {
    try {
      await api.deleteCoupon(c.id);
      toast.success('Coupon deleted');
      setCoupons((x) => x.filter((y) => y.id !== c.id));
    } catch (e) { toast.error(e.message); } finally { setConfirm(null); }
  };

  const copy = async (code) => {
    try { await navigator.clipboard.writeText(code); toast.success(`${code} copied`); } catch { toast.error('Copy failed'); }
  };

  if (!coupons) return <Spinner label="Loading coupons…" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <p className="muted small">{coupons.length} coupons · customers apply these at checkout</p>
        <button className="btn btn-primary btn-sm" onClick={() => setForm({ ...BLANK })}><Plus size={15} /> Add coupon</button>
      </div>

      <div className="grid-3">
        {coupons.map((c) => (
          <div key={c.id} className="panel" style={{ background: c.active ? 'linear-gradient(135deg, var(--primary-soft), var(--gold-soft))' : '#fff', borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                  {c.discount_type === 'percent' ? `${Number(c.discount_value)}% OFF` : `${inr(c.discount_value)} OFF`}
                </div>
                <button className="pill" style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.06em' }} onClick={() => copy(c.code)}>
                  <Copy size={13} /> {c.code}
                </button>
              </div>
              <span className={`status-chip ${Number(c.active) ? 'st-delivered' : 'st-cancelled'}`}>{Number(c.active) ? 'Active' : 'Off'}</span>
            </div>
            <p className="small muted" style={{ margin: '14px 0 6px', minHeight: 36 }}>{c.description}</p>
            <div className="small muted">
              Min order {inr(c.min_order)}{Number(c.max_discount) ? ` · max save ${inr(c.max_discount)}` : ''}<br />
              {c.expires_at ? `Valid till ${formatDate(c.expires_at)}` : 'No expiry date'}
            </div>
            <div className="row-actions" style={{ marginTop: 14 }}>
              <button onClick={() => { setForm({ ...BLANK, ...c, max_discount: c.max_discount || '' }); }}><Pencil size={13} /> Edit</button>
              <button onClick={() => api.saveCoupon({ ...c, active: Number(c.active) ? 0 : 1 }).then(() => { toast.success(Number(c.active) ? 'Coupon disabled' : 'Coupon enabled'); load(); })}>
                {Number(c.active) ? 'Disable' : 'Enable'}
              </button>
              <button className="danger" onClick={() => setConfirm(c)}><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        ))}
        {!coupons.length && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="es-icon"><BadgePercent size={30} /></div>
            <h3>No coupons yet</h3>
            <p>Create your first discount code for shoppers to apply at checkout.</p>
          </div>
        )}
      </div>

      {form && (
        <div className="modal-backdrop" onClick={() => setForm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>{form.id ? 'Edit coupon' : 'New coupon'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="form-grid-2" style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label>Code *</label>
                  <input className="input" style={{ textTransform: 'uppercase' }} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="WELCOME10" />
                </div>
                <div className="field">
                  <label>Type</label>
                  <select className="input select" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat ₹</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="10% off for new customers" />
              </div>
              <div className="form-grid-3" style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label>{form.discount_type === 'percent' ? 'Percent off *' : 'Amount off *'}</label>
                  <input className="input" inputMode="decimal" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value.replace(/[^0-9.]/g, '') })} placeholder={form.discount_type === 'percent' ? '10' : '200'} />
                </div>
                <div className="field">
                  <label>Min order (₹)</label>
                  <input className="input" inputMode="numeric" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value.replace(/[^0-9]/g, '') })} />
                </div>
                <div className="field">
                  <label>Max discount (₹)</label>
                  <input className="input" inputMode="numeric" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value.replace(/[^0-9]/g, '') })} placeholder="optional" />
                </div>
                <div className="field">
                  <label>Expires on</label>
                  <input className="input" type="date" value={String(form.expires_at || '').slice(0, 10)} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="input select" value={form.active} onChange={(e) => setForm({ ...form, active: Number(e.target.value) })}>
                    <option value={1}>Active</option><option value={0}>Disabled</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <button className="btn btn-outline full" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn btn-primary full" onClick={save} disabled={busy}>{busy ? 'Saving…' : <><Save size={16} /> Save coupon</>}</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem' }}>Delete coupon “{confirm.code}”?</h3>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-outline full" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn full" style={{ background: '#dc2626', color: '#fff' }} onClick={() => remove(confirm)}><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
