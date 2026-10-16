import { useEffect, useState } from 'react';
import { Ticket, Copy, Tag } from 'lucide-react';
import { api, inr } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Listing from '../../components/Listing';
import { Breadcrumb, Reveal, SectionHead } from '../../components/ui';

export default function OffersPage() {
  const [coupons, setCoupons] = useState([]);
  const toast = useToast();

  useEffect(() => {
    api.coupons().then((d) => setCoupons((d.coupons || []).filter((c) => Number(c.active)))).catch(() => {});
  }, []);

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Coupon ${code} copied!`);
    } catch {
      toast.error('Could not copy — code: ' + code);
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Offers' }]} />
        <h1 className="page-title">Offers &amp; Coupons 🏷️</h1>
        <p className="page-sub">Apply any of these codes at checkout and watch the total drop.</p>
      </div>

      <div className="grid-3" style={{ paddingBottom: 20 }}>
        {coupons.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.07}>
            <div
              className="contact-tile"
              style={{ background: 'linear-gradient(135deg, var(--primary-soft), var(--gold-soft))', borderStyle: 'dashed', flexDirection: 'column', alignItems: 'stretch', textAlign: 'center' }}
            >
              <div className="ct-icon" style={{ margin: '0 auto 10px' }}>
                {c.discount_type === 'percent' ? <Tag size={22} /> : <Ticket size={22} />}
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                {c.discount_type === 'percent' ? `${Number(c.discount_value)}% OFF` : `${inr(c.discount_value)} OFF`}
              </div>
              <p className="small muted">{c.description}</p>
              <p className="small muted">Min. order {inr(c.min_order)}{c.max_discount ? ` · up to ${inr(c.max_discount)} off` : ''}</p>
              <button
                className="btn btn-dark btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => copy(c.code)}
              >
                <Copy size={14} /> {c.code}
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="section tight">
        <SectionHead eyebrow="Deal of the week" title="Biggest Discounts Live Now" sub="Automatic savings — no coupon needed." />
        <Listing baseParams={{ sort: 'discount' }} showControls={false} />
      </section>
      <div style={{ height: 50 }} />
    </div>
  );
}
