import { Star, Truck, HeartHandshake, ShieldCheck } from 'lucide-react';
import { inr } from '../services/api';
import { Reveal } from './ui';

/**
 * Trust & benefits row shown right under the hero.
 * Every figure is drawn from real data (or a clearly-marked placeholder when
 * that data does not exist yet) — nothing here is invented.
 */
export default function TrustBar({ stats = {}, settings = {} }) {
  const avg = Number(stats.avgRating) > 0 ? Number(stats.avgRating) : null;
  const reviews = Number(stats.reviewCount) || 0;
  const customers = Number(stats.customerCount) || 0;
  const orders = Number(stats.paidOrderCount) || 0;
  const charge = settings.delivery_charge;
  const freeAbove = Number(settings.free_delivery_above) || 0;

  const items = [
    {
      icon: Star,
      title: 'Top-Rated Gifts',
      text: avg
        ? `${avg.toFixed(1)}★ average from ${reviews} customer review${reviews === 1 ? '' : 's'}`
        : 'Customer ratings will appear here soon',
    },
    {
      icon: Truck,
      title: 'Gift Delivery',
      text: freeAbove
        ? `Flat ${inr(charge)} delivery · Free above ${inr(freeAbove)}`
        : 'Delivered across India',
    },
    {
      icon: HeartHandshake,
      title: 'Loved by Customers',
      text: customers
        ? `${customers.toLocaleString('en-IN')} customer${customers === 1 ? '' : 's'} · ${orders.toLocaleString('en-IN')} paid order${orders === 1 ? '' : 's'}`
        : 'Be our first happy customer',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Shopping',
      text: 'Secure checkout · UPI, Cards & Netbanking',
    },
  ];

  return (
    <section className="benefits" aria-label="Why shop with Ooha Gifts">
      <div className="container">
        <div className="benefits-grid">
          {items.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="benefit">
                <div className="benefit-icon"><Icon size={22} /></div>
                <div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
