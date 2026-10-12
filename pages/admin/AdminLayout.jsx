import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusSquare, FolderTree, Layers, ShoppingCart,
  Users, Star, Image, Video, BadgePercent, CreditCard, MessageCircle,
  Settings, UserCircle, LogOut, Menu, X, Bell, BarChart3,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/ui';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { section: 'Catalogue' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/products/new', icon: PlusSquare, label: 'Add Product' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/collections', icon: Layers, label: 'Collections' },
  { section: 'Sales' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { section: 'Content' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/videos', icon: Video, label: 'Videos' },
  { to: '/admin/offers', icon: BadgePercent, label: 'Offers' },
  { section: 'Store' },
  { to: '/admin/settings', icon: Settings, label: 'Website Settings' },
  { to: '/admin/whatsapp', icon: MessageCircle, label: 'WhatsApp Settings' },
  { to: '/admin/profile', icon: UserCircle, label: 'Admin Profile' },
];

const TITLES = {
  '/admin': 'Dashboard', '/admin/products': 'Products', '/admin/products/new': 'Add Product',
  '/admin/categories': 'Categories', '/admin/collections': 'Collections', '/admin/orders': 'Orders',
  '/admin/customers': 'Customers', '/admin/reviews': 'Reviews', '/admin/banners': 'Banners',
  '/admin/reports': 'Reports & Analytics',
  '/admin/videos': 'Videos', '/admin/offers': 'Offers & Coupons', '/admin/payments': 'Payments',
  '/admin/settings': 'Website Settings', '/admin/whatsapp': 'WhatsApp Settings',
  '/admin/profile': 'Admin Profile',
};

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.dashboard().then((d) => setStats(d.stats)).catch(() => {});
    }
  }, [user]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (loading) return <Spinner label="Verifying admin session…" />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;

  const title = TITLES[location.pathname] || (location.pathname.startsWith('/admin/orders') ? 'Order Details'
    : location.pathname.startsWith('/admin/products/') ? 'Edit Product' : 'Admin');
  const pending = stats?.pending_reviews;
  const pendingOrders = stats?.pending_orders;

  const onLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-side ${open ? 'open' : ''}`}>
        <Link to="/" className="brand">OOHA <em>GIFTS</em></Link>
        <nav className="as-nav">
          {NAV.map((n, i) => n.section ? (
            <div className="as-label" key={`s${i}`}>{n.section}</div>
          ) : (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `as-link ${isActive ? 'active' : ''}`}
            >
              <n.icon size={17} />
              {n.label}
              {n.to === '/admin/orders' && pendingOrders > 0 && <span className="badge-dot">{pendingOrders}</span>}
              {n.to === '/admin/reviews' && pending > 0 && <span className="badge-dot">{pending}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="as-foot">
          <button className="as-link" style={{ width: '100%' }} onClick={onLogout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-backdrop" style={{ zIndex: 110 }} onClick={() => setOpen(false)} />}

      <div className="admin-main">
        <div className="admin-top">
          <button className="icon-btn admin-burger" onClick={() => setOpen(true)} aria-label="Open menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1>{title}</h1>
          <span className="spacer" />
          <Link to="/" className="btn btn-outline btn-sm" target="_blank">View store</Link>
          <button className="icon-btn" aria-label="Notifications">
            <Bell size={19} />
            {pending > 0 && <span className="cart-count">{pending}</span>}
          </button>
          <div className="admin-avatar" title={user.name}>{String(user.name || 'A').charAt(0).toUpperCase()}</div>
        </div>
        <div className="admin-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
