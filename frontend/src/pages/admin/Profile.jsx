import { useEffect, useState } from 'react';
import { User, Lock, Save, ShieldCheck, Mail, Phone, BadgeCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [busyP, setBusyP] = useState(false);
  const [busyW, setBusyW] = useState(false);

  useEffect(() => {
    api.me()
      .then((d) => setProfile({ name: d.user?.name || '', phone: d.user?.phone || '' }))
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async () => {
    if (!profile.name.trim() || profile.name.trim().length < 2) return toast.error('Please enter your name');
    setBusyP(true);
    try {
      const d = await api.updateProfile(profile);
      const next = { ...user, ...d.user };
      localStorage.setItem('ooha_user', JSON.stringify(next));
      setUser(next);
      toast.success('Profile updated ✨');
    } catch (e) { toast.error(e.message); } finally { setBusyP(false); }
  };

  const savePassword = async () => {
    if (!pw.current_password) return toast.error('Enter your current password');
    if (!pw.new_password || pw.new_password.length < 6) return toast.error('New password must be at least 6 characters');
    if (pw.new_password !== pw.confirm) return toast.error('Passwords do not match');
    setBusyW(true);
    try {
      const d = await api.changePassword({ current_password: pw.current_password, new_password: pw.new_password });
      toast.success(d.message || 'Password changed 🔒');
      setPw({ current_password: '', new_password: '', confirm: '' });
    } catch (e) { toast.error(e.message); } finally { setBusyW(false); }
  };

  if (loading) return <Spinner label="Loading profile…" />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
      {/* identity card */}
      <div className="form-panel" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ width: 74, height: 74, borderRadius: '50%', background: 'rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center', fontSize: '1.9rem', fontFamily: 'var(--font-head)', fontWeight: 800 }}>
            {String(user?.name || 'A').charAt(0).toUpperCase()}
          </span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {user?.name}
              <span className="status-chip st-delivered" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <ShieldCheck size={13} /> {user?.role || 'admin'}
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.92rem', marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span><Mail size={14} style={{ verticalAlign: -2 }} /> {user?.email}</span>
              {user?.phone && <span><Phone size={14} style={{ verticalAlign: -2 }} /> {user.phone}</span>}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
            <BadgeCheck size={26} style={{ marginBottom: 4 }} /><br />
            JWT session active
          </div>
        </div>
      </div>

      {/* profile form */}
      <div className="form-panel">
        <div className="form-section">
          <h3><span><User size={17} color="var(--primary)" style={{ verticalAlign: -3 }} /> Account details</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label>Full name</label>
              <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="field">
              <label>Email (login ID)</label>
              <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.65, cursor: 'not-allowed' }} />
              <div className="small muted" style={{ marginTop: 6 }}>Email is your permanent login ID and cannot be changed.</div>
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" inputMode="tel" />
            </div>
            <button className="btn btn-primary" onClick={saveProfile} disabled={busyP} style={{ alignSelf: 'flex-start' }}>
              {busyP ? 'Saving…' : <><Save size={17} /> Save profile</>}
            </button>
          </div>
        </div>
      </div>

      {/* password form */}
      <div className="form-panel">
        <div className="form-section" style={{ marginBottom: 0 }}>
          <h3><span><Lock size={17} color="var(--primary)" style={{ verticalAlign: -3 }} /> Change password</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label>Current password</label>
              <input className="input" type="password" autoComplete="current-password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="field">
              <label>New password</label>
              <input className="input" type="password" autoComplete="new-password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} placeholder="min. 6 characters" />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input className="input" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="repeat new password" />
            </div>
            <button className="btn btn-outline" onClick={savePassword} disabled={busyW} style={{ alignSelf: 'flex-start' }}>
              {busyW ? 'Updating…' : <><Lock size={16} /> Update password</>}
            </button>
          </div>
        </div>
      </div>

      <p className="small muted" style={{ gridColumn: '1 / -1' }}>
        Passwords are hashed with bcrypt (10 rounds) — plain text never touches the database.
      </p>
    </div>
  );
}
