import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ShopProvider } from '../context/ShopContext';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminLogin from '../pages/admin/AdminLogin';

// Main App component with routing and context providers
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ShopProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="/*" element={<UserLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ShopProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
