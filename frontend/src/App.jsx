import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import { Spinner } from './components/ui';

const Home = lazy(() => import('./pages/user/Home'));
const ProductsPage = lazy(() => import('./pages/user/ProductsPage'));
const CollectionPage = lazy(() => import('./pages/user/CollectionPage'));
const GiftPage = lazy(() => import('./pages/user/GiftPage'));
const OccasionsPage = lazy(() => import('./pages/user/OccasionsPage'));
const RelationshipsPage = lazy(() => import('./pages/user/RelationshipsPage'));
const ProductDetail = lazy(() => import('./pages/user/ProductDetail'));
const SearchPage = lazy(() => import('./pages/user/SearchPage'));
const CartPage = lazy(() => import('./pages/user/CartPage'));
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'));
const Login = lazy(() => import('./pages/user/Login'));
const Register = lazy(() => import('./pages/user/Register'));
const OrdersPage = lazy(() => import('./pages/user/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/user/OrderDetailPage'));
const WishlistPage = lazy(() => import('./pages/user/WishlistPage'));
const AboutPage = lazy(() => import('./pages/user/AboutPage'));
const ContactPage = lazy(() => import('./pages/user/ContactPage'));
const OffersPage = lazy(() => import('./pages/user/OffersPage'));
const NotFound = lazy(() => import('./pages/user/NotFound'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminCollections = lazy(() => import('./pages/admin/Collections'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminBanners = lazy(() => import('./pages/admin/Banners'));
const AdminVideos = lazy(() => import('./pages/admin/Videos'));
const AdminOffers = lazy(() => import('./pages/admin/Offers'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/gifts/:slug" element={<GiftPage />} />
            {/* Legacy link: the storefront's "Love" page lives at /gifts/love */}
            <Route path="/collection/love" element={<Navigate to="/gifts/love" replace />} />
            <Route path="/category/:slug" element={<CollectionPage />} />
            <Route path="/collection/:slug" element={<CollectionPage />} />
            <Route path="/occasion/:slug" element={<CollectionPage />} />
            <Route path="/relationship/:slug" element={<CollectionPage />} />
            <Route path="/occasions" element={<OccasionsPage />} />
            <Route path="/relationships" element={<RelationshipsPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="whatsapp" element={<AdminSettings tab="whatsapp" />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
