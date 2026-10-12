import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, KeyRound, Lock, Mail, LogIn, ShieldCheck, Package, Star } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) { toast.error('Enter admin email and password'); return; }
    setBusy(true);
    try {
      const d = await api.adminLogin({ email: form.email.trim(), password: form.password });
      /* Backend answers with `admin` and the DB role may be 'superadmin';
         normalise to the same shape /auth/me returns (role 'admin') so every
         role guard accepts the session. */
      const u = { ...(d.user || d.admin), role: 'admin' };
      localStorage.setItem('ooha_token', d.token);
      localStorage.setItem('ooha_user', JSON.stringify(u));
      setUser(u);
      toast.success(`Welcome, ${u.name} 👑`);
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="al-art">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 2 }}>
          <div className="brand" style={{ color: '#fff', marginBottom: 26 }}>
            <span>OOHA <em style={{ color: '#ffd9a0' }}>GIFTS</em></span>
            <span className="brand-sub" style={{ color: 'rgba(255,255,255,0.75)' }}>admin panel</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontStyle: 'italic' }}>
            Run your store.<br />Delight your customers.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', marginTop: 16, maxWidth: 420 }}>
            Manage products, orders, banners, videos, coupons and every setting of the Ooha Gifts storefront — all in one place.
          </p>
          <ul className="auth-points">
            <li><span className="tick"><Package size={16} /></span> 46 products · live inventory &amp; pricing</li>
            <li><span className="tick"><Star size={16} /></span> Approve or hide customer reviews</li>
            <li><span className="tick"><ShieldCheck size={16} /></span> Role-protected JWT admin session</li>
          </ul>
        </motion.div>
      </div>

      <div className="al-form">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1>Admin login</h1>
          <p className="sub">Restricted area — authorised staff only.</p>

          <form className="auth-fields" onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 44 }}
                  type="email"
                  placeholder="admin@oohagifts.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={17} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 44, paddingRight: 46 }}
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-lg full" disabled={busy}>
              {busy ? 'Signing in…' : <><LogIn size={18} /> Login to dashboard</>}
            </button>
          </form>

          <div className="demo-chip">
            <Lock size={12} style={{ verticalAlign: -2 }} /> Demo admin → <strong>admin@oohagifts.com</strong> / <strong>admin123</strong>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
