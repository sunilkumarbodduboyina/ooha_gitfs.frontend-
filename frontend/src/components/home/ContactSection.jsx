import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Reveal, SectionHead } from '../ui';

/** Homepage "Contact Us" section — tiles + WhatsApp message form. */
export default function ContactSection({ settings = {}, whatsapp = null }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const phone = whatsapp?.phone || '919885927554';

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) { toast.error('Please add your name and message'); return; }
    const text = `Hello Ooha Gifts! 👋\n\nName: ${form.name}\nEmail: ${form.email || '—'}\n\n${form.message}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    toast.success('Opening WhatsApp — we usually reply within minutes!');
  };

  const tiles = [
    { icon: Phone, title: 'Call us', value: settings.phone || '+91 98765 43210', href: `tel:${(settings.phone || '+919876543210').replace(/\s/g, '')}` },
    { icon: Mail, title: 'Email', value: settings.email || 'hello@oohagifts.com', href: `mailto:${settings.email || 'hello@oohagifts.com'}` },
    { icon: MessageCircle, title: 'WhatsApp', value: `+${phone}`, href: `https://wa.me/${phone}` },
    { icon: MapPin, title: 'Studio', value: settings.address || 'Pune, Maharashtra' },
  ];

  return (
    <section className="section" id="contact">
      <div className="container">
        <SectionHead
          eyebrow="We're here to help"
          title="Contact Us"
          sub="Questions about an order, a custom gift or bulk corporate gifting? Reach out."
        />
        <div className="contact-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tiles.map(({ icon: Icon, title, value, href }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="contact-tile">
                  <div className="ct-icon"><Icon size={22} /></div>
                  <div>
                    <strong>{title}</strong>
                    <div className="muted small" style={{ marginTop: 3 }}>
                      {href ? <a href={href} style={{ color: 'var(--primary)' }}>{value}</a> : value}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}

            <div className="contact-tile" style={{ background: 'var(--gold-soft)', borderColor: 'var(--gold)' }}>
              <div className="ct-icon" style={{ background: '#fff' }}>⏳</div>
              <div>
                <strong>Support hours</strong>
                <div className="muted small">Mon–Sat, 10 AM – 8 PM IST · We reply on WhatsApp much faster!</div>
              </div>
            </div>
          </div>

          <Reveal delay={0.1}>
            <form className="checkout-card" onSubmit={submit} style={{ margin: 0 }}>
              <h3><span className="step-num"><Send size={15} /></span> Send us a message</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Your name</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aarav Sharma" />
                </div>
                <div className="field">
                  <label>Email (optional)</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div className="field span-2">
                  <label>Message</label>
                  <textarea className="input" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Hi! I need 40 corporate hampers for Diwali…" />
                </div>
              </div>
              <button className="btn btn-primary full" style={{ marginTop: 16 }} type="submit">
                <MessageCircle size={17} /> Send on WhatsApp
              </button>
              <p className="small muted" style={{ marginTop: 10, textAlign: 'center' }}>
                Your message opens in WhatsApp so we can reply instantly — no waiting on email.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
