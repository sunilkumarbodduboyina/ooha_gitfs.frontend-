import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, Layers } from 'lucide-react';
import { api, img } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const BLANK = { name: '', slug: '', type: 'collection', description: '', image: '', status: 1, sort_order: 0 };

const TYPE_LABEL = { occasion: 'st-pending', relationship: 'st-shipped', collection: 'st-delivered' };

export default function AdminCollections() {
  const toast = useToast();
  const [cols, setCols] = useState(null);
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => api.collections().then((d) => setCols(d.collections || [])).catch(() => setCols([]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return toast.error('Collection name is required');
    setBusy(true);
    try {
      await api.saveCollection(form);
      toast.success(`Collection ${form.id ? 'updated' : 'created'} ✨`);
      setForm(null);
      load();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async (c) => {
    try {
      await api.deleteCollection(c.id);
      toast.success('Collection deleted');
      setCols((x) => x.filter((y) => y.id !== c.id));
    } catch (e) { toast.error(e.message); } finally { setConfirm(null); }
  };

  if (!cols) return <Spinner label="Loading collections…" />;

  const shown = filter === 'all' ? cols : cols.filter((c) => c.type === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'occasion', 'relationship', 'collection'].map((t) => (
            <button key={t} className={`pill ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
              {t === 'all' ? `All (${cols.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)}s (${cols.filter((c) => c.type === t).length})`}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setForm({ ...BLANK })}><Plus size={15} /> Add collection</button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Type</th><th>Description</th><th>Slug</th><th style={{ width: 180 }}>Actions</th></tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id}>
                  <td><img className="thumb" src={img(c.image)} alt="" /></td>
                  <td className="td-name">{c.name}</td>
                  <td><span className={`status-chip ${TYPE_LABEL[c.type] || 'st-soft'}`}>{c.type}</span></td>
                  <td className="td-sub" style={{ maxWidth: 300 }}>{c.description}</td>
                  <td className="td-sub">/{c.slug}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => setForm({ ...BLANK, ...c })}><Pencil size={13} /> Edit</button>
                      <button className="danger" onClick={() => setConfirm(c)}><Trash2 size={13} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={6} className="muted center" style={{ padding: 36 }}><Layers size={26} style={{ margin: '0 auto 8px' }} /><div>No collections in this filter.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <div className="modal-backdrop" onClick={() => setForm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>{form.id ? 'Edit collection' : 'New collection'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="field">
                <label>Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} placeholder="Love Lab" />
              </div>
              <div className="form-grid-2" style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label>Type</label>
                  <select className="input select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="collection">Collection</option>
                    <option value="occasion">Occasion</option>
                    <option value="relationship">Relationship</option>
                  </select>
                </div>
                <div className="field">
                  <label>Slug</label>
                  <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="love-lab" />
                </div>
              </div>
              <div className="field">
                <label>Image path or URL</label>
                <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="images/collections/love-lab.svg" />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-grid-2" style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label>Display order</label>
                  <input className="input" inputMode="numeric" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="input select" value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}>
                    <option value={1}>Active</option><option value={0}>Hidden</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <button className="btn btn-outline full" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn btn-primary full" onClick={save} disabled={busy}>{busy ? 'Saving…' : <><Save size={16} /> Save</>}</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem' }}>Delete “{confirm.name}”?</h3>
            <p className="muted small" style={{ margin: '12px 0 20px' }}>This removes the collection page from the storefront.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline full" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn full" style={{ background: '#dc2626', color: '#fff' }} onClick={() => remove(confirm)}><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
