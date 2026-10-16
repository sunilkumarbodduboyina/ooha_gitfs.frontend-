import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Reveal } from './ui';

/** Simple full-width promotional banner used between homepage sections. */
export default function PromoBanner({
  eyebrow = 'Festive edit',
  title = 'Gifts made with love, delivered across India',
  text = 'Personalized keepsakes, romantic hampers and premium corporate gifting — all in one place.',
  cta = 'Shop Now',
  to = '/products',
}) {
  return (
    <section className="section tight">
      <div className="container">
        <Reveal>
          <div className="promo-banner">
            <div>
              <span className="eyebrow" style={{ color: 'var(--gold)' }}><Sparkles size={14} /> {eyebrow}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
            <Link to={to} className="btn btn-gold btn-lg">{cta} <ArrowRight size={18} /></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
