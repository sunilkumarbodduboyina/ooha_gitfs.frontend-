import { Link } from 'react-router-dom';
import { Ticket, Copy, Tag, ArrowRight } from 'lucide-react';
import { inr } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Reveal, SectionHead } from '../ui';

/** Homepage "Offers & Coupons" section — same cards as the Offers page. */
export default function OffersSection({ coupons = [] }) {
  const toast = useToast();

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Coupon ${code} copied!`);
    } catch {
      toast.error('Could not copy — code: ' + code);
    }
  };

  return (
    <section
      className="section"
      id="offers"
      style={{ background: 'linear-gradient(180deg, #fff 0%, var(--gold-soft) 100%)' }}
    >
      <div className="container">
        <SectionHead
          eyebrow="Save more"
          title="Offers & Coupons"
          sub="Apply any of these codes at checkout and watch the total drop."
          action={
            <Link to="/offers" className="btn btn-outline btn-sm">
              All offers <ArrowRight size={15} />
            </Link>
          }
        />
        {coupons.length ? (
          <div className="grid-3">
            {coupons.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.07}>
                <div
                  className="contact-tile"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-soft), var(--gold-soft))',
                    borderStyle: 'dashed',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    textAlign: 'center',
                  }}
                >
                  <div className="ct-icon" style={{ margin: '0 auto 10px' }}>
                    {c.discount_type === 'percent' ? <Tag size={22} /> : <Ticket size={22} />}
                  </div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                    {c.discount_type === 'percent' ? `${Number(c.discount_value)}% OFF` : `${inr(c.discount_value)} OFF`}
                  </div>
                  <p className="small muted">{c.description}</p>
                  <p className="small muted">
                    Min. order {inr(c.min_order)}{c.max_discount ? ` · up to ${inr(c.max_discount)} off` : ''}
                  </p>
                  <button className="btn btn-dark btn-sm" style={{ marginTop: 12 }} onClick={() => copy(c.code)}>
                    <Copy size={14} /> {c.code}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="muted center">New deals drop every week — check back soon. 🏷️</p>
        )}
      </div>
    </section>
  );
}
