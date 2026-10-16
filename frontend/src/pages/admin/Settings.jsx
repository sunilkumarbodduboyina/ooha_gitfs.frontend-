import { useEffect, useState } from 'react';
import { Save, Globe, MessageCircle, Eye, EyeOff, Store, Phone, Mail, MapPin, Instagram, Facebook, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/ui';

const SITE_DEFAULTS = {
  store_name: 'OOHA GIFTS',
  tagline: 'Making every moment meaningful.',
  phone: '+91 98765 43210',
  email: 'hello@oohagifts.com',
  address: 'Ooha Studio, 42 Rose Arcade, Pune, Maharashtra 411001',
  instagram: 'https://instagram.com/oohagifts',
  facebook: 'https://facebook.com/oohagifts',
};

const WA_DEFAULTS = { phone: '919885927554', default_message: 'Hi Ooha Gifts, I would like to know more about your gifts.', enabled: 1 };

export default function Settings({ tab = 'website' }) {
  const toast = useToast();
  const isWa = tab === 'whatsapp';
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [site, setSite] = useState(SITE_DEFAULTS);
  const [wa, setWa] = useState(WA_DEFAULTS);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    api.settings()
      .then((d) => {
        if (d.settings) setSite({ ...SITE_DEFAULTS, ...d.settings });
        if (d.whatsapp) setWa({ ...WA_DEFAULTS, ...d.whatsapp });
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSite = async () => {
    setBusy(true);
    try {
      await api.saveSettings(site);
      toast.success('Website settings saved — live on the storefront ✨');
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const saveWa = async () => {
    if (!wa.phone.trim()) return toast.error('WhatsApp number is required');
    setBusy(true);
    try {
      await api.saveWhatsApp({ ...wa, enabled: Number(wa.enabled) ? 1 : 0 });
      toast.success('WhatsApp settings saved 💬');
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  if (loading) return <Spinner label="Loading settings…" />;

  const waDigits = String(wa.phone).replace(/\D/g, '');
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(wa.default_message)}`;

  if (isWa) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22, alignItems: 'start' }}>
        <div className="form-panel">
          <div className="form-section">
            <h3><span><MessageCircle size={17} color="#25D366" style={{ verticalAlign: -3 }} /> WhatsApp configuration</span></h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>WhatsApp number (with country code)</label>
                <input
                  className="input"
                  value={wa.phone}
                  onChange={(e) => setWa({ ...wa, phone: e.target.value })}
                  placeholder="919885927554"
                  inputMode="tel"
                />
                <div className="small muted" style={{ marginTop: 6 }}>
                  Digits only, country code first — e.g. <strong>91</strong> for India. Currently: {waDigits || '—'}
                </div>
              </div>

              <div className="field">
                <label>Default message</label>
                <textarea
                  className="input"
                  rows={4}
                  value={wa.default_message}
                  onChange={(e) => setWa({ ...wa, default_message: e.target.value })}
                  placeholder="Hello Ooha Gifts, I would like to know more about your gifts."
                />
                <div className="small muted" style={{ marginTop: 6 }}>
                  Product enquiries automatically append the product name, price and link.
                </div>
              </div>

              <div className="switch-row">
                <div>
                  <div className="sr-text">Show floating WhatsApp button</div>
                  <div className="sr-sub">The green chat bubble on every page</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={Boolean(Number(wa.enabled))}
                    onChange={(e) => setWa({ ...wa, enabled: e.target.checked ? 1 : 0 })}
                  />
                  <span className="track" />
                </label>
              </div>

              <button className="btn btn-primary" onClick={saveWa} disabled={busy} style={{ alignSelf: 'flex-start' }}>
                {busy ? 'Saving…' : <><Save size={17} /> Save WhatsApp settings</>}
              </button>
            </div>
          </div>
        </div>

        <div className="form-panel" style={{ position: 'sticky', top: 90 }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Live preview</h3>
          <div style={{ background: '#e7ffd9', borderRadius: 14, padding: 16, fontSize: '0.88rem', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#25D366', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800 }}>O</span>
              <div>
                <strong style={{ display: 'block' }}>Ooha Gifts</strong>
                <span style={{ color: '#5b6b52' }}>online</span>
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: '0 10px 10px 10px', padding: '10px 12px', color: '#2b3a26' }}>
              {wa.default_message || '—'}
            </div>
          </div>
          <a className="btn btn-outline full" style={{ marginTop: 16 }} href={waHref} target="_blank" rel="noreferrer">
            <Eye size={15} /> Test the link
          </a>
          {!Number(wa.enabled) && (
            <p className="small" style={{ color: '#b45309', marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              <EyeOff size={14} /> The button is currently HIDDEN on the storefront.
            </p>
          )}
        </div>
      </div>
    );
  }

  const FIELDS = [
    { key: 'store_name', label: 'Store name', icon: Store, placeholder: 'OOHA GIFTS' },
    { key: 'tagline', label: 'Tagline (footer)', icon: Sparkles, placeholder: 'Making every moment meaningful.' },
    { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+91 98765 43210' },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'hello@oohagifts.com' },
    { key: 'address', label: 'Studio address', icon: MapPin, placeholder: 'Pune, Maharashtra' },
    { key: 'instagram', label: 'Instagram URL', icon: Instagram, placeholder: 'https://instagram.com/oohagifts' },
    { key: 'facebook', label: 'Facebook URL', icon: Facebook, placeholder: 'https://facebook.com/oohagifts' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 22, alignItems: 'start' }}>
      <div className="form-panel">
        <div className="form-section">
          <h3><span><Globe size={17} color="var(--primary)" style={{ verticalAlign: -3 }} /> Store identity &amp; contact</span></h3>
          <div className="form-grid-2">
            {FIELDS.map(({ key, label, placeholder }) => (
              <div className={`field ${key === 'address' || key === 'tagline' ? 'span-2' : ''}`} key={key}>
                <label>{label}</label>
                <input
                  className="input"
                  value={site[key] || ''}
                  placeholder={placeholder}
                  onChange={(e) => setSite({ ...site, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section" style={{ marginBottom: 0 }}>
          <h3>Note</h3>
          <p className="small muted" style={{ lineHeight: 1.8 }}>
            These values power the footer, contact page and WhatsApp button across the storefront.
            Save and the changes appear instantly — no rebuild needed. Secrets like Razorpay keys
            and the JWT secret live only in the backend <code>.env</code> and are never editable here.
          </p>
        </div>

        <button className="btn btn-primary" onClick={saveSite} disabled={busy} style={{ marginTop: 4 }}>
          {busy ? 'Saving…' : <><Save size={17} /> Save website settings</>}
        </button>
      </div>

      <div className="form-panel" style={{ position: 'sticky', top: 90, background: 'var(--gold-soft)', borderColor: 'var(--gold)' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>📍 Where this shows</h3>
        <ul style={{ fontSize: '0.86rem', color: '#7a5209', display: 'flex', flexDirection: 'column', gap: 10, lineHeight: 1.6 }}>
          <li>• <strong>Tagline</strong> — footer hero text</li>
          <li>• <strong>Phone / Email / Address</strong> — footer + contact page tiles</li>
          <li>• <strong>Instagram / Facebook</strong> — footer social icons</li>
          <li>• <strong>WhatsApp</strong> — configured in the <em>WhatsApp Settings</em> section</li>
        </ul>
      </div>
    </div>
  );
}
