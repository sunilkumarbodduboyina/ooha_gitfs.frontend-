import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Phone, Mail, MapPin, MessageCircle, Heart } from 'lucide-react';
import { api } from '../services/api';

const FALLBACK = {
  tagline: 'Making every moment meaningful.',
  phone: '+91 98765 43210',
  email: 'hello@oohagifts.com',
  address: 'Ooha Studio, 42 Rose Arcade, Pune, Maharashtra 411001',
  instagram: 'https://instagram.com/oohagifts',
  facebook: 'https://facebook.com/oohagifts',
};

export default function Footer() {
  const [s, setS] = useState(FALLBACK);
  const [wa, setWa] = useState(null);

  useEffect(() => {
    api.settings()
      .then((d) => { if (d.settings) setS({ ...FALLBACK, ...d.settings }); if (d.whatsapp) setWa(d.whatsapp); })
      .catch(() => {});
  }, []);

  const waHref = `https://wa.me/${wa?.phone || '919885927554'}?text=${encodeURIComponent(wa?.default_message || 'Hi Ooha Gifts, I would like to know more about your gifts.')}`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="brand">OOHA <em>GIFTS</em></div>
            <p style={{ fontSize: '0.95rem', maxWidth: 300 }}>{s.tagline}</p>
            <p style={{ fontSize: '0.88rem', marginTop: 14, opacity: 0.8 }}>
              Personalised gifts, romantic hampers and keepsakes crafted for every relationship — delivered across India.
            </p>
            <div className="social-row" style={{ marginTop: 20 }}>
              <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
              <a href={s.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
            </div>
          </div>

          <div>
            <h4>Customer Care</h4>
            <Link to="/#contact">Contact Us</Link>
            <Link to="/contact">FAQs</Link>
            <Link to="/contact">Shipping</Link>
            <Link to="/contact">Returns</Link>
            <Link to="/contact">Cancellation</Link>
          </div>

          <div>
            <h4>Company</h4>
            <Link to="/#about">About Us</Link>
            <Link to="/about">Careers</Link>
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms &amp; Conditions</Link>
            <Link to="/admin/login">Admin</Link>
          </div>

          <div>
            <h4>Categories</h4>
            <Link to="/occasion/birthday">Birthday</Link>
            <Link to="/occasion/anniversary">Anniversary</Link>
            <Link to="/gifts/love">Love</Link>
            <Link to="/category/customized-name-gifts">Personalized</Link>
            <Link to="/collection/corporate">Corporate</Link>
          </div>

          <div>
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li><Phone size={16} color="#d9a441" /> <a href={`tel:${s.phone}`}>{s.phone}</a></li>
              <li><Mail size={16} color="#d9a441" /> <a href={`mailto:${s.email}`}>{s.email}</a></li>
              <li><MessageCircle size={16} color="#d9a441" /> <a href={waHref} target="_blank" rel="noreferrer">WhatsApp us</a></li>
              <li><MapPin size={16} color="#d9a441" /> <span>{s.address}</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ooha Gifts. All rights reserved.</span>
          <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            Made with <Heart size={14} color="#d9628a" fill="#d9628a" /> in India · UPI · Visa · Mastercard · RuPay
          </span>
        </div>
      </div>
    </footer>
  );
}
