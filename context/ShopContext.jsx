import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ShopCtx = createContext(null);

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState([]);
  const authed = Boolean(user && user.role !== 'admin');

  const refreshCart = useCallback(async () => {
    if (!authed) { setCart([]); setCartCount(0); return; }
    try {
      const d = await api.cart();
      setCart(d.items);
      setCartCount(d.items.reduce((s, i) => s + i.quantity, 0));
    } catch { /* ignore */ }
  }, [authed]);

  const refreshWishlist = useCallback(async () => {
    if (!authed) { setWishlistIds([]); return; }
    try {
      const d = await api.wishlist();
      setWishlistIds(d.product_ids);
    } catch { /* ignore */ }
  }, [authed]);

  useEffect(() => { refreshCart(); refreshWishlist(); }, [refreshCart, refreshWishlist]);

  const requireAuth = useCallback(() => {
    if (authed) return true;
    toast.error('Please login to continue');
    window.location.href = '/login';
    return false;
  }, [authed, toast]);

  const addToCart = useCallback(async (product_id, quantity = 1) => {
    if (!requireAuth()) return false;
    try {
      const d = await api.addToCart(product_id, quantity);
      setCartCount(d.cart_count);
      await refreshCart();
      toast.success(d.message || 'Added to cart 🎁');
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  }, [requireAuth, refreshCart, toast]);

  const updateQty = useCallback(async (id, quantity) => {
    try {
      await api.updateCart(id, quantity);
      await refreshCart();
    } catch (e) { toast.error(e.message); }
  }, [refreshCart, toast]);

  const removeFromCart = useCallback(async (id) => {
    try {
      await api.removeCart(id);
      await refreshCart();
      toast.success('Removed from cart');
    } catch (e) { toast.error(e.message); }
  }, [refreshCart, toast]);

  const toggleWishlist = useCallback(async (product_id) => {
    if (!requireAuth()) return false;
    try {
      const d = await api.toggleWishlist(product_id);
      setWishlistIds((ids) => (d.wished ? [...ids, product_id] : ids.filter((x) => x !== product_id)));
      toast.success(d.message);
      return d.wished;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  }, [requireAuth, toast]);

  const moveToCart = useCallback(async (product_id) => {
    const ok = await addToCart(product_id, 1);
    if (ok) { await toggleWishlist(product_id); }
  }, [addToCart, toggleWishlist]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + Number(i.selling_price) * i.quantity, 0);
    const mrp = cart.reduce((s, i) => s + Number(i.original_price) * i.quantity, 0);
    return { subtotal, mrp, savings: mrp - subtotal };
  }, [cart]);

  const value = useMemo(
    () => ({
      cart, cartCount, totals, wishlistIds,
      addToCart, updateQty, removeFromCart,
      toggleWishlist, moveToCart, refreshCart, refreshWishlist, requireAuth, authed,
    }),
    [cart, cartCount, totals, wishlistIds, addToCart, updateQty, removeFromCart, toggleWishlist, moveToCart, refreshCart, refreshWishlist, requireAuth, authed]
  );

  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}

export function useShop() {
  return useContext(ShopCtx);
}
