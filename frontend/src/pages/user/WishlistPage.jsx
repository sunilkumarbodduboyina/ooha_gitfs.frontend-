import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { api, img, inr } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumb, EmptyState, Reveal, Spinner } from '../../components/ui';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist, addToCart, refreshWishlist, requireAuth } = useShop();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    refreshWishlist();
    api.wishlist().then((d) => setItems(d.items)).catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const remove = async (pid) => {
    await toggleWishlist(pid);
    setItems((x) => (x || []).filter((i) => i.product_id !== pid));
  };

  const move = async (pid) => {
    const ok = await addToCart(pid, 1);
    if (ok) remove(pid);
  };

  if (loading || !items) return <Spinner label="Opening your wishlist…" />;

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
        <h1 className="page-title"><Heart size={26} color="var(--primary)" fill="var(--primary)" style={{ verticalAlign: '-3px' }} /> My Wishlist</h1>
        <p className="page-sub">{items.length} gift{items.length === 1 ? '' : 's'} saved for later</p>
      </div>

      {!items.length ? (
        <EmptyState
          icon="💝"
          title="Your wishlist is empty"
          text="Tap the ♥ on any product to save it here."
          action={<Link to="/products" className="btn btn-primary">Discover gifts</Link>}
        />
      ) : (
        <div className="product-grid" style={{ paddingBottom: 70 }}>
          {items.map((it, i) => (
            <Reveal key={it.product_id} delay={i * 0.05}>
              <div className="product-card">
                <Link to={`/product/${it.slug}`} className="pc-media">
                  <img src={img(it.image)} alt={it.name} loading="lazy" />
                  {Number(it.discount_percentage) > 0 && (
                    <div className="pc-badges"><span className="badge badge-off">{Math.round(it.discount_percentage)}% OFF</span></div>
                  )}
                </Link>
                <div className="pc-body">
                  <Link to={`/product/${it.slug}`} className="pc-name">{it.name}</Link>
                  <div className="pc-price">
                    <span className="price-now">{inr(it.selling_price)}</span>
                    <span className="price-was">{inr(it.original_price)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => move(it.product_id)}>
                      <ShoppingBag size={14} /> Move to cart
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => remove(it.product_id)} aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
