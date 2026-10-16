import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Save, Trash2, Upload, Eye } from 'lucide-react';
import { api, img, inr } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const BLANK = {
  name: '', description: '', category_id: '', collection_id: '',
  occasion: '', relationship: '', subcategory: '',
  original_price: '', selling_price: '', stock: 100,
  sku: '', brand: 'Ooha Gifts', tags: '', video: '',
  featured: 0, bestseller: 0, new_arrival: 0, status: 1,
};

function Toggle({ on, onChange, label, sub }) {
  return (
    <div className="switch-row">
      <div>
        <div className="sr-text">{label}</div>
        {sub && <div className="sr-sub">{sub}</div>}
      </div>
      <label className="switch">
        <input type="checkbox" checked={Boolean(on)} onChange={(e) => onChange(e.target.checked ? 1 : 0)} />
        <span className="track" />
      </label>
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const editing = Boolean(id);

  const [form, setForm] = useState(BLANK);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setNum = (k) => (e) => setForm({ ...form, [k]: e.target.value.replace(/[^0-9.]/g, '') });

  useEffect(() => {
    Promise.all([
      api.categories().catch(() => ({ categories: [] })),
      api.collections().catch(() => ({ collections: [] })),
    ]).then(([c, col]) => {
      setCategories(c.categories || []);
      setCollections(col.collections || []);
    });
  }, []);

  useEffect(() => {
    if (!editing) { setLoading(false); return undefined; }
    let alive = true;
    api.product(id)
      .then((d) => {
        if (!alive) return;
        const p = d.product;
        setForm({
          ...BLANK,
          name: p.name || '', description: p.description || '',
          category_id: p.category_id || '', collection_id: p.collection_id || '',
          occasion: p.occasion || '', relationship: p.relationship || '', subcategory: p.subcategory || '',
          original_price: p.original_price ?? '', selling_price: p.selling_price ?? '',
          stock: p.stock ?? 0, sku: p.sku || '', brand: p.brand || 'Ooha Gifts',
          tags: p.tags || '', video: p.video || '',
          featured: p.featured || 0, bestseller: p.bestseller || 0,
          new_arrival: p.new_arrival || 0, status: p.status ?? 1,
        });
        setExistingImages(d.images || (p.image ? [p.image] : []));
        setLoading(false);
      })
      .catch((e) => { toast.error(e.message); setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const original = Number(form.original_price) || 0;
  const selling = Number(form.selling_price) || 0;
  const discAmount = Math.max(0, original - selling);
  const discPct = original > 0 ? Math.round((discAmount / original) * 100) : 0;

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const total = existingImages.length + newFiles.length + files.length;
    if (total > 8) { toast.error('Maximum 8 images per product'); return; }
    setNewFiles((f) => [...f, ...files]);
    e.target.value = '';
  };

  const newPreviews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);

  const submit = async (publishPreview) => {
    if (!form.name.trim()) return toast.error('Product name is required');
    if (selling <= 0) return toast.error('Selling price must be greater than 0');
    if (original > 0 && selling > original) return toast.error('Selling price cannot exceed MRP');
    setBusy(true);
    try {
      if (!editing) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        newFiles.forEach((f) => fd.append('images', f));
        const d = await api.createProduct(fd);
        toast.success(`"${form.name}" created 🎉`);
        navigate('/admin/products');
        return d;
      }

      let kept = existingImages;
      if (newFiles.length) {
        const fd = new FormData();
        newFiles.forEach((f) => fd.append('files', f));
        const up = await api.upload(fd);
        kept = [...existingImages, ...up.files.map((f) => f.url)];
      }
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      /* replace image set whenever it changed */
      if (JSON.stringify(kept) !== JSON.stringify(existingImages) || newFiles.length) {
        fd.append('images', JSON.stringify(kept));
      }
      await api.updateProduct(id, fd);
      toast.success('Product updated — storefront refreshed ✨');
      if (publishPreview) navigate('/admin/products');
      else navigate('/admin/products');
      return undefined;
    } catch (e) {
      toast.error(e.message);
      return undefined;
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading product…" />;

  const catName = categories.find((c) => c.id === form.category_id)?.name;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <Link to="/admin/products" className="btn btn-outline btn-sm"><ArrowLeft size={15} /> Back</Link>
        <h2 style={{ fontSize: '1.35rem' }}>{editing ? `Edit: ${form.name || 'product'}` : 'Add new product'}</h2>
        <span style={{ flex: 1 }} />
        <Link to="/products" className="btn btn-outline btn-sm" target="_blank"><Eye size={15} /> Storefront</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22, alignItems: 'start' }}>
        <div className="form-panel">
          {/* basics */}
          <div className="form-section">
            <h3>Basic information</h3>
            <div className="form-grid-2">
              <div className="field span-2">
                <label>Product name *</label>
                <input className="input" value={form.name} onChange={set('name')} placeholder="Personalized Photo Frame — Our Story" />
              </div>
              <div className="field span-2">
                <label>Description</label>
                <textarea className="input" rows={5} value={form.description} onChange={set('description')} placeholder="Tell customers why this gift is special…" />
              </div>
              <div className="field">
                <label>Category</label>
                <select className="input select" value={form.category_id} onChange={set('category_id')}>
                  <option value="">— Select category —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Collection</label>
                <select className="input select" value={form.collection_id} onChange={set('collection_id')}>
                  <option value="">— Select collection —</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                </select>
              </div>
              <div className="field">
                <label>Occasion tag</label>
                <input className="input" value={form.occasion} onChange={set('occasion')} placeholder="birthday / anniversary / valentine" />
              </div>
              <div className="field">
                <label>Relationship tag</label>
                <input className="input" value={form.relationship} onChange={set('relationship')} placeholder="for-her / for-him / parents" />
              </div>
            </div>
          </div>

          {/* pricing */}
          <div className="form-section">
            <h3>Pricing &amp; inventory</h3>
            <div className="form-grid-3">
              <div className="field">
                <label>MRP (original price) *</label>
                <input className="input" inputMode="decimal" value={form.original_price} onChange={setNum('original_price')} placeholder="999" />
              </div>
              <div className="field">
                <label>Selling price *</label>
                <input className="input" inputMode="decimal" value={form.selling_price} onChange={setNum('selling_price')} placeholder="699" />
              </div>
              <div className="field">
                <label>Stock quantity</label>
                <input className="input" inputMode="numeric" value={form.stock} onChange={setNum('stock')} />
              </div>
              <div className="field">
                <label>SKU</label>
                <input className="input" value={form.sku} onChange={set('sku')} placeholder="OOHA-FRM-001" />
              </div>
              <div className="field">
                <label>Brand</label>
                <input className="input" value={form.brand} onChange={set('brand')} />
              </div>
              <div className="field">
                <label>Tags (comma separated)</label>
                <input className="input" value={form.tags} onChange={set('tags')} placeholder="personalized, photo-gift, couple" />
              </div>
            </div>

            <div className="price-preview">
              <div className="pp-item"><div className="pp-val">{inr(original || 0)}</div><div className="pp-lab">MRP</div></div>
              <div className="pp-item"><div className="pp-val">{inr(selling || 0)}</div><div className="pp-lab">Selling price</div></div>
              <div className="pp-item"><div className="pp-val">{inr(discAmount)}</div><div className="pp-lab">Discount ₹</div></div>
              <div className="pp-item"><div className="pp-val">{discPct}%</div><div className="pp-lab">Auto discount</div></div>
              <div className="pp-item"><div className="pp-val">{inr(selling * (Number(form.stock) || 0))}</div><div className="pp-lab">Stock value</div></div>
            </div>
          </div>

          {/* images */}
          <div className="form-section">
            <h3>Product images (max 8)</h3>
            <label className="dropzone">
              <div className="dz-icon"><ImagePlus size={30} /></div>
              <strong>Click to upload images</strong>
              <div className="small">JPG / PNG / SVG / WEBP · up to 8 files</div>
              <input type="file" accept="image/*" multiple hidden onChange={onFiles} />
            </label>

            {(existingImages.length > 0 || newPreviews.length > 0) && (
              <div className="previews">
                {existingImages.map((u, i) => (
                  <div className="preview-chip" key={`e${i}`}>
                    <img src={img(u)} alt="" />
                    <button
                      type="button"
                      onClick={() => setExistingImages((x) => x.filter((_, j) => j !== i))}
                      aria-label="Remove image"
                    >✕</button>
                  </div>
                ))}
                {newPreviews.map((u, i) => (
                  <div className="preview-chip" key={`n${i}`} style={{ outline: '2px solid var(--primary)' }}>
                    <img src={u} alt="" />
                    <button
                      type="button"
                      onClick={() => setNewFiles((x) => x.filter((_, j) => j !== i))}
                      aria-label="Remove new image"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* video */}
          <div className="form-section" style={{ marginBottom: 0 }}>
            <h3>Video URL (optional)</h3>
            <div className="field">
              <input className="input" value={form.video} onChange={set('video')} placeholder="https://…/reel.mp4 or /uploads/videos/clip.mp4" />
            </div>
          </div>
        </div>

        {/* right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-panel">
            <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Publish</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Toggle on={form.status} onChange={(v) => setForm({ ...form, status: v })} label="Active on store" sub="Hidden products don't appear anywhere" />
              <Toggle on={form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Featured" sub="Shows in Featured Gifts on homepage" />
              <Toggle on={form.bestseller} onChange={(v) => setForm({ ...form, bestseller: v })} label="Bestseller" sub="Shows the 🔥 bestseller badge" />
              <Toggle on={form.new_arrival} onChange={(v) => setForm({ ...form, new_arrival: v })} label="New arrival" sub="Shows the New badge" />
            </div>

            <button className="btn btn-primary full" style={{ marginTop: 18 }} onClick={() => submit(false)} disabled={busy}>
              {busy ? 'Saving…' : <><Save size={17} /> {editing ? 'Save changes' : 'Create product'}</>}
            </button>
            <Link to="/admin/products" className="btn btn-outline full" style={{ marginTop: 10 }}>Cancel</Link>
          </div>

          <div className="form-panel" style={{ background: 'var(--gold-soft)', borderColor: 'var(--gold)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 10 }}>💡 Tips</h3>
            <ul style={{ fontSize: '0.85rem', color: '#7a5209', display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.6 }}>
              <li>• Discount is calculated automatically: <strong>(MRP − selling) / MRP</strong>.</li>
              <li>• Set selling price above MRP to remove the discount badge.</li>
              <li>• Price changes appear on the storefront instantly after saving.</li>
              <li>• First image is the main thumbnail — order matters.</li>
              <li>• Add occasion + relationship tags to appear in themed collections.</li>
            </ul>
          </div>

          {editing && (
            <div className="form-panel" style={{ background: 'var(--primary-soft)' }}>
              <div className="small muted" style={{ lineHeight: 1.7 }}>
                <strong>Current view:</strong> {form.name}<br />
                <strong>Category:</strong> {catName || '—'}<br />
                <strong>Images:</strong> {existingImages.length + newFiles.length}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
