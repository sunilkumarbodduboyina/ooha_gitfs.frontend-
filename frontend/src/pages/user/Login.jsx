import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AtSign, Eye, EyeOff, KeyRound, LogIn, Gift, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { login, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/orders', { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim() || !form.password) { toast.error('Enter your email/mobile and password'); return; }
    setBusy(true);
    try {
      const d = await login(form.identifier.trim(), form.password);
      toast.success(`Welcome back, ${d.user.name}! 🎁`);
      navigate(d.user.role === 'admin' ? '/admin' : '/orders', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <motion.h2 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          Your gifting story continues…
        </motion.h2>
        <p>Login to track orders, save wishlists and checkout faster.</p>
        <ul className="auth-points">
          <li><span className="tick"><Gift size={16} /></span> Track every order in real time</li>
          <li><span className="tick"><Sparkles size={16} /></span> Wishlist that syncs across devices</li>
          <li><span className="tick"><ShieldCheck size={16} /></span> JWT-secured, bcrypt-protected login</li>
        </ul>
      </div>

      <div className="auth-form">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1>Welcome back</h1>
          <p className="sub">Login with your email or mobile number.</p>

          <form className="auth-fields" onSubmit={submit}>
            <div className="field">
              <label>Email or Mobile</label>
              <div style={{ position: 'relative' }}>
                <AtSign size={17} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 44 }}
                  placeholder="you@example.com or 9812345678"
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
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
              {busy ? 'Signing in…' : <><LogIn size={18} /> Login</>}
            </button>
          </form>

          <div className="auth-hint">
            New to Ooha Gifts? <Link to="/register">Create an account</Link>
          </div>
          <div className="demo-chip">
            Demo customer → <strong>demo@oohagifts.com</strong> / <strong>demo123</strong><br />
            Admin → <strong>admin@oohagifts.com</strong> / <strong>admin123</strong>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
