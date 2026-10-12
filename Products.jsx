import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Copy, Plus, Search, PackageSearch } from 'lucide-react';
import { api, img, inr } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [term, setTerm] = useState('');
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    api.products({ limit: 200 })
      .then((d) => setProducts(d.products))
      .catch((e) => { toast.error(e.message); setProducts([]); });
  };
  useEffect(load, []);

  const remove = async (p) => {
    try {
      await api.deleteProduct(p.id);
      toast.success(`"${p.name}" deleted — removed from the store`);
      setProducts((x) => x.filter((y) => y.id !== p.id));
    } catch (e) { toast.error(e.message); } finally { setConfirm(null); }
  };

  const duplicate = async (p) => {
    try {
      await api.duplicateProduct(p.id);
      toast.success('Product duplicated');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const shown = (products || []).filter((p) =>
    `${p.name} ${p.sku || ''} ${p.category_name || ''}`.toLowerCase().includes(term.toLowerCase())
  );

  if (!products) return <Spinner label="Loading products…" />;

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search products…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <span className="small muted">{shown.length} of {products.length} products</span>
        <span className="spacer" />
        <Link to="/admin/products/new" className="btn btn-primary btn-sm"><Plus size={15} /> Add product</Link>
      </div>

      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr>
              <th>Product</th><th>Category</th><th>Price</th><th>Stock</th>
              <th>Rating</th><th>Status</th><th style={{ width: 250 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img className="thumb" src={img(p.image)} alt="" />
                    <div>
                      <div className="td-name">{p.name}</div>
                      <div className="td-sub">{p.sku || `#${p.id}`}{p.bestseller ? ' · 🔥 bestseller' : ''}</div>
                    </div>
                  </div>
                </td>
                <td>{p.category_name || '—'}</td>
                <td>
                  <div className="td-name">{inr(p.selling_price)}</div>
                  {Number(p.original_price) > Number(p.selling_price) && (
                    <div className="td-sub" style={{ textDecoration: 'line-through' }}>{inr(p.original_price)}</div>
                  )}
                </td>
                <td>
                  <span className={`status-chip ${Number(p.stock) <= 0 ? 'st-cancelled' : Number(p.stock) <= 10 ? 'st-pending' : 'st-delivered'}`}>
                    {p.stock} pcs
                  </span>
                </td>
                <td>{Number(p.rating || 0).toFixed(1)} ★</td>
                <td>
                  <span className={`status-chip ${Number(p.status) ? 'st-delivered' : 'st-cancelled'}`}>
                    {Number(p.status) ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <Link to={`/product/${p.slug || p.id}`} target="_blank" className="go" title="View on store"><Eye size={13} /> View</Link>
                    <Link to={`/admin/products/${p.id}/edit`} title="Edit"><Pencil size={13} /> Edit</Link>
                    <button onClick={() => duplicate(p)} title="Duplicate"><Copy size={13} /> Copy</button>
                    <button className="danger" onClick={() => setConfirm(p)} title="Delete"><Trash2 size={13} /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  <PackageSearch size={30} color="var(--ink-3)" style={{ margin: '0 auto 8px' }} />
                  <div className="muted">No products match “{term}”.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="modal" style={{ padding: 32, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem' }}>Delete this product?</h3>
            <p className="muted" style={{ margin: '12px 0 22px' }}>
              <strong>{confirm.name}</strong> will be permanently removed from the storefront.
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline full" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn full" style={{ background: '#dc2626', color: '#fff' }} onClick={() => remove(confirm)}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
