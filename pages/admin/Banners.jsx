import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, Image as ImageIcon, Eye, EyeOff, Upload } from 'lucide-react';
import { api, img } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const BLANK = { title: '', subtitle: '', image: '', button_text: 'SHOP NOW', button_link: '/products', display_order: 0, active: 1 };

export default function AdminBanners() {
  const toast = useToast();
  const [banners, setBanners] = useState(null);
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => api.adminBanners().then((d) => setBanners(d.banners || [])).catch(() => setBanners([]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title.trim()) return toast.error('Banner title is required');
    setBusy(true);
    try {
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
        const up = await api.upload(fd);
        await api.saveBanner({ ...form, image: up.files[0].url });
      } else {
        await api.saveBanner(form);
      }
      toast.success(`Banner ${form.id ? 'updated' : 'created'} 🎉`);
      setForm(null); setFile(null); load();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async (b) => {
    try {
      await api.deleteBanner(b.id);
      toast.success('Banner deleted');
      setBanners((x) => x.filter((y) => y.id !== b.id));
    } catch (e) { toast.error(e.message); } finally { setConfirm(null); }
  };

  if (!banners) return <Spinner label="Loading banners…" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <p className="muted small">{banners.length} hero slides · rotate automatically every second on the homepage</p>
        <button className="btn btn-primary btn-sm" onClick={() => setForm({ ...BLANK, display_order: banners.length })}>
          <Plus size={15} /> Add banner
        </button>
      </div>

      <div className="grid-3">
        {banners.map((b) => (
          <div key={b.id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: '16/7', background: 'var(--blush)' }}>
              <img src={img(b.image)} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className={`status-chip ${Number(b.active) ? 'st-delivered' : 'st-cancelled'}`} style={{ position: 'absolute', top: 10, left: 10 }}>
                {Number(b.active) ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 800 }}>{b.title}</div>
              <div className="small muted" style={{ margin: '4px 0 10px', minHeight: 34 }}>{b.subtitle}</div>
              <div className="td-sub" style={{ marginBottom: 12 }}>
                CTA: <strong>{b.button_text}</strong> → {b.button_link} · order {b.display_order}
              </div>
              <div className="row-actions">
                <button onClick={() => { setForm({ ...BLANK, ...b }); setFile(null); }}><Pencil size={13} /> Edit</button>
                <button onClick={() => api.saveBanner({ ...b, active: Number(b.active) ? 0 : 1 }).then(() => { toast.success(Number(b.active) ? 'Banner hidden' : 'Banner visible'); load(); })}>
                  {Number(b.active) ? <EyeOff size={13} /> : <Eye size={13} />} {Number(b.active) ? 'Hide' : 'Show'}
                </button>
                <button className="danger" onClick={() => setConfirm(b)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
        {!banners.length && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="es-icon"><ImageIcon size={30} /></div>
            <h3>No banners yet</h3>
            <p>Add your first hero slide — it appears at the top of the homepage.</p>
          </div>
        )}
      </div>

      {form && (
        <div className="modal-backdrop" onClick={() => setForm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>{form.id ? 'Edit banner' : 'New banner'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="field">
                <label>Title *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Make Every Moment Meaningful" />
              </div>
              <div className="field">
                <label>Subtitle</label>
                <textarea className="input" rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div className="form-grid-2" style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label>Button text</label>
                  <input className="input" value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} />
                </div>
                <div className="field">
                  <label>Button link</label>
                  <input className="input" value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} placeholder="/products" />
                </div>
              </div>
              <div className="field">
                <label>Image path / URL</label>
                <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="images/banners/banner-1.svg" />
              </div>
              <div className="form-grid-3" style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label>Or upload image</label>
                  <label className="dropzone" style={{ padding: 14, textAlign: 'center' }}>
                    <Upload size={18} style={{ margin: '0 auto 4px' }} />
                    <span className="small">{file ? file.name : 'Choose file'}</span>
                    <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="field">
                  <label>Display order</label>
                  <input className="input" inputMode="numeric" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="input select" value={form.active} onChange={(e) => setForm({ ...form, active: Number(e.target.value) })}>
                    <option value={1}>Visible</option><option value={0}>Hidden</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <button className="btn btn-outline full" onClick={() => { setForm(null); setFile(null); }}>Cancel</button>
              <button className="btn btn-primary full" onClick={save} disabled={busy}>{busy ? 'Saving…' : <><Save size={16} /> Save banner</>}</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ padding: 30, maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem' }}>Delete “{confirm.title}”?</h3>
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
