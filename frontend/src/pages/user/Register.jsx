import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Phone, User, UserPlus, Heart, Gift, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm_password: '',
  });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error('Please enter your full name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return toast.error('Please enter a valid email');
    if (form.phone && !/^[0-9+\-\s]{8,15}$/.test(form.phone)) return toast.error('Please enter a valid mobile number');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm_password) return toast.error('Passwords do not match');

    setBusy(true);
    try {
      const d = await register(form);
      toast.success(d.message || 'Welcome to Ooha Gifts! 🎁');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-art" style={{ background: 'linear-gradient(135deg, #4a1128 0%, #7d2141 55%, #b23a5e 100%)' }}>
        <motion.h2 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          Join the Ooha family 💝
        </motion.h2>
        <p>Create your account and unlock a warmer way to gift.</p>
        <ul className="auth-points">
          <li><span className="tick"><Heart size={16} /></span> Save wishlists &amp; get restock alerts</li>
          <li><span className="tick"><Truck size={16} /></span> Live order tracking on every purchase</li>
          <li><span className="tick"><Gift size={16} /></span> Members-only offers &amp; early access</li>
        </ul>
      </div>

      <div className="auth-form">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1>Create account</h1>
          <p className="sub">It takes less than a minute.</p>

          <form className="auth-fields" onSubmit={submit}>
            <div className="field">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={17} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                <input className="input" style={{ paddingLeft: 44 }} placeholder="Aarav Sharma" value={form.name} onChange={set('name')} autoComplete="name" />
              </div>
            </div>

            <div className="field">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                <input className="input" style={{ paddingLeft: 44 }} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
            </div>

            <div className="field">
              <label>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={17} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                <input className="input" style={{ paddingLeft: 44 }} type="tel" placeholder="9812345678" value={form.phone} onChange={set('phone')} autoComplete="tel" />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                <input className="input" style={{ paddingLeft: 44, paddingRight: 46 }} type={show ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />
                <button type="button" onClick={() => setShow((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} aria-label="Toggle password visibility">
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                <input className="input" style={{ paddingLeft: 44 }} type={show ? 'text' : 'password'} placeholder="Repeat password" value={form.confirm_password} onChange={set('confirm_password')} autoComplete="new-password" />
              </div>
            </div>

            <button className="btn btn-primary btn-lg full" disabled={busy}>
              {busy ? 'Creating account…' : <><UserPlus size={18} /> Create account</>}
            </button>
          </form>

          <div className="auth-hint">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
