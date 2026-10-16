import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderTree, Save } from 'lucide-react';
import { api, img } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const BLANK = { name: '', slug: '', description: '', image: '', icon: 'Gift', status: 1, sort_order: 0 };

export default function AdminCategories() {
  const toast = useToast();
  const [cats, setCats] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => api.categories().then((d) => setCats(d.categories || [])).catch(() => setCats([]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return toast.error('Category name is required');
    setBusy(true);
    try {
      await api.saveCategory(form);
      toast.success(`Category ${form.id ? 'updated' : 'created'} ✨`);
      setForm(null);
      load();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async (c) => {
    try {
      await api.deleteCategory(c.id);
      toast.success('Category deleted');
      setCats((x) => x.filter((y) => y.id !== c.id));
    } catch (e) { toast.error(e.message); } finally { setConfirm(null); }
  };

  if (!cats) return <Spinner label="Loading categories…" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <p className="muted small">{cats.length} categories · shown on the homepage “Meaningful Gifts” folders</p>
        <button className="btn btn-primary btn-sm" onClick={() => setForm({ ...BLANK })}><Plus size={15} /> Add category</button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Description</th><th>Slug</th><th>Status</th><th style={{ width: 180 }}>Actions</th></tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id}>
                  <td><img className="thumb" src={img(c.image)} alt="" /></td>
                  <td className="td-name">{c.name}</td>
                  <td className="td-sub" style={{ maxWidth: 320 }}>{c.description}</td>
                  <td className="td-sub">/{c.slug}</td>
                  <td><span className={`status-chip ${Number(c.status) ? 'st-delivered' : 'st-cancelled'}`}>{Number(c.status) ? 'Active' : 'Hidden'}</span></td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => setForm({ ...BLANK, ...c })}><Pencil size={13} /> Edit</button>
                      <button className="danger" onClick={() => setConfirm(c)}><Trash2 size={13} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!cats.length && <tr><td colSpan={6} className="muted center" style={{ padding: 36 }}><FolderTree size={26} style={{ margin: '0 auto 8px' }} /><div>No categories yet.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <div className="modal-backdrop" onClick={() => setForm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>{form.id ? 'Edit category' : 'New category'}</h3>
            <div className="form-grid-2" style={{ display: 'grid', gap: 16 }}>
              <div className="field span-2">
                <label>Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} placeholder="Photo Gifts" />
              </div>
              <div className="field">
                <label>Slug</label>
                <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="photo-gifts" />
              </div>
              <div className="field">
                <label>Icon (lucide name)</label>
                <input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Gift" />
              </div>
              <div className="field span-2">
                <label>Image path or URL</label>
                <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="images/categories/photo-gifts.svg" />
              </div>
              <div className="field span-2">
                <label>Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
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
            <p className="muted small" style={{ margin: '12px 0 20px' }}>Products keep existing; the category link disappears from the store.</p>
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
